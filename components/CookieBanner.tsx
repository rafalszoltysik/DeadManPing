'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-foreground leading-relaxed">
              We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts.
              By clicking "Accept All", you consent to our use of cookies.{' '}
              <Link href="/legal/cookies" className="text-primary hover:text-primary/80 underline transition-smooth break-words">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={rejectCookies}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-md transition-smooth flex-1 sm:flex-initial"
            >
              Reject
            </button>
            <button
              onClick={acceptCookies}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-smooth shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 flex-1 sm:flex-initial"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

