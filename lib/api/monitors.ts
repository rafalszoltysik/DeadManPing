import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { Monitor } from '@/lib/types/monitor'

/**
 * Verify that a user has access to a monitor (either owns it or is workspace member)
 * Returns the monitor if access is granted, or an error response
 */
export async function verifyMonitorAccess(
  monitorId: string,
  userId: string
): Promise<
  | { success: true; monitor: Monitor }
  | { success: false; response: NextResponse }
> {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: monitor, error: monitorError } = await supabaseAdmin
    .from('monitors')
    .select('*')
    .eq('id', monitorId)
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
 * Verify that a user has access to a monitor by slug
 * Returns the monitor if access is granted, or an error response
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
 * Check optimistic locking: verify that monitor hasn't been modified since expectedUpdatedAt
 * Returns true if update is safe, false if conflict detected
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

