import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

/**
 * Test endpoint to manually trigger webhook for existing checkout session
 * 
 * Usage:
 * POST /api/test/trigger-webhook
 * Body: { sessionId: "cs_test_..." }
 * 
 * This will fetch the checkout session and subscription, then manually
 * process the checkout.session.completed event.
 */
export async function POST(request: NextRequest) {
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

