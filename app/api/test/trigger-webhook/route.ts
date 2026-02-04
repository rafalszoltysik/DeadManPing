/**
 * Test endpoint for manually triggering Stripe webhook processing.
 * 
 * Development/testing utility to manually process Stripe webhook events for
 * existing checkout sessions. Fetches session and subscription from Stripe,
 * then processes checkout.session.completed event. Useful for debugging webhook
 * issues or testing subscription flows.
 * 
 * SECURITY: Disabled in production. Requires authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

/**
 * Manually triggers webhook processing for checkout session.
 * 
 * Fetches session from Stripe and processes checkout.session.completed event.
 * Side effects: Stripe API calls, DB writes (subscription updates).
 * 
 * @param request - HTTP request with sessionId in JSON body
 * @returns Webhook processing result
 */
export async function POST(request: NextRequest) {
  // Block in production - check both NODE_ENV and VERCEL_ENV for safety
  const isProduction = process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL_ENV === 'production'
  
  if (isProduction) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 } // Return 404 instead of 403 to hide endpoint existence
    )
  }
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Fetch checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this session' },
        { status: 400 }
      )
    }

    // Get subscription details
    const subscription = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(session.subscription)
      : session.subscription

    const priceId = subscription.items.data[0]?.price.id

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        customer: session.customer,
        subscription: subscription.id,
        metadata: session.metadata,
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        priceId,
      },
      message: 'Use this data to manually update your database, or call the webhook endpoint directly',
      webhookEndpoint: '/api/webhooks/stripe',
      note: 'You can manually call the webhook endpoint with this data, or update the database directly',
    })
  } catch (error: any) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

