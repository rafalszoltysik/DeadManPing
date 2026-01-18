import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { token, reason } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Log deletion reason for feedback (optional - you can store this in a database)
    if (reason) {
      console.log(`[Delete Account] User deletion reason: ${reason}`)
      // In production, you might want to store this in a database table for analytics
      // Example: await supabaseAdmin.from('account_deletion_feedback').insert({ user_id, reason, deleted_at })
    }

    // Decode and verify token
    let tokenData: { userId: string; token: string; expiresAt: string }
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf-8')
      tokenData = JSON.parse(decoded)
    } catch (err) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expiresAt)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired. Please request a new deletion email.' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verify user exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', tokenData.userId)
      .single() as { data: { stripe_customer_id: string | null } | null; error: any }

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Cancel subscription in Stripe if customer exists
    if (profile.stripe_customer_id) {
      try {
        // Get all active subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'all',
          limit: 10,
        })

        // Cancel all active subscriptions immediately
        for (const subscription of subscriptions.data) {
          if (subscription.status === 'active' || subscription.status === 'trialing') {
            try {
              // Cancel immediately (not at period end)
              await stripe.subscriptions.cancel(subscription.id)
              console.log(`[Confirm Delete Account] Canceled subscription ${subscription.id} for user ${tokenData.userId}`)
            } catch (subError: any) {
              console.error(`[Confirm Delete Account] Error canceling subscription ${subscription.id}:`, subError)
              // Continue even if subscription cancellation fails
            }
          }
        }
      } catch (stripeError: any) {
        console.error('[Confirm Delete Account] Error with Stripe operations:', stripeError)
        // Continue with account deletion even if Stripe operations fail
      }
    }

    // Delete user from auth.users (this will cascade delete profile and all related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(tokenData.userId)

    if (deleteError) {
      console.error('[Confirm Delete Account] Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    console.log(`[Confirm Delete Account] Successfully deleted account for user ${tokenData.userId}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Confirm Delete Account] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

