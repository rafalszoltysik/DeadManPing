import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
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

async function getWorkspaceMembers(workspaceId: string) {
  const { data: members } = await supabaseAdmin
    .from('workspace_members')
    .select(`
      id,
      role,
      status,
      invited_at,
      joined_at,
      invite_email,
      profiles:user_id (
        id,
        email
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('invited_at', { ascending: false })

  // Transform the data to match the Member interface
  // Supabase returns profiles as an array, but we need a single object or null
  return (members || []).map((member: any) => ({
    ...member,
    profiles: Array.isArray(member.profiles) 
      ? (member.profiles.length > 0 ? member.profiles[0] : null)
      : member.profiles
  }))
}

export default async function TeamPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user's profile and workspace
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription_tier, email')
    .eq('id', user.id)
    .single()

  // First, try to get workspace where user is owner
  let { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id, subscription_tier, max_members')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  // If user is not an owner, check if they're a member of any workspace
  if (!workspace) {
    const { data: workspaceMember } = await supabaseAdmin
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .eq('status', 'accepted')
      .limit(1)
      .maybeSingle()

    if (workspaceMember) {
      // Get the workspace they're a member of
      const { data: memberWorkspace } = await supabaseAdmin
        .from('workspaces')
        .select('id, subscription_tier, max_members')
        .eq('id', workspaceMember.workspace_id)
        .maybeSingle()
      
      if (memberWorkspace) {
        workspace = memberWorkspace
      }
    }
  }

  // Normalize subscription tier to lowercase and use profile as source of truth
  const profileTier = (profile?.subscription_tier || 'free').toLowerCase()
  const workspaceTier = workspace?.subscription_tier?.toLowerCase() || 'free'
  
  // Use profile tier as source of truth, but sync to workspace if different
  const subscriptionTier = profileTier
  
  // Auto-sync subscription_tier from profile to workspace if they differ
  // This handles cases where user manually updated profile in database
  if (workspace && profileTier !== workspaceTier && ['pro', 'team'].includes(profileTier)) {
    const maxMembers = profileTier === 'team' ? 10 : profileTier === 'pro' ? 3 : 1
    await supabaseAdmin
      .from('workspaces')
      .update({
        subscription_tier: profileTier,
        max_members: maxMembers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspace.id)
    
    // Refresh workspace data after update
    const { data: updatedWorkspace } = await supabaseAdmin
      .from('workspaces')
      .select('id, subscription_tier, max_members')
      .eq('id', workspace.id)
      .single()
    
    if (updatedWorkspace) {
      workspace = updatedWorkspace
    }
  }
  
  // Create workspace if it doesn't exist and user has Pro/Team plan
  if (!workspace && ['pro', 'team'].includes(profileTier)) {
    const maxMembers = profileTier === 'team' ? 10 : 3
    const { data: newWorkspace, error: createError } = await supabaseAdmin
      .from('workspaces')
      .insert({
        name: `${profile?.email || 'User'}'s Workspace`,
        slug: 'workspace-' + user.id,
        owner_id: user.id,
        subscription_tier: profileTier,
        max_members: maxMembers,
      })
      .select('id, subscription_tier, max_members')
      .single()
    
    if (!createError && newWorkspace) {
      // Create workspace member entry
      await supabaseAdmin
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })
      
      workspace = newWorkspace
    }
  }
  
  // Check if plan supports team members (Pro: 3, Team: 10)
  const supportsMembers = ['pro', 'team'].includes(subscriptionTier)

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
      ) : !workspace ? (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-warning mb-2">Workspace required</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You need to have a workspace to manage team members. Please upgrade to Pro or Team plan to create a workspace.
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
          subscriptionTier={subscriptionTier}
          maxMembers={workspace.max_members}
          initialMembers={await getWorkspaceMembers(workspace.id)}
        />
      )}
    </div>
  )
}


