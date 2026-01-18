import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
})

// Plan features (nie zmienia się - ceny są teraz pobierane z Stripe API)
export const PLAN_FEATURES = {
  starter: {
    name: 'Starter',
    monitors: 25,
    minInterval: 300, // 5 minutes
    maxMembers: 1,
  },
  pro: {
    name: 'Pro',
    monitors: 100,
    minInterval: 60, // 1 minute
    maxMembers: 3,
  },
  team: {
    name: 'Team',
    monitors: 500,
    minInterval: 30, // 30 seconds
    maxMembers: 10,
  },
} as const

// Legacy support - mapowanie starych planów
export const LEGACY_PLANS = {
  solo: 'starter',
  agency: 'pro',
} as const

// Deprecated: Używaj getCachedPrices() z lib/stripe-prices.ts zamiast tego
// Zachowane dla backward compatibility
export const PRICING_PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_ID_STARTER || 'price_starter',
    amount: 900, // $9.00 in cents
    name: PLAN_FEATURES.starter.name,
    monitors: PLAN_FEATURES.starter.monitors,
    minInterval: PLAN_FEATURES.starter.minInterval,
    maxMembers: PLAN_FEATURES.starter.maxMembers,
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
    amount: 2900, // $29.00 in cents
    name: PLAN_FEATURES.pro.name,
    monitors: PLAN_FEATURES.pro.monitors,
    minInterval: PLAN_FEATURES.pro.minInterval,
    maxMembers: PLAN_FEATURES.pro.maxMembers,
  },
  team: {
    priceId: process.env.STRIPE_PRICE_ID_TEAM || 'price_team',
    amount: 7900, // $79.00 in cents
    name: PLAN_FEATURES.team.name,
    monitors: PLAN_FEATURES.team.monitors,
    minInterval: PLAN_FEATURES.team.minInterval,
    maxMembers: PLAN_FEATURES.team.maxMembers,
  },
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
    // Note: Stripe hosted Checkout automatically follows user's system dark mode preference
    // There's no direct API parameter to force dark mode for hosted Checkout
    // For custom dark mode, you would need to use embedded Checkout with custom styling
  })

  return session
}

export async function createCustomerPortalSession(customerId: string) {
  // Note: Billing Portal dark mode is configured in Stripe Dashboard:
  // Settings > Billing > Customer portal > Appearance > Theme: Dark
  // Stripe Checkout automatically follows user's system dark mode preference
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
  })

  return session
}

