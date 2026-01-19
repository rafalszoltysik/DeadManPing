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
  const { data: pings } = await supabaseAdmin
    .from('pings')
    .select('*')
    .eq('monitor_id', monitor.id)
    .order('received_at', { ascending: false })
    .limit(50)

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
        pingUrl={pingUrl}
        isOnboarding={isOnboarding}
        userTier={userTier}
      />
    </AnimatedSection>
  )
}

