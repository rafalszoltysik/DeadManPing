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
 * Pobiera wszystkie ceny z Stripe API i cache'uje je
 * Wymaga aby Products w Stripe miały metadata: { plan_key: 'starter' | 'pro' | 'team' }
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
 * Pobiera Price ID dla danego planu i waluty
 */
export async function getPriceIdForPlan(
  planKey: PlanKey,
  currency: Currency
): Promise<string | null> {
  const prices = await getCachedPrices()
  return prices.get(planKey)?.get(currency)?.priceId || null
}

/**
 * Pobiera informacje o cenie dla danego planu i waluty
 */
export async function getPriceInfoForPlan(
  planKey: PlanKey,
  currency: Currency
): Promise<PriceInfo | null> {
  const prices = await getCachedPrices()
  return prices.get(planKey)?.get(currency) || null
}

/**
 * Pobiera wszystkie dostępne ceny dla danego planu
 */
export async function getAllPricesForPlan(
  planKey: PlanKey
): Promise<Map<Currency, PriceInfo>> {
  const prices = await getCachedPrices()
  return prices.get(planKey) || new Map()
}

/**
 * Formatuje cenę do wyświetlenia
 */
// formatPrice moved to lib/currency-detection.ts

