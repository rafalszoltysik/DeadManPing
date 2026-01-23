import { NextRequest } from 'next/server'
import { validatePayload } from '@/lib/payload-validator'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { parsePayload, extractDeclaredFields } from '@/lib/payload-parser'
import { errorResponse, successResponse } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureFirstSuccessPing, captureHeartbeatRecovered } from '@/lib/posthog/server'
import { captureBackendError, captureApiError, captureSoftError } from '@/lib/sentry/server'

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

    // Extract run_id from query params or payload (for job run tracking)
    const searchParams = request.nextUrl.searchParams
    let runId: string | null = searchParams.get('run_id')
    
    // Parse payload (user can send any JSON)
    const parseResult = await parsePayload(request, method)
    if (!parseResult.success) {
      return errorResponse(parseResult.error, parseResult.status, parseResult.details)
    }
    const payload = parseResult.payload
    
    // If run_id not in query params, check payload
    if (!runId && payload && typeof payload === 'object' && 'run_id' in payload) {
      runId = payload.run_id as string
    }

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
          
          // Track recovery (even with warnings, it's still a recovery)
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('created_at')
            .eq('id', monitor.user_id)
            .single() as { data: { created_at: string } | null }
          
          if (profile) {
            const currentTime = new Date()
            const lastPingAt = monitor.last_ping_at ? new Date(monitor.last_ping_at) : null
            const expectedAt = monitor.next_expected_ping_at ? new Date(monitor.next_expected_ping_at) : new Date()
            const downtimeSeconds = lastPingAt 
              ? Math.floor((currentTime.getTime() - lastPingAt.getTime()) / 1000)
              : Math.floor((currentTime.getTime() - expectedAt.getTime()) / 1000)
            
            await captureHeartbeatRecovered(monitor.user_id, {
              heartbeat_id: monitor.id,
              downtime_seconds: downtimeSeconds,
            })
          }
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

    // Track first success ping and recovery events
    const isFirstSuccessPing = monitor.status === 'pending' && newStatus === 'healthy'
    const isRecovery = (monitor.status === 'late' || monitor.status === 'failed') && newStatus === 'healthy'
    
    if (isFirstSuccessPing || isRecovery) {
      // Get user's created_at to calculate seconds_from_signup
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('created_at')
        .eq('id', monitor.user_id)
        .single() as { data: { created_at: string } | null }
      
      if (profile) {
        const userCreatedAt = new Date(profile.created_at)
        const currentTime = new Date()
        const secondsFromSignup = Math.floor((currentTime.getTime() - userCreatedAt.getTime()) / 1000)
        
        if (isFirstSuccessPing) {
          await captureFirstSuccessPing(monitor.user_id, {
            heartbeat_id: monitor.id,
            seconds_from_signup: secondsFromSignup,
          })
        }
        
        if (isRecovery) {
          // Calculate downtime in seconds
          const lastPingAt = monitor.last_ping_at ? new Date(monitor.last_ping_at) : null
          const expectedAt = monitor.next_expected_ping_at ? new Date(monitor.next_expected_ping_at) : new Date()
          const downtimeSeconds = lastPingAt 
            ? Math.floor((currentTime.getTime() - lastPingAt.getTime()) / 1000)
            : Math.floor((currentTime.getTime() - expectedAt.getTime()) / 1000)
          
          await captureHeartbeatRecovered(monitor.user_id, {
            heartbeat_id: monitor.id,
            downtime_seconds: downtimeSeconds,
          })
        }
      }
    }

    // Calculate next expected ping time
    const currentTime = new Date()
    
    // Handle job run completion if run_id is provided
    let jobRunDurationMs: number | null = null
    if (runId) {
      try {
        // Find the corresponding job run
        const { data: jobRun, error: jobRunError } = await supabaseAdmin
          .from('job_runs')
          .select('*')
          .eq('monitor_id', monitor.id)
          .eq('run_id', runId)
          .single() as { data: any; error: any }
        
        if (!jobRunError && jobRun && jobRun.status === 'running') {
          // Calculate duration
          const startedAt = new Date(jobRun.started_at)
          jobRunDurationMs = Math.floor(currentTime.getTime() - startedAt.getTime())
          
          // Determine job run status based on validation result
          const jobRunStatus = validationResult.valid ? 'completed' : 'failed'
          
          // Update job run
          const { error: updateJobRunError } = await (supabaseAdmin
            .from('job_runs') as any)
            .update({
              status: jobRunStatus,
              completed_at: currentTime.toISOString(),
              duration_ms: jobRunDurationMs,
              updated_at: currentTime.toISOString(),
            })
            .eq('id', jobRun.id)
          
          if (updateJobRunError) {
            console.error('Error updating job run:', updateJobRunError)
            // Don't fail the request, just log the error
            captureBackendError(updateJobRunError, {
              endpoint: `/api/ping/${slug}`,
              statusCode: 500,
              action: 'update_job_run',
              additionalData: {
                monitorId: monitor.id,
                runId: runId,
              },
            })
          }
        }
        // If job run doesn't exist or is not in 'running' status, ignore (backward compatibility)
      } catch (jobRunError) {
        console.error('Error handling job run completion:', jobRunError)
        // Don't fail the request if job run handling fails
      }
    }
    
    // Check if ping is late (soft error - not a bug, but UX issue)
    if (monitor.last_ping_at) {
      const lastPingAt = new Date(monitor.last_ping_at)
      const expectedPingTime = new Date(
        lastPingAt.getTime() + monitor.expected_interval_seconds * 1000
      )
      const delaySeconds = Math.floor((currentTime.getTime() - expectedPingTime.getTime()) / 1000)
      
      // If ping is more than 10% late, track as soft error
      if (delaySeconds > monitor.expected_interval_seconds * 0.1) {
        captureSoftError('ping_too_late', {
          userId: monitor.user_id,
          heartbeatId: monitor.id,
          monitorId: monitor.id,
          delaySeconds,
          expectedIntervalSeconds: monitor.expected_interval_seconds,
        })
      }
    }
    
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
      captureBackendError(updateError, {
        endpoint: `/api/ping/${slug}`,
        statusCode: 500,
        action: 'update_monitor',
        additionalData: {
          monitorId: monitor.id,
          userId: monitor.user_id,
        },
      })
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
    // Use job run duration if available, otherwise null
    const pingDurationMs = jobRunDurationMs !== null ? jobRunDurationMs : null
    const { error: pingError } = await supabaseAdmin.from('pings').insert({
      monitor_id: monitor.id,
      status: pingStatus,
      message: validationMessage,
      duration_ms: pingDurationMs,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      received_at: currentTime.toISOString(),
    } as any)

    if (pingError) {
      console.error('Error inserting ping:', pingError)
      // Track as soft error - ping insert failed but request succeeded
      captureBackendError(pingError, {
        endpoint: `/api/ping/${slug}`,
        statusCode: 500,
        action: 'insert_ping',
        userId: monitor.user_id,
        additionalData: {
          monitorId: monitor.id,
        },
      })
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
    captureBackendError(error, {
      endpoint: `/api/ping/${slug}`,
      statusCode: 500,
      action: 'handle_ping',
    })
    return errorResponse('Internal server error', 500)
  }
}

