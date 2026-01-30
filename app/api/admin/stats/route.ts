import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get all stats in parallel
    const [
      usersResult,
      monitorsResult,
      workspacesResult,
      subscriptionsResult,
      todayUsersResult,
      weekUsersResult,
      monthUsersResult,
    ] = await Promise.all([
      // Total users
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true }),
      
      // Total monitors
      supabaseAdmin
        .from('monitors')
        .select('id, status', { count: 'exact' }),
      
      // Total workspaces
      supabaseAdmin
        .from('workspaces')
        .select('id', { count: 'exact', head: true }),
      
      // Subscriptions by tier
      supabaseAdmin
        .from('workspaces')
        .select('subscription_tier, subscription_status'),
      
      // New users today
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      
      // New users this week
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      
      // New users this month
      supabaseAdmin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Process monitor stats
    const monitors = monitorsResult.data || []
    const monitorStats = {
      total: monitorsResult.count || 0,
      healthy: monitors.filter((m: any) => m.status === 'healthy').length,
      late: monitors.filter((m: any) => m.status === 'late').length,
      failed: monitors.filter((m: any) => m.status === 'failed').length,
      pending: monitors.filter((m: any) => m.status === 'pending').length,
    }

    // Process subscription stats
    const subscriptions = subscriptionsResult.data || []
    const subscriptionStats = {
      free: subscriptions.filter((s: any) => s.subscription_tier === 'free').length,
      starter: subscriptions.filter((s: any) => s.subscription_tier === 'starter').length,
      pro: subscriptions.filter((s: any) => s.subscription_tier === 'pro').length,
      team: subscriptions.filter((s: any) => s.subscription_tier === 'team').length,
      active: subscriptions.filter((s: any) => s.subscription_status === 'active').length,
      trialing: subscriptions.filter((s: any) => s.subscription_status === 'trialing').length,
      canceled: subscriptions.filter((s: any) => s.subscription_status === 'canceled').length,
      past_due: subscriptions.filter((s: any) => s.subscription_status === 'past_due').length,
    }

    return NextResponse.json({
      users: {
        total: usersResult.count || 0,
        newToday: todayUsersResult.count || 0,
        newThisWeek: weekUsersResult.count || 0,
        newThisMonth: monthUsersResult.count || 0,
      },
      monitors: monitorStats,
      workspaces: {
        total: workspacesResult.count || 0,
      },
      subscriptions: subscriptionStats,
    })
  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


