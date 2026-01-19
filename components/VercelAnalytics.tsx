'use client'

import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/next"

/**
 * Vercel Analytics wrapper that respects cookie consent
 * Only renders Analytics component if user has accepted cookies
 */
export function VercelAnalytics() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Only check in browser
    if (typeof window === 'undefined') return

    // Check cookie consent
    const cookieConsent = localStorage.getItem('cookieConsent')
    
    // Only render if user has accepted cookies
    if (cookieConsent === 'accepted') {
      setShouldRender(true)
    } else {
      setShouldRender(false)
    }
  }, [])

  // Don't render in development
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  // Only render if user accepted cookies
  if (!shouldRender) {
    return null
  }

  return <Analytics />
}

