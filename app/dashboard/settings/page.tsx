import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/SettingsForm'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'

export default async function SettingsPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Use admin client to fetch profile (bypasses RLS)
  // We verify ownership by checking id matches user
  const supabaseAdmin = getSupabaseAdmin()
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle() as { data: any; error: any }

  // If profile doesn't exist, try to create it
  if (!profile && (!profileError || profileError.code === 'PGRST116')) {
    const { data: newProfile, error: insertError } = await (supabaseAdmin
      .from('profiles') as any)
      .insert({
        id: user.id,
        email: user.email,
        email_verified: !!user.email_confirmed_at,
        subscription_tier: 'free',
        subscription_status: 'trialing',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating profile:', insertError)
      redirect('/dashboard')
    } else {
      profile = newProfile
    }
  }

  if (!profile) {
    console.error('Error fetching profile:', profileError)
    redirect('/dashboard')
  }

  // Verify ownership - user can only access their own profile
  if (profile.id !== user.id) {
    console.error('Access denied: Profile belongs to different user')
    redirect('/dashboard')
  }

  // Check if user has Stripe customer ID (portal URL will be created on-demand via API)
  const hasStripeCustomer = !!profile.stripe_customer_id

  // Get workspace currency preference
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('currency')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle() as { data: { currency?: string } | null }
  
  const currency = (workspace?.currency || 'usd') as 'usd' | 'eur' | 'pln'

  // Check password and Google connection status
  // Use admin client to get full user info with identities
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(user.id)
  
  // Check if user has password (email provider in identities)
  const hasPassword = authUser?.user?.identities?.some(
    (identity: any) => identity.provider === 'email'
  ) || false

  // Check if user has Google connection
  const hasGoogleConnection = authUser?.user?.identities?.some(
    (identity: any) => identity.provider === 'google'
  ) || false

  // Calculate trial days remaining
  let trialDaysRemaining: number | null = null
  let isTrialExpired = false
  
  if (profile.subscription_status === 'trialing' && profile.subscription_tier === 'free') {
    const createdDate = profile.created_at ? new Date(profile.created_at) : new Date()
    const trialEndDate = new Date(createdDate)
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial
    
    const now = new Date()
    const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining > 0) {
      trialDaysRemaining = daysRemaining
    } else {
      isTrialExpired = true
      // Update status to free if trial expired (but don't block the page)
      if (daysRemaining <= 0) {
        (supabaseAdmin
          .from('profiles') as any)
          .update({
            subscription_status: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)
          .then(() => {
            // Also update workspace if exists
            (supabaseAdmin
              .from('workspaces') as any)
              .update({
                subscription_status: 'free',
                updated_at: new Date().toISOString(),
              })
              .eq('owner_id', profile.id)
          })
      }
    }
  }

  return (
    <div>
      <AnimatedSection delay={0} direction="up" duration={800}>
        <div className="mb-6 sm:mb-8">
          <AnimatedItem delay={100} direction="up" duration={700}>
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          </AnimatedItem>
          <AnimatedItem delay={200} direction="up" duration={700}>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage your account settings and alert integrations
            </p>
          </AnimatedItem>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={300} direction="up" duration={800}>
        <SettingsForm 
          profile={profile} 
          hasStripeCustomer={hasStripeCustomer}
          trialDaysRemaining={trialDaysRemaining}
          isTrialExpired={isTrialExpired}
          currency={currency}
          hasPassword={hasPassword}
          hasGoogleConnection={hasGoogleConnection}
        />
      </AnimatedSection>
    </div>
  )
}

