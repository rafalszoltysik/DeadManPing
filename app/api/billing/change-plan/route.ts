import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'
import { stripe, PRICING_PLANS } from '@/lib/stripe'

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

    if (!plan || !PRICING_PLANS[plan as keyof typeof PRICING_PLANS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const pricingPlan = PRICING_PLANS[plan as keyof typeof PRICING_PLANS]

    // Get user profile with workspace
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', session.userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get workspace
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.userId)
      .limit(1)
      .single()

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    // If user has a Stripe customer ID, try to find active subscription
    if (profile.stripe_customer_id) {
      try {
        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'all',
          limit: 10,
        })

        // Find active subscription (including those scheduled to cancel)
        const activeSubscription = subscriptions.data.find(
          sub => sub.status === 'active' || sub.status === 'trialing'
        )

        if (activeSubscription) {
          // Check if user is trying to change to the same plan
          const currentPriceId = activeSubscription.items.data[0]?.price.id
          if (currentPriceId === pricingPlan.priceId) {
            return NextResponse.json(
              { error: 'You are already on this plan' },
              { status: 400 }
            )
          }

          // If subscription is scheduled to cancel, cancel the cancellation first
          if (activeSubscription.cancel_at_period_end) {
            console.log(`[Change Plan] Subscription ${activeSubscription.id} is scheduled to cancel, canceling the cancellation first`)
            await stripe.subscriptions.update(activeSubscription.id, {
              cancel_at_period_end: false,
            })
          }

          // Update subscription to new plan
          const updatedSubscription = await stripe.subscriptions.update(
            activeSubscription.id,
            {
              items: [
                {
                  id: activeSubscription.items.data[0].id,
                  price: pricingPlan.priceId,
                },
              ],
              proration_behavior: 'always_invoice', // Charge/credit immediately for the difference
              metadata: {
                workspaceId: workspace.id,
              },
            }
          )

          console.log(`[Change Plan] Updated subscription ${activeSubscription.id} to plan ${plan}`)

          // The webhook will handle the database update, but we can return success immediately
          return NextResponse.json({
            success: true,
            message: 'Plan updated successfully. Changes will be reflected shortly.',
            subscriptionId: updatedSubscription.id,
          })
        }
      } catch (error: any) {
        console.error('Error updating subscription:', error)
        // If subscription update fails, fall through to create new checkout
      }
    }

    // If no active subscription or update failed, create new checkout session
    // Note: Stripe hosted Checkout automatically follows user's system dark mode preference
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id || undefined,
      customer_email: profile.stripe_customer_id ? undefined : profile.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: pricingPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
      metadata: {
        workspaceId: workspace.id,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Error changing plan:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

