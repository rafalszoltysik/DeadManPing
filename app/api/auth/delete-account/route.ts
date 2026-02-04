/**
 * Immediate account deletion API endpoint (admin/internal use).
 * 
 * Permanently deletes user account, cancels Stripe subscriptions, and removes
 * all associated data. Used for admin actions or internal cleanup. Requires
 * authentication. Does not require confirmation token.
 * 
 * WARNING: This is a destructive operation. Use request-delete-account for
 * user-initiated deletions with confirmation flow.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

/**
 * Immediately deletes authenticated user's account.
 * 
 * Cancels Stripe subscriptions, deletes user data, and removes auth record.
 * Side effects: Stripe API calls, DB deletions, user data removal.
 * 
 * @param request - HTTP request (unused, but required by Next.js)
 * @returns Deletion result
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get user profile to check for Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single() as { data: { stripe_customer_id: string | null } | null; error: any }

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    // Cancel subscription in Stripe if customer exists
    if (profile?.stripe_customer_id) {
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
              console.log(`[Delete Account] Canceled subscription ${subscription.id} for user ${user.id}`)
            } catch (subError: any) {
              console.error(`[Delete Account] Error canceling subscription ${subscription.id}:`, subError)
              // Continue even if subscription cancellation fails
            }
          }
        }
      } catch (stripeError: any) {
        console.error('[Delete Account] Error with Stripe operations:', stripeError)
        // Continue with account deletion even if Stripe operations fail
      }
    }

    // Delete user from auth.users (this will cascade delete profile and all related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[Delete Account] Error deleting user:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    console.log(`[Delete Account] Successfully deleted account for user ${user.id}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Delete Account] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

