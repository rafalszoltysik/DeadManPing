/**
 * Stripe checkout session creation endpoint.
 * 
 * Creates a Stripe Checkout session for subscription upgrades with currency support.
 * Validates plan selection, checks for incomplete sessions, enforces rate limits,
 * and creates workspace if needed. Integrates with Stripe API and Supabase.
 * 
 * Does not process payments - only creates checkout session URL.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createCheckoutSession } from '@/lib/stripe'
import { getPriceIdForPlan, type PlanKey } from '@/lib/stripe-prices'
import { type Currency } from '@/lib/currency-detection'
import { checkRateLimit } from '@/lib/rate-limit'
import Stripe from 'stripe'

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

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
    typescript: true,
  })
}

/**
 * Checks for incomplete or expired Stripe checkout sessions.
 * 
 * Allows users to retry checkout if they left the page without completing.
 * Checks by customer ID or email to handle both existing and new customers.
 * 
 * @param customerId - Stripe customer ID or null
 * @param customerEmail - Customer email address or null
 * @param workspaceId - Workspace identifier for session filtering
 * @returns True if incomplete sessions exist, false otherwise
 */
async function hasIncompleteCheckoutSessions(
  customerId: string | null,
  customerEmail: string | null,
  workspaceId: string
): Promise<boolean> {
  try {
    const stripe = getStripeClient()
    
    // Check for sessions by customer ID
    if (customerId) {
      const sessions = await stripe.checkout.sessions.list({
        customer: customerId,
        limit: 10,
      })
      
      // Check if there are any incomplete sessions (open or expired) for this workspace
      const incompleteSessions = sessions.data.filter(
        (session) =>
          session.metadata?.workspaceId === workspaceId &&
          (session.status === 'open' || session.status === 'expired')
      )
      
      if (incompleteSessions.length > 0) {
        return true
      }
    }
    
    // Also check by email if no customer ID
    // Note: Stripe doesn't support filtering by email directly, so we check recent sessions
    // This is less efficient but only happens for users without a customer ID yet
    if (!customerId && customerEmail) {
      // Check sessions created in the last 24 hours
      const oneDayAgo = Math.floor(Date.now() / 1000) - 86400
      const sessions = await stripe.checkout.sessions.list({
        limit: 100, // Check up to 100 recent sessions
        created: { gte: oneDayAgo },
      })
      
      // Filter by email and workspace
      const incompleteSessions = sessions.data.filter(
        (session) =>
          session.customer_email === customerEmail &&
          session.metadata?.workspaceId === workspaceId &&
          (session.status === 'open' || session.status === 'expired')
      )
      
      if (incompleteSessions.length > 0) {
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error checking incomplete checkout sessions:', error)
    // If we can't check, allow the request (fail open)
    return false
  }
}

/**
 * Creates a Stripe Checkout session for subscription upgrade.
 * 
 * Validates plan selection, checks rate limits (with exception for incomplete sessions),
 * retrieves or creates workspace, and creates Stripe checkout session with currency support.
 * Side effects: DB read/write (profiles, workspaces), Stripe API call, rate limit check.
 * 
 * @param request - HTTP request with plan and optional currency in JSON body
 * @returns Response with checkout session URL or error
 */
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

    // Check for incomplete checkout sessions before rate limiting
    const hasIncomplete = await hasIncompleteCheckoutSessions(
      profile.stripe_customer_id || null,
      profile.email || user.email || null,
      workspace.id
    )

    // Rate limiting: only apply if there are no incomplete sessions
    // This allows users to retry if they left the checkout page
    if (!hasIncomplete) {
      const rateLimitKey = `billing:create-checkout:${user.id}`
      const rateLimit = await checkRateLimit(rateLimitKey, 3600000) // 1 hour
      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many checkout session attempts. Please wait before trying again.' },
          { status: 429 }
        )
      }
    }

    // Pobierz walutę z query param lub body
    const { currency: currencyFromBody } = body
    const currency = (currencyFromBody && ['usd', 'eur'].includes(currencyFromBody))
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

