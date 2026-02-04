/**
 * Start tracking endpoint for job execution monitoring.
 * 
 * Creates a job run record when a cron job begins execution, enabling duration tracking
 * and timeout detection. Returns a run_id that must be sent with the completion ping.
 * Integrates with Supabase for persistence and rate limiting for abuse prevention.
 * 
 * Does not validate payload or monitor status - only creates tracking record.
 */

import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { errorResponse, successResponse } from '@/lib/api/response'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureBackendError } from '@/lib/sentry/server'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

/**
 * Creates a new job run tracking record for start/stop monitoring.
 * 
 * Validates monitor exists and subscription is active, then creates a job_runs record
 * with status 'running'. Returns run_id for use in completion ping.
 * Side effects: DB insert (job_runs), rate limit check.
 * 
 * @param request - HTTP request with optional body containing run_id and metadata
 * @param params - Route parameters with monitor slug
 * @returns Response with run_id for tracking
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
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

    // Check if monitor is paused
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

    // Rate limiting: max 1 start per 10 seconds per monitor (same as ping)
    const rateLimitKey = `monitor:${monitor.id}`
    const rateLimitResult = await checkRateLimit(rateLimitKey, 10000) // 10 seconds window
    
    if (!rateLimitResult.allowed) {
      return errorResponse('Rate limit exceeded', 429)
    }

    // Parse request body for optional run_id and metadata
    let runId: string | null = null
    let metadata: Record<string, any> | null = null

    try {
      const body = await request.json().catch(() => ({}))
      runId = body.run_id || null
      metadata = body.metadata || null
    } catch {
      // Body is optional, continue with defaults
    }

    // Generate run_id if not provided
    if (!runId) {
      runId = randomUUID()
    }

    // Validate run_id format (should be UUID-like)
    if (typeof runId !== 'string' || runId.length < 8) {
      return errorResponse('Invalid run_id format', 400)
    }

    const currentTime = new Date()

    // Insert job run record
    const { data: jobRun, error: insertError } = await (supabaseAdmin
      .from('job_runs') as any)
      .insert({
        monitor_id: monitor.id,
        run_id: runId,
        started_at: currentTime.toISOString(),
        completed_at: null,
        status: 'running',
        duration_ms: null,
        metadata: metadata,
      })
      .select()
      .single() as { data: any; error: any }

    if (insertError) {
      // Check if it's a unique constraint violation (duplicate run_id)
      if (insertError.code === '23505') {
        return errorResponse('Run ID already exists for this monitor', 409)
      }

      console.error('Error inserting job run:', insertError)
      captureBackendError(insertError, {
        endpoint: `/api/ping/${slug}/start`,
        statusCode: 500,
        action: 'insert_job_run',
        additionalData: {
          monitorId: monitor.id,
          userId: monitor.user_id,
        },
      })
      return errorResponse('Failed to create job run', 500)
    }

    return successResponse({
      ok: true,
      run_id: runId,
    })
  } catch (error) {
    console.error('Error handling start signal:', error)
    captureBackendError(error, {
      endpoint: `/api/ping/[slug]/start`,
      statusCode: 500,
      action: 'handle_start',
    })
    return errorResponse('Internal server error', 500)
  }
}

