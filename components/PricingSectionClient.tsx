/**
 * Client-side pricing section wrapper with skeleton loader.
 * 
 * Dynamically imports PricingSection component with loading skeleton to reduce
 * initial bundle size. Client-side only (no SSR) since it fetches prices from
 * Stripe API. Used in lazy-loaded pricing sections.
 * 
 * Does not fetch prices immediately - loads component on demand.
 */

'use client'

import dynamic from 'next/dynamic'

// Client-side only wrapper for PricingSection
const PricingSection = dynamic(() => import('@/components/PricingSection').then(mod => ({ default: mod.PricingSection })), {
  loading: () => (
    <section className="py-12 sm:py-16 lg:py-20" aria-label="Pricing plans">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">Simple, Transparent Pricing</h2>
      <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base px-4">14-day free trial • No credit card required</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 items-stretch">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 h-96 animate-pulse"></div>
        ))}
      </div>
    </section>
  ),
  ssr: false, // Client-side only since it fetches prices
})

/**
 * Wraps pricing section with skeleton loader.
 * 
 * @returns Lazy-loaded PricingSection with loading state
 */
export default function PricingSectionClient() {
  return <PricingSection />
}

