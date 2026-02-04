/**
 * Admin dashboard page with system statistics.
 * 
 * Server component that fetches system-wide statistics (users, monitors,
 * workspaces, subscriptions) and renders admin dashboard. Requires admin
 * authentication. Displays key metrics and trends.
 * 
 * Does not handle user/monitor management - see admin/users and admin/monitors.
 */

import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { AdminStats } from '@/components/AdminStats'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Fetches system-wide statistics for admin dashboard.
 * 
 * Queries users, monitors, workspaces, and subscriptions in parallel.
 * Side effects: database queries (multiple tables).
 */
async function getStats() {
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

  return {
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
  }
}

export default async function AdminDashboardPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  let stats
  try {
    stats = await getStats()
  } catch (error) {
    console.error('Error fetching stats:', error)
    stats = {
      users: { total: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0 },
      monitors: { total: 0, healthy: 0, late: 0, failed: 0, pending: 0 },
      workspaces: { total: 0 },
      subscriptions: { free: 0, starter: 0, pro: 0, team: 0, active: 0, trialing: 0, canceled: 0, past_due: 0 },
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Platform overview and statistics</p>
      </div>
      <AdminStats stats={stats} />
    </div>
  )
}


