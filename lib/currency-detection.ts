// Currency detection based on country/region
export type Currency = 'usd' | 'eur' | 'pln'

// Map country codes to currencies
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  // EUR countries
  AT: 'eur', BE: 'eur', CY: 'eur', EE: 'eur', FI: 'eur',
  FR: 'eur', DE: 'eur', GR: 'eur', IE: 'eur', IT: 'eur',
  LV: 'eur', LT: 'eur', LU: 'eur', MT: 'eur', NL: 'eur',
  PT: 'eur', SK: 'eur', SI: 'eur', ES: 'eur', HR: 'eur',
  
  // PLN countries
  PL: 'pln',
  
  // USD countries (default for most)
  US: 'usd', GB: 'usd', CA: 'usd', AU: 'usd', NZ: 'usd',
  // Add more as needed
}

/**
 * Detect currency from country code
 */
export function getCurrencyFromCountry(countryCode?: string | null): Currency {
  if (!countryCode) return 'usd'
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'usd'
}

/**
 * Get currency from request headers (Vercel geo headers)
 */
export function getCurrencyFromHeaders(headers: Headers): Currency {
  const country = headers.get('x-vercel-ip-country')
  return getCurrencyFromCountry(country)
}

/**
 * Format price for display
 * Removes .00 for whole numbers
 */
export function formatPrice(amountInCents: number, currency: Currency): string {
  const amount = amountInCents / 100
  let formatted: string
  
  // Jeśli kwota jest liczbą całkowitą, obetnij .00
  if (amount % 1 === 0) {
    formatted = amount.toString()
  } else {
    formatted = amount.toFixed(2)
  }

  switch (currency) {
    case 'eur':
      return `€${formatted}`
    case 'pln':
      return `${formatted} zł`
    case 'usd':
    default:
      return `$${formatted}`
  }
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: Currency) {
  const info = {
    usd: { code: 'USD', symbol: '$', name: 'US Dollar' },
    eur: { code: 'EUR', symbol: '€', name: 'Euro' },
    pln: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  }
  return info[currency]
}

