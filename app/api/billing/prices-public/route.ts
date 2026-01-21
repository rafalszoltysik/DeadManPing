import { NextRequest, NextResponse } from 'next/server'
import { getCachedPrices, type PlanKey, type PriceInfo } from '@/lib/stripe-prices'
import { PLAN_FEATURES } from '@/lib/stripe'
import { getCurrencyFromHeaders, type Currency } from '@/lib/currency-detection'

// This route is dynamic because it uses request.url and request.headers
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const currencyParam = searchParams.get('currency')
    
    // Użyj waluty z query param lub wykryj z kraju
    const currency: Currency = (currencyParam && ['usd', 'eur'].includes(currencyParam))
      ? currencyParam as Currency
      : getCurrencyFromHeaders(request.headers)

    // Pobierz ceny z Stripe
    let prices: Map<PlanKey, Map<Currency, PriceInfo>>
    try {
      prices = await getCachedPrices()
    } catch (error) {
      console.error('Error fetching prices from Stripe, using fallback:', error)
      prices = new Map()
    }

    // Fallback prices (USD) jeśli Stripe nie zwraca cen
    // Note: Update actual prices in Stripe Dashboard - these are fallbacks only
    const FALLBACK_PRICES = {
      starter: { amount: 700, priceId: process.env.STRIPE_PRICE_ID_STARTER || null }, // $7.00 (updated from $9)
      pro: { amount: 2400, priceId: process.env.STRIPE_PRICE_ID_PRO || null }, // $24.00 (updated from $29)
      team: { amount: 7900, priceId: process.env.STRIPE_PRICE_ID_TEAM || null }, // $79.00 (unchanged)
    }

    // Sprawdź które waluty są dostępne (mają ceny dla wszystkich planów)
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

    // Jeśli wybrana waluta nie jest dostępna, użyj pierwszej dostępnej (lub USD)
    const finalCurrency = availableCurrencies.includes(currency) 
      ? currency 
      : (availableCurrencies.length > 0 ? availableCurrencies[0] : 'usd')

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

    const response = NextResponse.json({ 
      plans, 
      currency: finalCurrency,
      availableCurrencies 
    })

    // Add cache headers for better performance
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=3600, stale-while-revalidate=86400'
    )

    return response
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}

