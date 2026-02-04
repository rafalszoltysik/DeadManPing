/**
 * Monitors listing page for user dashboard.
 * 
 * Server component that fetches all monitors for user's workspaces and renders
 * monitor list. Checks monitor limits, displays warnings if exceeded, and shows
 * account linking banner if applicable. Requires authentication.
 * 
 * Does not handle monitor creation - see monitors/new page for that.
 */

import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MonitorList } from '@/components/MonitorList'
import { PlusIcon } from '@/components/Icons'
import { checkMonitorLimitByWorkspace } from '@/lib/limits'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { AccountLinkedBanner } from '@/components/AccountLinkedBanner'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

/**
 * Renders monitors listing page with workspace data.
 * 
 * Fetches monitors from all user's workspaces, checks limits, and displays
 * warnings. Side effects: database queries, limit checks.
 */
export default async function MonitorsPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabaseAdmin = getSupabaseAdmin()
  
  // Get user's workspaces (user can be member of multiple workspaces)
  const { data: workspaceMembers } = await supabaseAdmin
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id) as { data: { workspace_id: string }[] | null }

  const workspaceIds = workspaceMembers?.map(wm => wm.workspace_id) || []

  // If user has no workspace, try to get their owned workspace
  if (workspaceIds.length === 0) {
    const { data: ownedWorkspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single() as { data: { id: string } | null }

    if (ownedWorkspace) {
      workspaceIds.push(ownedWorkspace.id)
    }
  }

  // Fallback: if still no workspace, use user_id (backward compatibility)
  let monitors
  let error

  if (workspaceIds.length > 0) {
    // Fetch monitors from user's workspaces
    const result = await supabaseAdmin
      .from('monitors')
      .select('*')
      .in('workspace_id', workspaceIds)
      .order('status', { ascending: false })
      .order('created_at', { ascending: false }) as { data: any[] | null; error: any }
    
    monitors = result.data
    error = result.error
  } else {
    // Legacy: fetch by user_id
    const result = await supabaseAdmin
      .from('monitors')
      .select('*')
      .eq('user_id', user.id)
      .order('status', { ascending: false })
      .order('created_at', { ascending: false }) as { data: any[] | null; error: any }
    
    monitors = result.data
    error = result.error
  }

  if (error) {
    console.error('Error fetching monitors:', error)
  }

  // Sort: failed/late first, then healthy
  const sortedMonitors = monitors
    ? [...monitors].sort((a, b) => {
        const statusOrder: Record<string, number> = { failed: 0, late: 1, pending: 2, healthy: 3 }
        return (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
      })
    : []

  // Check monitor limit to show warning if over limit
  let monitorLimit: { allowed: boolean; current: number; limit: number; tier: string } | null = null
  if (workspaceIds.length > 0) {
    try {
      monitorLimit = await checkMonitorLimitByWorkspace(workspaceIds[0])
    } catch (error) {
      console.error('Error checking monitor limit:', error)
    }
  }

  const isOverLimit = monitorLimit && monitorLimit.current > monitorLimit.limit

  return (
    <div>
      <AccountLinkedBanner />
      <AnimatedSection delay={0} direction="up" duration={800}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <AnimatedItem delay={100} direction="up" duration={700}>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Monitors</h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Track and manage all your cron job monitors
                {monitorLimit && (
                  <span className="ml-2">
                    ({monitorLimit.current}/{monitorLimit.limit === Infinity ? '∞' : monitorLimit.limit})
                  </span>
                )}
              </p>
            </div>
          </AnimatedItem>
          <AnimatedItem delay={200} direction="up" duration={700}>
            <Link
              href="/dashboard/monitors/new"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-smooth hover-lift-smooth hover-scale flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Monitor</span>
            </Link>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      {/* Warning if over limit */}
      {isOverLimit && monitorLimit && (
        <AnimatedItem delay={300} direction="up" duration={700}>
          <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-lg mb-6 break-words animate-scale-in">
            <p className="font-medium mb-1">
              Monitor limit exceeded
            </p>
            <p className="text-sm">
              You have {monitorLimit.current} monitors, but your {monitorLimit.tier} plan allows only {monitorLimit.limit}. 
              All your monitors will continue to work, but you won't be able to create new ones until you{' '}
              <Link href="/dashboard/billing" className="underline hover:no-underline font-medium">
                upgrade your plan
              </Link>
              {' '}or remove some monitors.
            </p>
          </div>
        </AnimatedItem>
      )}

      {sortedMonitors.length === 0 ? (
        <AnimatedSection delay={300} direction="up" duration={800}>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center hover-lift-smooth">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <h2 className="text-lg sm:text-xl font-semibold mb-2">
                No monitors yet
              </h2>
            </AnimatedItem>
            <AnimatedItem delay={200} direction="up" duration={700}>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base">
                Create your first monitor to start tracking your cron jobs
              </p>
            </AnimatedItem>
            <AnimatedItem delay={300} direction="up" duration={700}>
              <Link
                href="/dashboard/monitors/new?onboarding=true"
                className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-smooth hover-lift-smooth hover-scale text-sm sm:text-base"
              >
                Create Your First Monitor
              </Link>
            </AnimatedItem>
          </div>
        </AnimatedSection>
      ) : (
        <MonitorList monitors={sortedMonitors} />
      )}
    </div>
  )
}

