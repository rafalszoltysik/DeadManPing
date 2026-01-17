import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * Manually sync subscription from Stripe to database
 * 
 * Usage:
 * POST /api/test/sync-subscription
 * Body: { sessionId: "cs_test_..." } (optional - will use latest if not provided)
 * 
 * This endpoint manually fetches the subscription from Stripe and updates
 * the database, bypassing the webhook system.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { sessionId } = body

    let checkoutSession
    let subscription

    if (sessionId) {
      // Fetch specific session
      checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      })
    } else {
      // Find latest subscription for this user
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', session.userId)
        .single()

      if (!profile?.stripe_customer_id) {
        return NextResponse.json(
          { error: 'No Stripe customer ID found. Please provide sessionId.' },
          { status: 400 }
        )
      }

      // Get latest subscription for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        limit: 1,
      })

      if (subscriptions.data.length === 0) {
        return NextResponse.json(
          { error: 'No subscription found for this customer' },
          { status: 404 }
        )
      }

      subscription = subscriptions.data[0]
    }

    // Get subscription if not already retrieved
    if (!subscription) {
      if (checkoutSession?.subscription) {
        subscription = typeof checkoutSession.subscription === 'string'
          ? await stripe.subscriptions.retrieve(checkoutSession.subscription)
          : checkoutSession.subscription
      } else {
        return NextResponse.json(
          { error: 'No subscription found' },
          { status: 400 }
        )
      }
    }

    // Determine tier from price
    const priceId = subscription.items.data[0]?.price.id
    let tier = 'free'

    if (priceId === process.env.STRIPE_PRICE_ID_STARTER) {
      tier = 'starter'
    } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
      tier = 'pro'
    } else if (priceId === process.env.STRIPE_PRICE_ID_TEAM) {
      tier = 'team'
    } else if (priceId === process.env.STRIPE_PRICE_ID_SOLO) {
      tier = 'starter'
    } else if (priceId === process.env.STRIPE_PRICE_ID_AGENCY) {
      tier = 'pro'
    }

    // Get workspace
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.userId)
      .limit(1)
      .single()

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Update workspace
    const { data: updatedWorkspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .update({
        stripe_customer_id: subscription.customer as string,
        subscription_tier: tier,
        subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
        max_members: tier === 'team' ? 10 : tier === 'pro' ? 3 : 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspace.id)
      .select()
      .single()

    if (workspaceError) {
      console.error('Error updating workspace:', workspaceError)
      return NextResponse.json(
        { error: 'Failed to update workspace', details: workspaceError },
        { status: 500 }
      )
    }

    // Update profile
    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        stripe_customer_id: subscription.customer as string,
        subscription_tier: tier,
        subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.userId)
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: profileError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      data: {
        tier,
        status: subscription.status,
        priceId,
        workspace: updatedWorkspace,
        profile: updatedProfile,
      },
    })
  } catch (error: any) {
    console.error('Error syncing subscription:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

