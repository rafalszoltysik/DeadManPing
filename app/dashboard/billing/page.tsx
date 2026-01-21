import { Suspense } from 'react'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { getCachedPrices, type PlanKey, type PriceInfo } from '@/lib/stripe-prices'
import { PLAN_FEATURES } from '@/lib/stripe'
import { getCurrencyFromHeaders, type Currency } from '@/lib/currency-detection'
import { headers } from 'next/headers'
import { BillingContent } from '@/components/BillingContent'

async function BillingPageContent() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get currency preference - detect from country
  // Client-side will handle localStorage preference
  const headersList = await headers()
  const currency = getCurrencyFromHeaders(headersList)

  // Get prices from Stripe
  let prices: Map<PlanKey, Map<Currency, PriceInfo>>
  try {
    prices = await getCachedPrices()
  } catch (error) {
    console.error('Error fetching prices from Stripe, using fallback:', error)
    prices = new Map()
  }

  // Fallback prices (USD) if Stripe doesn't return prices
  const FALLBACK_PRICES = {
    starter: { amount: 900, priceId: process.env.STRIPE_PRICE_ID_STARTER || null },
    pro: { amount: 2900, priceId: process.env.STRIPE_PRICE_ID_PRO || null },
    team: { amount: 7900, priceId: process.env.STRIPE_PRICE_ID_TEAM || null },
  }

  // Check which currencies are available
  const availableCurrencies: Currency[] = []
  for (const curr of ['usd', 'eur'] as Currency[]) {
    const allPlansHavePrices = (['starter', 'pro', 'team'] as PlanKey[]).every(planKey => {
      const priceInfo = prices.get(planKey)?.get(curr)
      // USD ma fallback z env, EUR musi mieć ceny w Stripe
      if (curr === 'usd') {
        return true // USD zawsze dostępne (fallback)
      }
      return priceInfo && priceInfo.amount > 0 && priceInfo.priceId
    })
    
    if (allPlansHavePrices) {
      availableCurrencies.push(curr)
    }
  }

  // If selected currency is not available, use first available
  const finalCurrency = availableCurrencies.includes(currency) 
    ? currency 
    : (availableCurrencies.length > 0 ? availableCurrencies[0] : 'usd')

  // Build response with plans and prices
  const plans = (['starter', 'pro', 'team'] as PlanKey[]).map((planKey) => {
    const priceInfo = prices.get(planKey)?.get(finalCurrency)
    const features = PLAN_FEATURES[planKey]
    
    // Use fallback if no price from Stripe (only for USD)
    const amount = priceInfo?.amount || (finalCurrency === 'usd' ? FALLBACK_PRICES[planKey].amount : 0)
    const priceId = priceInfo?.priceId || (finalCurrency === 'usd' ? FALLBACK_PRICES[planKey].priceId : null)

    return {
      key: planKey,
      name: features.name,
      amount,
      currency: finalCurrency,
      priceId,
      monitors: features.monitors,
      minInterval: features.minInterval,
      maxMembers: features.maxMembers,
    }
  })

  return (
    <BillingContent 
      initialPlans={plans}
      initialCurrency={finalCurrency}
      initialAvailableCurrencies={availableCurrencies}
    />
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    }>
      <BillingPageContent />
    </Suspense>
  )
}
