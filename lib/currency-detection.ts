/**
 * Currency detection and formatting utilities.
 * 
 * Detects user's currency based on country code (from Vercel geo headers),
 * formats prices for display, and provides currency information. Used for
 * multi-currency pricing display in billing and pricing pages.
 * 
 * Does not handle currency conversion - only detection and formatting.
 */

export type Currency = 'usd' | 'eur' | 'pln'

/**
 * Maps ISO country codes to supported currencies.
 */
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  // EUR countries
  AT: 'eur', BE: 'eur', CY: 'eur', EE: 'eur', FI: 'eur',
  FR: 'eur', DE: 'eur', GR: 'eur', IE: 'eur', IT: 'eur',
  LV: 'eur', LT: 'eur', LU: 'eur', MT: 'eur', NL: 'eur',
  PT: 'eur', SK: 'eur', SI: 'eur', ES: 'eur', HR: 'eur',
  
  // USD countries (default for most, w tym PL)
  US: 'usd', GB: 'usd', CA: 'usd', AU: 'usd', NZ: 'usd', PL: 'usd',
  // Add more as needed
}

/**
 * Detects currency from ISO country code.
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE')
 * @returns Detected currency or 'usd' as default
 */
export function getCurrencyFromCountry(countryCode?: string | null): Currency {
  if (!countryCode) return 'usd'
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'usd'
}

/**
 * Detects currency from Vercel geo headers.
 * 
 * Extracts country code from x-vercel-ip-country header and maps to currency.
 * 
 * @param headers - HTTP request headers
 * @returns Detected currency or 'usd' as default
 */
export function getCurrencyFromHeaders(headers: Headers): Currency {
  const country = headers.get('x-vercel-ip-country')
  return getCurrencyFromCountry(country)
}

/**
 * Formats price amount for display.
 * 
 * Converts cents to currency units, removes .00 for whole numbers, and adds
 * currency symbol. Handles USD, EUR, and PLN formatting.
 * 
 * @param amountInCents - Price in smallest currency unit (cents/grosze)
 * @param currency - Currency code
 * @returns Formatted price string (e.g., "$7", "€24.00")
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


