import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createCheckoutSession } from '@/lib/stripe'
import { getPriceIdForPlan, type PlanKey } from '@/lib/stripe-prices'
import { type Currency } from '@/lib/currency-detection'

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['starter', 'pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user profile
    const supabase = getSupabaseClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get or create workspace
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()

    if (!workspace) {
      // Create workspace if it doesn't exist
      const { data: newWorkspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: `${profile.email || 'User'}'s Workspace`,
          slug: 'workspace-' + user.id,
          owner_id: user.id,
          subscription_tier: 'free',
        })
        .select()
        .single()

      if (workspaceError || !newWorkspace) {
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }

      // Create workspace member
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })

      workspace = newWorkspace
    }

    if (!workspace) {
      return NextResponse.json({ error: 'Failed to get or create workspace' }, { status: 500 })
    }

    // Pobierz walutę z query param lub body
    const { currency: currencyFromBody } = body
    const currency = (currencyFromBody && ['usd', 'eur', 'pln'].includes(currencyFromBody))
      ? currencyFromBody as Currency
      : 'usd' as Currency

    // Pobierz Price ID dla wybranej waluty
    const priceId = await getPriceIdForPlan(plan as PlanKey, currency)

    if (!priceId) {
      return NextResponse.json(
        { error: `Price not found for ${plan} in ${currency}. Please contact support.` },
        { status: 404 }
      )
    }

    const checkoutSession = await createCheckoutSession(
      profile.stripe_customer_id || null,
      priceId,
      workspace.id,
      profile.email || user.email || ''
    )

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

