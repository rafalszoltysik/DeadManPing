/**
 * Stripe pricing cache and lookup utilities.
 * 
 * Fetches subscription prices from Stripe API and caches them for performance.
 * Supports multi-currency pricing (USD, EUR, PLN) and provides helper functions
 * to lookup price IDs and price information by plan and currency.
 * 
 * Does not create subscriptions - only fetches and caches pricing data.
 */

import { stripe } from './stripe'
import { Currency } from './currency-detection'

// Re-export stripe for convenience
export { stripe }

export type PlanKey = 'starter' | 'pro' | 'team'

export interface PriceInfo {
  priceId: string
  amount: number // w najmniejszych jednostkach (centy/grosze)
  currency: string
}

interface PricesCache {
  data: Map<PlanKey, Map<Currency, PriceInfo>>
  expiry: number
}

let pricesCache: PricesCache | null = null
const CACHE_TTL = 60 * 60 * 1000 // 1 godzina

/**
 * Fetches all prices from Stripe API and caches them.
 * 
 * Retrieves active products with plan_key metadata and their monthly recurring
 * prices. Caches results for 1 hour to reduce API calls. Returns stale cache
 * if API call fails. Side effects: Stripe API calls, in-memory caching.
 * 
 * Requires Stripe products to have metadata: { plan_key: 'starter' | 'pro' | 'team' }
 * 
 * @returns Map of plan keys to currency-to-price mappings
 */
export async function getCachedPrices(): Promise<Map<PlanKey, Map<Currency, PriceInfo>>> {
  const now = Date.now()

  // Zwróć cache jeśli jest aktualny
  if (pricesCache && now < pricesCache.expiry) {
    return pricesCache.data
  }

  try {
    // Pobierz wszystkie aktywne Products
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })

    const pricesMap = new Map<PlanKey, Map<Currency, PriceInfo>>()

    // Dla każdego Product z metadata plan_key
    for (const product of products.data) {
      const planKey = product.metadata?.plan_key as PlanKey | undefined

      if (!planKey || !['starter', 'pro', 'team'].includes(planKey)) {
        continue
      }

      // Pobierz wszystkie Prices dla tego Product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      })

      const currencyMap = new Map<Currency, PriceInfo>()

      // Filtruj tylko monthly recurring prices w obsługiwanych walutach
      for (const price of prices.data) {
        if (
          price.recurring?.interval === 'month' &&
          price.currency &&
          ['usd', 'eur', 'pln'].includes(price.currency) &&
          price.unit_amount
        ) {
          currencyMap.set(price.currency as Currency, {
            priceId: price.id,
            amount: price.unit_amount,
            currency: price.currency,
          })
        }
      }

      if (currencyMap.size > 0) {
        pricesMap.set(planKey, currencyMap)
      }
    }

    // Zaktualizuj cache
    pricesCache = {
      data: pricesMap,
      expiry: now + CACHE_TTL,
    }

    return pricesMap
  } catch (error) {
    console.error('Error fetching prices from Stripe:', error)
    // Zwróć stary cache jeśli jest dostępny, nawet jeśli wygasł
    if (pricesCache) {
      return pricesCache.data
    }
    throw error
  }
}

/**
 * Gets Stripe Price ID for plan and currency.
 * 
 * @param planKey - Plan identifier (starter, pro, team)
 * @param currency - Currency code
 * @returns Stripe Price ID or null if not found
 */
export async function getPriceIdForPlan(
  planKey: PlanKey,
  currency: Currency
): Promise<string | null> {
  const prices = await getCachedPrices()
  return prices.get(planKey)?.get(currency)?.priceId || null
}


