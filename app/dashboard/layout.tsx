import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'
import { DashboardNav, DashboardMobileNav } from '@/components/DashboardNav'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ActivityMonitor } from '@/components/ActivityMonitor'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get profile and workspace to check trial status and grace period
  const supabaseAdmin = getSupabaseAdmin()
  
  // Auto-accept pending invitations for this user
  // This handles cases where user logged in normally (not through invitation link)
  // Search by both user_id (if already linked) and email (if not yet linked)
  const { data: pendingInvitations } = await supabaseAdmin
    .from('workspace_members')
    .select('id, workspace_id, user_id, invite_email')
    .or(`user_id.eq.${user.id},invite_email.eq.${user.email?.toLowerCase().trim()}`)
    .eq('status', 'pending') as { data: Array<{ id: string; workspace_id: string; user_id: string | null; invite_email: string | null }> | null }
  
  if (pendingInvitations && pendingInvitations.length > 0) {
    // Accept all pending invitations for this user
    for (const invitation of pendingInvitations) {
      const updateData: {
        status: string
        joined_at: string
        user_id?: string
        invite_email?: string | null
      } = {
        status: 'accepted',
        joined_at: new Date().toISOString(),
      }

      // If user_id is not set, set it and clear invite_email
      if (!invitation.user_id) {
        updateData.user_id = user.id
        updateData.invite_email = null
      }
      // If user_id is already set, just update status
      
      const { error: updateError } = await (supabaseAdmin
        .from('workspace_members') as any)
        .update(updateData)
        .eq('id', invitation.id)
      
      if (updateError) {
        console.error('Error auto-accepting invitation:', updateError, { invitationId: invitation.id, userId: user.id })
      } else {
        console.log('Auto-accepted pending invitation:', { invitationId: invitation.id, workspaceId: invitation.workspace_id, userId: user.id })
      }
    }
  }
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('subscription_status, subscription_tier, created_at, grace_period_ends_at, email_verified')
    .eq('id', user.id)
    .single() as { data: { subscription_status?: string; subscription_tier?: string; created_at?: string; grace_period_ends_at?: string | null; email_verified?: boolean } | null }

  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('grace_period_ends_at, subscription_tier')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle() as { data: { grace_period_ends_at?: string | null; subscription_tier?: string } | null }

  // Use workspace grace_period_ends_at if available, otherwise profile
  const gracePeriodEndsAt = workspace?.grace_period_ends_at || profile?.grace_period_ends_at

  // Calculate trial days remaining
  let trialDaysRemaining: number | null = null
  let isTrialExpired = false
  let gracePeriodDaysRemaining: number | null = null
  let isGracePeriodExpired = false
  
  if (profile?.subscription_status === 'trialing' && profile?.subscription_tier === 'free') {
    const createdDate = profile.created_at ? new Date(profile.created_at) : new Date()
    const trialEndDate = new Date(createdDate)
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial
    
    const now = new Date()
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining > 0) {
      trialDaysRemaining = daysRemaining
    } else {
      isTrialExpired = true
    }
  }

  // Calculate grace period days remaining
  if (gracePeriodEndsAt && profile?.subscription_status === 'free') {
    const now = new Date()
    const graceEndDate = new Date(gracePeriodEndsAt)
    const daysRemaining = Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining > 0) {
      gracePeriodDaysRemaining = daysRemaining
    } else {
      isGracePeriodExpired = true
    }
  }


  return (
    <div className="min-h-screen text-foreground relative">
      <ActivityMonitor timeoutMinutes={30} />
      {/* Sidebar for desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full border-r border-border bg-card">
          <Link href="/dashboard" className="px-6 py-6 border-b border-border flex-shrink-0">
            <span className="font-bold text-2xl whitespace-nowrap">
              <span className="text-foreground">DeadMan</span>
              <span className="text-primary">Ping</span>
            </span>
          </Link>
          <DashboardNav subscriptionTier={workspace?.subscription_tier || profile?.subscription_tier || 'free'} />
          <div className="px-4 py-[9px] border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Top nav for mobile */}
      <nav className="lg:hidden border-b border-border bg-card sticky top-0 z-50">
        <div className="px-4">
          <div className="flex justify-between items-center h-14">
            <Link href="/dashboard" className="flex items-center flex-shrink-0 min-w-0">
              <span className="font-bold text-lg sm:text-xl whitespace-nowrap">
                <span className="text-foreground">DeadMan</span>
                <span className="text-primary">Ping</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <LogoutButton variant="compact" />
            </div>
          </div>
        </div>
        <DashboardMobileNav subscriptionTier={workspace?.subscription_tier || profile?.subscription_tier || 'free'} />
      </nav>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Trial Banner */}
        {trialDaysRemaining !== null && (
          <div className={`w-full border-b ${
            isTrialExpired 
              ? 'bg-error/10 border-error/20' 
              : trialDaysRemaining <= 3
              ? 'bg-warning/10 border-warning/20'
              : 'bg-primary/10 border-primary/20'
          }`}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  {isTrialExpired ? (
                    <p className="text-sm font-medium text-error">
                      Your free trial has ended. <Link href="/dashboard/billing" className="underline hover:no-underline">Upgrade now</Link> to keep all features.
                    </p>
                  ) : trialDaysRemaining <= 3 ? (
                    <p className="text-sm font-medium text-warning">
                      Your free trial ends in {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'}. <Link href="/dashboard/billing" className="underline hover:no-underline">Upgrade now</Link> to keep all features.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-primary">
                      Free trial: {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} remaining. <Link href="/dashboard/billing" className="underline hover:no-underline">Upgrade</Link> to keep all features after trial.
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard/billing"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-smooth ${
                    isTrialExpired
                      ? 'bg-error text-error-foreground hover:bg-error/90'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                >
                  {isTrialExpired ? 'Upgrade Now' : 'Upgrade Plan'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Grace Period Banner */}
        {gracePeriodDaysRemaining !== null && (
          <div className={`w-full border-b ${
            isGracePeriodExpired 
              ? 'bg-error/10 border-error/20' 
              : gracePeriodDaysRemaining <= 2
              ? 'bg-warning/10 border-warning/20'
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex-1">
                  {isGracePeriodExpired ? (
                    <p className="text-sm font-medium text-error">
                      Grace period ended. Some monitors have been paused. <Link href="/dashboard/billing" className="underline hover:no-underline">Upgrade now</Link> to reactivate all monitors.
                    </p>
                  ) : gracePeriodDaysRemaining <= 2 ? (
                    <p className="text-sm font-medium text-warning">
                      Grace period ends in {gracePeriodDaysRemaining} {gracePeriodDaysRemaining === 1 ? 'day' : 'days'}. <Link href="/dashboard/billing" className="underline hover:no-underline">Upgrade now</Link> to keep all monitors active.
                    </p>
                  ) : (
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      Grace period: {gracePeriodDaysRemaining} {gracePeriodDaysRemaining === 1 ? 'day' : 'days'} remaining. All monitors are active, but you'll need to <Link href="/dashboard/billing" className="underline hover:no-underline">upgrade</Link> to keep them after grace period ends.
                    </p>
                  )}
                </div>
                <Link
                  href="/dashboard/billing"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-smooth ${
                    isGracePeriodExpired
                      ? 'bg-error text-error-foreground hover:bg-error/90'
                      : gracePeriodDaysRemaining <= 2
                      ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isGracePeriodExpired ? 'Upgrade Now' : 'Upgrade Plan'}
                </Link>
              </div>
            </div>
          </div>
        )}
        <main className="flex-grow w-full max-w-[1600px] mx-auto py-4 sm:py-6 sm:px-6 lg:px-8 xl:px-12 px-4">
          {children}
        </main>
        <footer className="mt-auto border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} DeadManPing. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link href="/dashboard/settings#support" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Support
                </Link>
                <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Terms
                </Link>
                <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Privacy
                </Link>
                <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Cookies
                </Link>
                <Link href="/legal/opt-out" className="text-sm text-muted-foreground hover:text-foreground transition-smooth">
                  Opt-Out
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
