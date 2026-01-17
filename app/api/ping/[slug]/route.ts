import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

const PingSchema = z.object({
  s: z.enum(['ok', 'fail']).optional(),
  m: z.string().max(255).optional(),
  d: z.number().int().positive().max(3600000).optional(), // max 1 hour in ms
  count: z.number().int().min(0).max(1000000).optional(), // reasonable limits
})

// Metadata validation - prevent injection attacks
const MetadataSchema = z.record(
  z.string().max(50), // key max length
  z.union([
    z.string().max(500),
    z.number(),
    z.boolean(),
    z.null()
  ])
).refine(
  (data) => Object.keys(data).length <= 10, // max 10 keys
  { message: 'Too many metadata fields (max 10)' }
)

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

    // Parse payload (from query params or JSON body)
    let payload: any = {}
    if (method === 'GET' || method === 'HEAD') {
      const searchParams = request.nextUrl.searchParams
      if (searchParams.has('s')) payload.s = searchParams.get('s')
      if (searchParams.has('m')) payload.m = searchParams.get('m')
      if (searchParams.has('d')) payload.d = Number(searchParams.get('d'))
      if (searchParams.has('count')) payload.count = Number(searchParams.get('count'))
    } else {
      try {
        const contentType = request.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          const body = await request.json()
          payload = body
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData()
          if (formData.has('s')) payload.s = formData.get('s')
          if (formData.has('m')) payload.m = formData.get('m')
          if (formData.has('d')) payload.d = Number(formData.get('d'))
          if (formData.has('count')) payload.count = Number(formData.get('count'))
        }
      } catch (e) {
        // Ignore parse errors, use defaults
      }
    }

    // Validate payload (max 2KB total)
    const payloadStr = JSON.stringify(payload)
    if (payloadStr.length > 2048) {
      return NextResponse.json(
        { ok: false, error: 'Payload too large (max 2KB)' },
        { status: 400 }
      )
    }

    const validatedPayload = PingSchema.parse(payload)
    const status = validatedPayload.s || 'ok'
    const message = validatedPayload.m || null
    const durationMs = validatedPayload.d || null
    
    // Build and validate metadata
    const metadata: Record<string, string | number | boolean | null> = {}
    if (validatedPayload.count !== undefined) {
      metadata.count = validatedPayload.count
    }

    // Validate metadata structure to prevent injection
    try {
      MetadataSchema.parse(metadata)
    } catch (metadataError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid metadata structure' },
        { status: 400 }
      )
    }

    // Validate payload against monitor's validation rules
    const validationRules = monitor.payload_validation_rules
    const payloadForValidation = {
      s: status,
      m: message || undefined,
      d: durationMs || undefined,
      count: validatedPayload.count,
      ...metadata, // Include metadata fields for validation
    }

    const validationResult = validatePayload(payloadForValidation, validationRules)
    let validationMessage = message

    // If validation failed, mark as failed and include validation errors
    if (!validationResult.valid) {
      const validationErrors = validationResult.errors.join('; ')
      validationMessage = validationMessage
        ? `${validationMessage} | Validation errors: ${validationErrors}`
        : `Validation errors: ${validationErrors}`
    }

    // Determine new monitor status
    let newStatus = monitor.status
    if (status === 'fail' || !validationResult.valid) {
      newStatus = 'failed'
    } else if (monitor.status === 'late' || monitor.status === 'failed') {
      newStatus = 'healthy'
    } else if (monitor.status === 'pending') {
      newStatus = 'healthy'
    }

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

    // Insert ping record (use validation message if validation failed)
    const finalStatus = !validationResult.valid ? 'fail' : status
    const { error: pingError } = await supabaseAdmin.from('pings').insert({
      monitor_id: monitor.id,
      status: finalStatus,
      message: validationMessage,
      duration_ms: durationMs,
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

    // If status changed to healthy from failed/late, trigger recovery alert
    if ((monitor.status === 'late' || monitor.status === 'failed') && newStatus === 'healthy') {
      // Trigger alert asynchronously (don't wait)
      fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          monitor_id: monitor.id,
          alert_type: 'recovered',
        }),
      }).catch((err) => console.error('Error triggering recovery alert:', err))
    }

    return NextResponse.json({
      ok: true,
      monitor: monitor.name,
      status: newStatus,
    })
  } catch (error) {
    console.error('Error handling ping:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid payload', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

