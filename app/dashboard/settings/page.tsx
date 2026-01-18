import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/SettingsForm'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export default async function SettingsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/auth/login')
  }

  // Use admin client to fetch profile (bypasses RLS)
  // We verify ownership by checking id matches session
  const supabaseAdmin = getSupabaseAdmin()
  let { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', session.userId)
    .maybeSingle() as { data: any; error: any }

  // If profile doesn't exist, try to create it
  if (!profile && (!profileError || profileError.code === 'PGRST116')) {
    const { data: newProfile, error: insertError } = await (supabaseAdmin
      .from('profiles') as any)
      .insert({
        id: session.userId,
        email: session.email,
        email_verified: session.emailVerified,
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
  if (profile.id !== session.userId) {
    console.error('Access denied: Profile belongs to different user')
    redirect('/dashboard')
  }

  // Check if user has Stripe customer ID (portal URL will be created on-demand via API)
  const hasStripeCustomer = !!profile.stripe_customer_id

  // Get workspace currency preference
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('currency')
    .eq('owner_id', session.userId)
    .limit(1)
    .maybeSingle() as { data: { currency?: string } | null }
  
  const currency = (workspace?.currency || 'usd') as 'usd' | 'eur' | 'pln'

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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Manage your account settings and alert integrations
        </p>
      </div>

      <SettingsForm 
        profile={profile} 
        hasStripeCustomer={hasStripeCustomer}
        trialDaysRemaining={trialDaysRemaining}
        isTrialExpired={isTrialExpired}
        currency={currency}
      />
    </div>
  )
}

