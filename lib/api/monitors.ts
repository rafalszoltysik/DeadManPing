/**
 * Monitor access control and optimistic locking utilities.
 * 
 * Provides functions for verifying user access to monitors (workspace membership
 * or ownership) and optimistic locking to prevent concurrent modification conflicts.
 * Used by monitor update/delete endpoints.
 * 
 * Does not handle monitor creation - see monitors/create route.
 */

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Monitor } from '@/lib/types/monitor'

/**
 * Verifies user has access to monitor by slug identifier.
 * 
 * Checks workspace membership first, falls back to direct ownership (legacy).
 * Returns monitor object on success or error response on failure.
 * 
 * @param slug - Monitor slug identifier
 * @param userId - User identifier
 * @returns Monitor object on success, error response on failure
 */
export async function verifyMonitorAccessBySlug(
  slug: string,
  userId: string
): Promise<
  | { success: true; monitor: Monitor }
  | { success: false; response: NextResponse }
> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: monitor, error: monitorError } = await supabaseAdmin
    .from('monitors')
    .select('*')
    .eq('slug', slug)
    .single() as { data: any; error: any }

  if (monitorError || !monitor) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Monitor not found' }, { status: 404 }),
    }
  }

  // Verify workspace membership
  if (monitor.workspace_id) {
    const { data: member } = await supabaseAdmin
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', monitor.workspace_id)
      .eq('user_id', userId)
      .single() as { data: { id: string } | null }

    if (!member) {
      // Check if user is workspace owner
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('owner_id')
        .eq('id', monitor.workspace_id)
        .single() as { data: { owner_id: string } | null }

      if (!workspace || workspace.owner_id !== userId) {
        return {
          success: false,
          response: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
        }
      }
    }
  } else {
    // Legacy: check user_id directly
    if (monitor.user_id !== userId) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }),
      }
    }
  }

  return {
    success: true,
    monitor: monitor as Monitor,
  }
}

/**
 * Checks optimistic locking to prevent concurrent modification conflicts.
 * 
 * Compares expected updated_at timestamp with current value. Returns conflict
 * with latest monitor data if modified by another process (more than 1 second difference).
 * 
 * @param monitorId - Monitor identifier
 * @param expectedUpdatedAt - Expected updated_at timestamp from client
 * @returns Conflict status with latest monitor data if conflict detected
 */
export async function checkOptimisticLock(
  monitorId: string,
  expectedUpdatedAt: string | undefined
): Promise<
  | { conflict: false }
  | { conflict: true; latestMonitor: Monitor }
> {
  if (!expectedUpdatedAt) {
    return { conflict: false }
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: currentMonitor } = await supabaseAdmin
    .from('monitors')
    .select('updated_at')
    .eq('id', monitorId)
    .single() as { data: { updated_at: string } | null }

  if (currentMonitor) {
    const expectedTime = new Date(expectedUpdatedAt).getTime()
    const currentTime = new Date(currentMonitor.updated_at).getTime()

    if (Math.abs(currentTime - expectedTime) > 1000) {
      // Monitor was updated by someone else (more than 1 second difference)
      // Fetch latest version and return conflict
      const { data: latestMonitor } = await supabaseAdmin
        .from('monitors')
        .select('*')
        .eq('id', monitorId)
        .single() as { data: any | null }

      if (latestMonitor) {
        return {
          conflict: true,
          latestMonitor: latestMonitor as Monitor,
        }
      }
    }
  }

  return { conflict: false }
}

