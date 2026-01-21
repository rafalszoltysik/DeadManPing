import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createCustomerPortalSession } from '@/lib/stripe'

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

    // Get workspace first (subscriptions are workspace-based)
    const supabase = getSupabaseClient()
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('stripe_customer_id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()

    // Get user profile as fallback
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    // Workspace stripe_customer_id takes priority
    const stripeCustomerId = workspace?.stripe_customer_id || profile?.stripe_customer_id

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found. Please upgrade to a paid plan first.' },
        { status: 400 }
      )
    }

    const portalSession = await createCustomerPortalSession(stripeCustomerId)

    return NextResponse.json({ url: portalSession.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

