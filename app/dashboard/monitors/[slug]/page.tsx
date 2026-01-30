import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { MonitorDetail } from '@/components/MonitorDetail'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyMonitorAccessBySlug } from '@/lib/api/monitors'
import { AnimatedSection } from '@/components/AnimatedSection'

export default async function MonitorDetailPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ onboarding?: string }>
}) {
  // Unwrap params immediately to avoid React serialization issues
  const params = await props.params
  const searchParams = await props.searchParams
  const { slug } = params
  const resolvedSearchParams = searchParams
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify monitor access (checks workspace membership)
  const accessResult = await verifyMonitorAccessBySlug(slug, user.id)
  
  if (!accessResult.success) {
    redirect('/dashboard')
  }

  const monitor = accessResult.monitor

  const supabaseAdmin = getSupabaseAdmin()
  const { data: pingsData } = await supabaseAdmin
    .from('pings')
    .select('*')
    .eq('monitor_id', monitor.id)
    .order('received_at', { ascending: false })
    .limit(50)

  // Convert database types to component types
  const pings = (pingsData || []).map(ping => ({
    ...ping,
    status: ping.status as 'ok' | 'fail', // Type assertion - database constraint ensures 'ok' | 'fail'
    received_at: ping.received_at || new Date().toISOString(), // Ensure received_at is not null
    metadata: (ping.metadata && typeof ping.metadata === 'object' && !Array.isArray(ping.metadata))
      ? ping.metadata as Record<string, any>
      : null, // Convert Json to Record<string, any> | null
  }))

  // Get job runs
  const { data: jobRunsData } = await supabaseAdmin
    .from('job_runs')
    .select('*')
    .eq('monitor_id', monitor.id)
    .order('started_at', { ascending: false })
    .limit(50)

  // Convert database types to component types
  const jobRuns = (jobRunsData || []).map(run => ({
    ...run,
    status: run.status as 'running' | 'completed' | 'timeout' | 'failed', // Type assertion - database constraint ensures these values
    metadata: (run.metadata && typeof run.metadata === 'object' && !Array.isArray(run.metadata))
      ? run.metadata as Record<string, any>
      : null, // Convert Json to Record<string, any> | null
    created_at: run.created_at || new Date().toISOString(), // Ensure created_at is not null
    updated_at: run.updated_at || new Date().toISOString(), // Ensure updated_at is not null
  }))

  // Get user tier
  let userTier = 'free'
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('subscription_tier')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle() as { data: { subscription_tier: string } | null }

  if (workspace) {
    userTier = workspace.subscription_tier
  } else {
    // Fallback to profile tier
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle() as { data: { subscription_tier: string } | null }
    
    userTier = profile?.subscription_tier || 'free'
  }

  const isOnboarding = resolvedSearchParams.onboarding === 'true'
  const pingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ping/${monitor.slug}`

  return (
    <AnimatedSection delay={0} direction="up" duration={800}>
      <MonitorDetail
        monitor={monitor}
        pings={pings || []}
        jobRuns={jobRuns || []}
        pingUrl={pingUrl}
        isOnboarding={isOnboarding}
        userTier={userTier}
      />
    </AnimatedSection>
  )
}

