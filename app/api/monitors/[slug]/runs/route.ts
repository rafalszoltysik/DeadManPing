/**
 * Job runs history endpoint for start/stop tracking.
 * 
 * Retrieves execution history for a monitor's job runs (start/stop tracking records).
 * Supports filtering by status (running/completed/timeout/failed) and pagination.
 * Verifies user access to monitor before returning data.
 * 
 * Does not create or update runs - only reads execution history.
 */

import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/api/auth'
import { verifyMonitorAccessBySlug } from '@/lib/api/monitors'
import { errorResponse, successResponse } from '@/lib/api/response'
import { JobRun } from '@/lib/types/monitor'

export const dynamic = 'force-dynamic'

/**
 * Fetches job run history for a monitor with optional status filtering.
 * 
 * Returns up to 100 most recent runs, optionally filtered by status.
 * Side effects: DB read (job_runs).
 * 
 * @param request - HTTP request with optional query params: limit, status
 * @param params - Route parameters with monitor slug
 * @returns Response with runs array
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { slug } = await params

    // Verify monitor access
    const accessResult = await verifyMonitorAccessBySlug(slug, authResult.user.id)
    if (!accessResult.success) {
      return accessResult.response
    }

    const monitor = accessResult.monitor
    const supabaseAdmin = getSupabaseAdmin()

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const status = searchParams.get('status')

    // Build query
    let query = supabaseAdmin
      .from('job_runs')
      .select('*')
      .eq('monitor_id', monitor.id)
      .order('started_at', { ascending: false })
      .limit(Math.min(limit, 100)) // Max 100

    // Filter by status if provided
    if (status && ['running', 'completed', 'timeout', 'failed'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data: jobRuns, error: jobRunsError } = await query as { data: any[] | null; error: any }

    if (jobRunsError) {
      console.error('Error fetching job runs:', jobRunsError)
      return errorResponse('Failed to fetch job runs', 500)
    }

    return successResponse({ runs: (jobRuns || []) as JobRun[] })
  } catch (error) {
    console.error('Error in get job runs API:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

