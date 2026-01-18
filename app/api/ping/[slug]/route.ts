import { NextRequest } from 'next/server'
import { validatePayload } from '@/lib/payload-validator'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { parsePayload, extractDeclaredFields } from '@/lib/payload-parser'
import { errorResponse, successResponse } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return handlePing(request, slug, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return handlePing(request, slug, 'POST')
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return handlePing(request, slug, 'HEAD')
}

async function handlePing(
  request: NextRequest,
  slug: string,
  method: string
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Find monitor by slug
    const { data: monitor, error: monitorError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .eq('slug', slug)
      .single() as { data: any; error: any }

    if (monitorError || !monitor) {
      return errorResponse('Monitor not found', 404)
    }

    // Check if monitor is paused (blocked after grace period)
    if (monitor.status === 'paused') {
      return errorResponse('Monitor is paused. Please upgrade your plan to reactivate it.', 403)
    }

    // Check subscription status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status')
      .eq('id', monitor.user_id)
      .single() as { data: any }

    if (profile?.subscription_status === 'canceled' || profile?.subscription_status === 'past_due') {
      // Grace period: allow pings for 7 days after cancellation
      const { data: canceledProfile } = await supabaseAdmin
        .from('profiles')
        .select('updated_at')
        .eq('id', monitor.user_id)
        .single() as { data: any }

      if (canceledProfile?.updated_at) {
        const canceledDate = new Date(canceledProfile.updated_at)
        const daysSinceCanceled = (Date.now() - canceledDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCanceled > 7) {
          return errorResponse('Subscription expired', 403)
        }
      }
    }

    // Rate limiting: max 1 ping per 10 seconds per monitor
    const rateLimitKey = `monitor:${monitor.id}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, 10000) // 10 seconds window
    
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse payload (user can send any JSON)
    const parseResult = await parsePayload(request, method)
    if (!parseResult.success) {
      return errorResponse(parseResult.error, parseResult.status, parseResult.details)
    }
    const payload = parseResult.payload

    // Get validation rules from monitor
    const validationRules = monitor.payload_validation_rules

    // Extract only declared fields from payload (ignore everything else)
    const declaredFields = extractDeclaredFields(payload, validationRules)

    // Validate payload against monitor's validation rules
    // Only declared fields are validated, rest is ignored
    const validationResult = validatePayload(declaredFields, validationRules)
    
    // Determine new monitor status based on validation
    // OK = cron ran and all rules passed
    // FAIL = cron ran but some rule with severity 'error' failed
    // WARN = cron ran but only rules with severity 'warn' failed (monitor stays healthy)
    // DOWN = cron didn't run (handled by timeout checker)
    let newStatus = monitor.status
    if (!validationResult.valid) {
      // Check if there are any errors (severity 'error') or only warnings (severity 'warn')
      if (validationResult.hasErrors) {
        // At least one field with severity 'error' failed - mark as failed
        newStatus = 'failed'
      } else if (validationResult.hasWarnings) {
        // Only warnings - monitor stays healthy but ping will show as fail/warn
        // Don't change status to failed, but also don't mark as recovered if it was failed/late
        // Only recover if it was already failed/late and we got a ping (even with warnings)
        if (monitor.status === 'late' || monitor.status === 'failed') {
          // Recovered from failed/late state (ping received, even if with warnings)
          newStatus = 'healthy'
        }
        // If already healthy, stay healthy (warnings don't change status)
      }
    } else {
      // All validations passed
      if (monitor.status === 'late' || monitor.status === 'failed') {
        // Recovered from failed/late state
        newStatus = 'healthy'
      } else if (monitor.status === 'pending') {
        // First successful ping
        newStatus = 'healthy'
      }
      // If already healthy and validation passed, stay healthy
    }

    // Calculate next expected ping time
    const currentTime = new Date()
    const nextExpectedPing = new Date(
      currentTime.getTime() + monitor.expected_interval_seconds * 1000 + monitor.grace_period_seconds * 1000
    )

    // Update monitor
    const updateData = {
      status: newStatus,
      last_ping_at: currentTime.toISOString(),
      next_expected_ping_at: nextExpectedPing.toISOString(),
      updated_at: currentTime.toISOString(),
    }
    const { error: updateError } = await (supabaseAdmin
      .from('monitors') as any)
      .update(updateData)
      .eq('id', monitor.id)

    if (updateError) {
      console.error('Error updating monitor:', updateError)
      return errorResponse('Failed to update monitor', 500)
    }

    // Build metadata with only declared field values (for storage)
    // We don't store the entire payload, only the values we validated
    const metadata: Record<string, string | number | boolean | null> = {}
    if (validationRules && validationRules.fields && Array.isArray(validationRules.fields)) {
      for (const field of validationRules.fields) {
        if (declaredFields[field.name] !== undefined) {
          metadata[field.name] = declaredFields[field.name]
        }
      }
    }

    // Build validation message
    let validationMessage: string | null = null
    if (!validationResult.valid && validationResult.errors.length > 0) {
      validationMessage = validationResult.errors.join('; ')
      
      // If only warnings (no errors), prepend message to indicate it's a warning
      if (validationResult.hasWarnings && !validationResult.hasErrors) {
        validationMessage = `[WARNING] ${validationMessage}`
      }
    }

    // Insert ping record
    // Status: 'ok' if validation passed, 'fail' if validation failed
    const pingStatus = validationResult.valid ? 'ok' : 'fail'
    const { error: pingError } = await supabaseAdmin.from('pings').insert({
      monitor_id: monitor.id,
      status: pingStatus,
      message: validationMessage,
      duration_ms: null, // Not used in new model
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      received_at: currentTime.toISOString(),
    } as any)

    if (pingError) {
      console.error('Error inserting ping:', pingError)
      // Don't fail the request if ping insert fails
    }

    // Cleanup old pings (keep last 100 per monitor)
    // Note: This function needs to be created in Supabase
    // For now, we'll do a simple delete query
    try {
      const { data: oldPings } = await supabaseAdmin
        .from('pings')
        .select('id')
        .eq('monitor_id', monitor.id)
        .order('received_at', { ascending: false })
        .range(100, 999999) as { data: any[] | null }

      if (oldPings && oldPings.length > 0) {
        const idsToDelete = oldPings.map((p) => p.id)
        await supabaseAdmin.from('pings').delete().in('id', idsToDelete)
      }
    } catch (cleanupError) {
      // Don't fail the request if cleanup fails
      console.error('Error cleaning up old pings:', cleanupError)
    }

    // Trigger alerts based on status changes
    if (monitor.status !== newStatus) {
      // Status changed - determine alert type
      let alertType: 'failed' | 'recovered' | null = null
      
      if (newStatus === 'failed' && (monitor.status === 'healthy' || monitor.status === 'pending')) {
        // Changed to failed - send failure alert
        alertType = 'failed'
      } else if (newStatus === 'healthy' && (monitor.status === 'late' || monitor.status === 'failed')) {
        // Recovered from failed/late - send recovery alert
        alertType = 'recovered'
      }
      
      if (alertType) {
        // Trigger alert asynchronously (don't wait)
        fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({
            monitor_id: monitor.id,
            alert_type: alertType,
          }),
        }).catch((err) => console.error(`Error triggering ${alertType} alert:`, err))
      }
    }

    return successResponse({
      ok: true,
      monitor: monitor.name,
      status: newStatus,
    })
  } catch (error) {
    console.error('Error handling ping:', error)
    return errorResponse('Internal server error', 500)
  }
}

