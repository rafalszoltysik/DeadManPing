import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { AdminStats } from '@/components/AdminStats'

async function getStats() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/stats`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch stats')
  }

  return response.json()
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


