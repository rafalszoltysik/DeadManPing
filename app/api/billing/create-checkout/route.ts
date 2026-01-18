import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'
import { createCheckoutSession } from '@/lib/stripe'
import { getPriceIdForPlan, type Currency, type PlanKey } from '@/lib/stripe-prices'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['starter', 'pro', 'team'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', session.userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get or create workspace
    let { data: workspace } = await supabase
      .from('workspaces')
      .select('id, currency')
      .eq('owner_id', session.userId)
      .limit(1)
      .maybeSingle()

    if (!workspace) {
      // Create workspace if it doesn't exist
      const { data: newWorkspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: `${profile.email || 'User'}'s Workspace`,
          slug: 'workspace-' + session.userId,
          owner_id: session.userId,
          subscription_tier: 'free',
          currency: 'usd',
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
          user_id: session.userId,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })

      workspace = newWorkspace
    }

    if (!workspace) {
      return NextResponse.json({ error: 'Failed to get or create workspace' }, { status: 500 })
    }

    // Pobierz Price ID dla wybranej waluty
    const currency = (workspace.currency || 'usd') as Currency
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
      profile.email || session.email
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

