import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

async function getWorkspaces() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: workspaces, error } = await supabaseAdmin
    .from('workspaces')
    .select(`
      id,
      name,
      slug,
      subscription_tier,
      subscription_status,
      created_at,
      owner_id,
      profiles:owner_id (
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch workspaces')
  }

  // Get member counts and monitor counts for each workspace
  const workspacesWithCounts = await Promise.all(
    (workspaces || []).map(async (workspace: any) => {
      const [membersResult, monitorsResult] = await Promise.all([
        supabaseAdmin
          .from('workspace_members')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id),
        supabaseAdmin
          .from('monitors')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id),
      ])

      return {
        ...workspace,
        owner: workspace.profiles ? (Array.isArray(workspace.profiles) ? workspace.profiles[0] : workspace.profiles) : null,
        memberCount: membersResult.count || 0,
        monitorCount: monitorsResult.count || 0,
      }
    })
  )

  return workspacesWithCounts
}

export default async function AdminWorkspacesPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/workspaces')
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  let workspaces
  try {
    workspaces = await getWorkspaces()
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    workspaces = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">All Workspaces</h1>
        <p className="text-muted-foreground mt-2">View and manage all workspaces</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Members</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Monitors</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {workspaces.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No workspaces found
                  </td>
                </tr>
              ) : (
                workspaces.map((workspace: any) => (
                  <tr key={workspace.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{workspace.name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{workspace.owner?.email || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-foreground capitalize">{workspace.subscription_tier}</td>
                    <td className="px-4 py-3 text-sm text-foreground capitalize">{workspace.subscription_status}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{workspace.memberCount}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{workspace.monitorCount}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(workspace.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/dashboard/team?workspace=${workspace.slug}`}
                        className="px-3 py-1 text-xs rounded bg-accent hover:bg-accent/80 text-foreground"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


