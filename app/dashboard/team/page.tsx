import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { TeamMembers } from '@/components/TeamMembers'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export default async function TeamPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/auth/login')
  }

  // Get user's workspace
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id, subscription_tier, max_members')
    .eq('owner_id', session.userId)
    .limit(1)
    .single()

  if (!workspace) {
    redirect('/dashboard')
  }

  // Check if plan supports team members (Pro: 3, Team: 10)
  const supportsMembers = ['pro', 'team'].includes(workspace.subscription_tier)

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage team members and their access to your workspace
        </p>
      </div>

      {!supportsMembers ? (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-warning mb-2">Team members not available</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Team collaboration is available on Pro (3 members) and Team (10 members) plans.
          </p>
          <a
            href="/dashboard/billing"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth text-sm font-medium"
          >
            Upgrade Plan
          </a>
        </div>
      ) : (
        <TeamMembers 
          workspaceId={workspace.id}
          subscriptionTier={workspace.subscription_tier}
          maxMembers={workspace.max_members}
        />
      )}
    </div>
  )
}


