import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
})

export const PRICING_PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter',
    amount: 900, // $9.00 in cents
    name: 'Starter',
    monitors: 25,
    minInterval: 300, // 5 minutes
    maxMembers: 1,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
    amount: 2900, // $29.00 in cents
    name: 'Pro',
    monitors: 100,
    minInterval: 60, // 1 minute
    maxMembers: 3,
  },
  team: {
    priceId: process.env.STRIPE_PRICE_ID_TEAM || 'price_team',
    amount: 7900, // $79.00 in cents
    name: 'Team',
    monitors: 500,
    minInterval: 30, // 30 seconds
    maxMembers: 10,
  },
} as const

// Legacy support for old plans (solo -> starter, agency -> pro)
export const LEGACY_PLANS = {
  solo: PRICING_PLANS.starter,
  agency: PRICING_PLANS.pro,
} as const

export async function createCheckoutSession(
  customerId: string | null,
  priceId: string,
  workspaceId: string,
  userEmail: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId || undefined,
    customer_email: customerId ? undefined : userEmail,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
    metadata: {
      workspaceId,
    },
  })

  return session
}

export async function createCustomerPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
  })

  return session
}

