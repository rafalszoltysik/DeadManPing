import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getCachedPrices, type PlanKey, type PriceInfo } from '@/lib/stripe-prices'
import { PLAN_FEATURES } from '@/lib/stripe'
import { type Currency } from '@/lib/currency-detection'

export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Zawsze używaj USD
    const currency: Currency = 'usd'

    // Pobierz ceny z Stripe
    let prices: Map<PlanKey, Map<Currency, PriceInfo>>
    try {
      prices = await getCachedPrices()
    } catch (error) {
      console.error('Error fetching prices from Stripe, using fallback:', error)
      prices = new Map()
    }

    // Fallback prices (USD) jeśli Stripe nie zwraca cen
    const FALLBACK_PRICES = {
      starter: { amount: 900, priceId: process.env.STRIPE_PRICE_ID_STARTER || null },
      pro: { amount: 2900, priceId: process.env.STRIPE_PRICE_ID_PRO || null },
      team: { amount: 7900, priceId: process.env.STRIPE_PRICE_ID_TEAM || null },
    }

    // Zawsze używaj USD
    const finalCurrency: Currency = 'usd'
    const availableCurrencies: Currency[] = ['usd']

    // Zbuduj odpowiedź z planami i cenami
    const plans = (['starter', 'pro', 'team'] as PlanKey[]).map((planKey) => {
      const priceInfo = prices.get(planKey)?.get(finalCurrency)
      const features = PLAN_FEATURES[planKey]
      
      // Użyj fallback jeśli nie ma ceny z Stripe (tylko dla USD)
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

    return NextResponse.json({ 
      plans, 
      currency: finalCurrency,
      availableCurrencies 
    })
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

