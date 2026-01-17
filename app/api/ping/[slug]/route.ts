import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validatePayload } from '@/lib/payload-validator'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Rate limiting: simple in-memory store (for MVP)
// In production, use Redis or similar
const rateLimitStore = new Map<string, number>()

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
    // Find monitor by slug
    const { data: monitor, error: monitorError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .eq('slug', slug)
      .single()

    if (monitorError || !monitor) {
      return NextResponse.json(
        { ok: false, error: 'Monitor not found' },
        { status: 404 }
      )
    }

    // Check if monitor is paused (blocked after grace period)
    if (monitor.status === 'paused') {
      return NextResponse.json(
        { ok: false, error: 'Monitor is paused. Please upgrade your plan to reactivate it.' },
        { status: 403 }
      )
    }

    // Check subscription status
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status')
      .eq('id', monitor.user_id)
      .single()

    if (profile?.subscription_status === 'canceled' || profile?.subscription_status === 'past_due') {
      // Grace period: allow pings for 7 days after cancellation
      const { data: canceledProfile } = await supabaseAdmin
        .from('profiles')
        .select('updated_at')
        .eq('id', monitor.user_id)
        .single()

      if (canceledProfile?.updated_at) {
        const canceledDate = new Date(canceledProfile.updated_at)
        const daysSinceCanceled = (Date.now() - canceledDate.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCanceled > 7) {
          return NextResponse.json(
            { ok: false, error: 'Subscription expired' },
            { status: 403 }
          )
        }
      }
    }

    // Rate limiting: max 1 ping per 10 seconds per monitor
    const rateLimitKey = `monitor:${monitor.id}`
    const lastPing = rateLimitStore.get(rateLimitKey) || 0
    const now = Date.now()
    if (now - lastPing < 10000) {
      return NextResponse.json(
        { ok: false, error: 'Rate limit exceeded' },
        { status: 429 }
      )
    }
    rateLimitStore.set(rateLimitKey, now)

    // Parse payload (user can send any JSON)
    let payload: any = {}
    if (method === 'GET' || method === 'HEAD') {
      // For GET/HEAD, parse query params as JSON-like structure
      const searchParams = request.nextUrl.searchParams
      searchParams.forEach((value, key) => {
        // Try to parse as number or boolean, otherwise keep as string
        if (value === 'true') payload[key] = true
        else if (value === 'false') payload[key] = false
        else if (!isNaN(Number(value)) && value !== '') payload[key] = Number(value)
        else payload[key] = value
      })
    } else {
      try {
        const contentType = request.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          // Try to read body as text first to handle parsing errors better
          const bodyText = await request.text()
          if (bodyText.trim()) {
            try {
              payload = JSON.parse(bodyText)
            } catch (parseError) {
              console.error('JSON parse error:', parseError, 'Body:', bodyText)
              return NextResponse.json(
                { ok: false, error: 'Invalid JSON payload', details: parseError instanceof Error ? parseError.message : 'Parse error' },
                { status: 400 }
              )
            }
          }
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          formData.forEach((value, key) => {
            const strValue = value.toString()
            if (strValue === 'true') payload[key] = true
            else if (strValue === 'false') payload[key] = false
            else if (!isNaN(Number(strValue)) && strValue !== '') payload[key] = Number(strValue)
            else payload[key] = strValue
          })
        }
      } catch (e) {
        // If request reading fails, return error
        console.error('Error reading request body:', e)
        return NextResponse.json(
          { ok: false, error: 'Invalid request body', details: e instanceof Error ? e.message : 'Unknown error' },
          { status: 400 }
        )
      }
    }

    // Validate payload size (max 2KB total)
    const payloadStr = JSON.stringify(payload)
    if (payloadStr.length > 2048) {
      return NextResponse.json(
        { ok: false, error: 'Payload too large (max 2KB)' },
        { status: 400 }
      )
    }

    // Get validation rules from monitor
    const validationRules = monitor.payload_validation_rules

    // Extract only declared fields from payload (ignore everything else)
    const declaredFields: Record<string, any> = {}
    if (validationRules && validationRules.fields && Array.isArray(validationRules.fields)) {
      for (const field of validationRules.fields) {
        if (payload[field.name] !== undefined) {
          declaredFields[field.name] = payload[field.name]
        }
      }
    }

    // Validate payload against monitor's validation rules
    // Only declared fields are validated, rest is ignored
    const validationResult = validatePayload(declaredFields, validationRules)
    
    // Determine new monitor status based on validation
    // OK = cron ran and all rules passed
    // FAIL = cron ran but some rule failed
    // DOWN = cron didn't run (handled by timeout checker)
    let newStatus = monitor.status
    if (!validationResult.valid) {
      // Validation failed - mark as failed
      newStatus = 'failed'
    } else if (monitor.status === 'late' || monitor.status === 'failed') {
      // Recovered from failed/late state
      newStatus = 'healthy'
    } else if (monitor.status === 'pending') {
      // First successful ping
      newStatus = 'healthy'
    }
    // If already healthy and validation passed, stay healthy

    // Calculate next expected ping time
    const currentTime = new Date()
    const nextExpectedPing = new Date(
      currentTime.getTime() + monitor.expected_interval_seconds * 1000 + monitor.grace_period_seconds * 1000
    )

    // Update monitor
    const { error: updateError } = await supabaseAdmin
      .from('monitors')
      .update({
        status: newStatus,
        last_ping_at: currentTime.toISOString(),
        next_expected_ping_at: nextExpectedPing.toISOString(),
        updated_at: currentTime.toISOString(),
      })
      .eq('id', monitor.id)

    if (updateError) {
      console.error('Error updating monitor:', updateError)
      return NextResponse.json(
        { ok: false, error: 'Failed to update monitor' },
        { status: 500 }
      )
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
    })

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
        .range(100, 999999)

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

    return NextResponse.json({
      ok: true,
      monitor: monitor.name,
      status: newStatus,
    })
  } catch (error) {
    console.error('Error handling ping:', error)
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

