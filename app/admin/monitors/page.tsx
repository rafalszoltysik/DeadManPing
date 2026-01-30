import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { AdminMonitorsTable } from '@/components/AdminMonitorsTable'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

async function getMonitors() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: monitors, error } = await supabaseAdmin
    .from('monitors')
    .select(`
      id,
      name,
      slug,
      status,
      expected_interval_seconds,
      last_ping_at,
      created_at,
      workspace_id,
      user_id,
      workspaces:workspace_id (
        name,
        slug
      ),
      profiles:user_id (
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (error) {
    throw new Error('Failed to fetch monitors')
  }

  return (monitors || []).map((monitor: any) => ({
    ...monitor,
    workspace: monitor.workspaces ? (Array.isArray(monitor.workspaces) ? monitor.workspaces[0] : monitor.workspaces) : null,
    user: monitor.profiles ? (Array.isArray(monitor.profiles) ? monitor.profiles[0] : monitor.profiles) : null,
  }))
}

export default async function AdminMonitorsPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/monitors')
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  let monitors
  try {
    monitors = await getMonitors()
  } catch (error) {
    console.error('Error fetching monitors:', error)
    monitors = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Monitors</h1>
        <p className="text-muted-foreground mt-2">View and manage all monitors across all workspaces</p>
      </div>
      <AdminMonitorsTable monitors={monitors} />
    </div>
  )
}


