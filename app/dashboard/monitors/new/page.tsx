import { Suspense } from 'react'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { TIER_LIMITS } from '@/lib/limits'
import { NewMonitorForm } from './NewMonitorForm'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

async function NewMonitorPageContent() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user tier
  const supabaseAdmin = getSupabaseAdmin()
  let userTier: keyof typeof TIER_LIMITS = 'free'
  
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('subscription_tier')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle() as { data: { subscription_tier: string } | null }

  if (workspace && workspace.subscription_tier) {
    const tier = workspace.subscription_tier as keyof typeof TIER_LIMITS
    if (tier in TIER_LIMITS) {
      userTier = tier
    }
  } else {
    // Fallback to profile tier
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle() as { data: { subscription_tier: string } | null }
    
    if (profile?.subscription_tier) {
      const tier = profile.subscription_tier as keyof typeof TIER_LIMITS
      if (tier in TIER_LIMITS) {
        userTier = tier
      }
    }
  }

  return <NewMonitorForm userTier={userTier} />
}

export default function NewMonitorPage() {
  return (
    <Suspense fallback={
      <AnimatedSection className="max-w-2xl mx-auto" delay={0} direction="up" duration={800}>
        <AnimatedItem delay={100} direction="up" duration={700}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">New Monitor</h1>
        </AnimatedItem>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </AnimatedSection>
    }>
      <NewMonitorPageContent />
    </Suspense>
  )
}

