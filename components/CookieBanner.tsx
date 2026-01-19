'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/**
 * Informational banner about analytics (non-intrusive)
 * Analytics are enabled by default as "legitimate interest" (GDPR Art. 6(1)(f))
 * Users can opt-out via /legal/opt-out page
 * This banner is shown once and can be dismissed
 */
export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already dismissed the banner
    const bannerDismissed = localStorage.getItem('analyticsBannerDismissed')
    if (!bannerDismissed) {
      setShowBanner(true)
    }
  }, [])

  const dismissBanner = () => {
    localStorage.setItem('analyticsBannerDismissed', 'true')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              We use anonymous analytics to improve our service. No cookies are used for tracking.{' '}
              <Link href="/legal/opt-out" className="text-primary hover:text-primary/80 underline transition-smooth break-words">
                Opt-out
              </Link>
              {' or '}
              <Link href="/legal/cookies" className="text-primary hover:text-primary/80 underline transition-smooth break-words">
                Learn more
              </Link>
            </p>
          </div>
          <button
            onClick={dismissBanner}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground hover:text-foreground/80 transition-smooth flex-shrink-0"
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

