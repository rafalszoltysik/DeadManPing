import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const TIER_LIMITS = {
  free: {
    monitors: 10,  // Updated from 3
    minInterval: 300, // 5 minutes
    maxMembers: 1,
  },
  starter: {
    monitors: 25,
    minInterval: 300, // 5 minutes
    maxMembers: 1,
  },
  pro: {
    monitors: 100,
    minInterval: 60, // 1 minute
    maxMembers: 3,
  },
  team: {
    monitors: 500,
    minInterval: 30, // 30 seconds
    maxMembers: 10,
  },
} as const

// Legacy support: check by userId (for backward compatibility)
export async function checkMonitorLimit(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  tier: string
}> {
  const supabaseAdmin = getSupabaseAdmin()
  
  // Get user's primary workspace
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id, subscription_tier')
    .eq('owner_id', userId)
    .limit(1)
    .single() as { data: { id: string; subscription_tier?: string } | null }

  if (!workspace) {
    // Fallback to profile if no workspace exists
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single() as { data: { subscription_tier?: string } | null }

    const tier = (profile?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
    const limit = TIER_LIMITS[tier] || TIER_LIMITS.free

    const { count } = await supabaseAdmin
      .from('monitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      allowed: (count || 0) < limit.monitors,
      current: count || 0,
      limit: limit.monitors,
      tier,
    }
  }

  return checkMonitorLimitByWorkspace(workspace.id)
}

// New: check by workspaceId
export async function checkMonitorLimitByWorkspace(workspaceId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  tier: string
  inGracePeriod?: boolean
  gracePeriodEndsAt?: string | null
}> {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('subscription_tier, grace_period_ends_at')
    .eq('id', workspaceId)
    .single() as { data: { subscription_tier?: string; grace_period_ends_at?: string | null } | null }

  const tier = (workspace?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free

  // Count only active monitors (exclude paused ones)
  const { count } = await supabaseAdmin
    .from('monitors')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)
    .neq('status', 'paused')

  const current = count || 0
  
  // Check if grace period is still active
  const now = new Date()
  const gracePeriodEndsAt = workspace?.grace_period_ends_at
  const inGracePeriod = gracePeriodEndsAt 
    ? new Date(gracePeriodEndsAt) > now 
    : false

  // If in grace period, allow creating monitors even if over limit
  // Otherwise, enforce the limit
  const allowed = inGracePeriod ? true : current < limit.monitors

  return {
    allowed,
    current,
    limit: limit.monitors,
    tier,
    inGracePeriod,
    gracePeriodEndsAt: gracePeriodEndsAt || null,
  }
}

export async function checkIntervalLimit(
  userId: string,
  intervalSeconds: number
): Promise<{ allowed: boolean; minInterval: number; tier: string }> {
  const supabaseAdmin = getSupabaseAdmin()
  
  // Get user's primary workspace
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id, subscription_tier')
    .eq('owner_id', userId)
    .limit(1)
    .single() as { data: { id: string; subscription_tier?: string } | null }

  if (!workspace) {
    // Fallback to profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single() as { data: { subscription_tier?: string } | null }

    const tier = (profile?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
    const limit = TIER_LIMITS[tier] || TIER_LIMITS.free

    return {
      allowed: intervalSeconds >= limit.minInterval,
      minInterval: limit.minInterval,
      tier,
    }
  }

  return checkIntervalLimitByWorkspace(workspace.id, intervalSeconds)
}

// New: check interval by workspaceId
export async function checkIntervalLimitByWorkspace(
  workspaceId: string,
  intervalSeconds: number
): Promise<{ allowed: boolean; minInterval: number; tier: string }> {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('subscription_tier')
    .eq('id', workspaceId)
    .single() as { data: { subscription_tier?: string } | null }

  const tier = (workspace?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free

  return {
    allowed: intervalSeconds >= limit.minInterval,
    minInterval: limit.minInterval,
    tier,
  }
}

// Check member limit
export async function checkMemberLimit(workspaceId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  tier: string
}> {
  const supabaseAdmin = getSupabaseAdmin()
  
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('subscription_tier')
    .eq('id', workspaceId)
    .single() as { data: { subscription_tier?: string } | null }

  const tier = (workspace?.subscription_tier || 'free') as keyof typeof TIER_LIMITS
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free

  const { count } = await supabaseAdmin
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  return {
    allowed: (count || 0) < limit.maxMembers,
    current: count || 0,
    limit: limit.maxMembers,
    tier,
  }
}

