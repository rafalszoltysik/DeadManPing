/**
 * New monitor creation page.
 * 
 * Server component that fetches user tier (workspace or profile) and renders
 * monitor creation form. Redirects unauthenticated users to login. Tier is
 * used to enforce limits in the form component.
 * 
 * Does not handle form submission - delegated to NewMonitorForm client component.
 */

import { Suspense } from 'react'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { TIER_LIMITS } from '@/lib/limits'
import { NewMonitorForm } from './NewMonitorForm'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

/**
 * Fetches user tier and renders monitor creation form.
 * 
 * Checks workspace tier first, falls back to profile tier. Side effects:
 * database queries for workspace and profile.
 */
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
      <div>
        <div className="mb-4 sm:mb-6">
          <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-0">
          <div className="h-8 sm:h-9 w-48 sm:w-64 bg-muted rounded animate-pulse mb-4 sm:mb-6"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-48 bg-muted rounded animate-pulse mt-2"></div>
              </div>
              <div>
                <div className="h-4 w-32 bg-muted rounded animate-pulse mb-3"></div>
                <div className="h-12 bg-muted rounded-lg animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-28 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-20 bg-muted rounded animate-pulse"></div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-4">
                <div className="h-11 sm:h-9 w-full sm:w-auto bg-muted rounded-lg animate-pulse"></div>
                <div className="h-11 sm:h-9 w-full sm:w-auto bg-muted rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <NewMonitorPageContent />
    </Suspense>
  )
}

