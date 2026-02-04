/**
 * Vercel Analytics wrapper with cookie consent support.
 * 
 * Conditionally renders Vercel Analytics component based on cookie consent
 * preference stored in localStorage. Only renders in production environment.
 * Disabled in development to avoid sending test data.
 * 
 * NOTE: This component is legacy - AnalyticsWrapper is the preferred implementation.
 */

'use client'

import { useEffect, useState } from 'react'
import { Analytics } from "@vercel/analytics/next"

/**
 * Renders Vercel Analytics if user accepted cookies.
 * 
 * Checks localStorage for cookie consent. Side effects: Analytics initialization.
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

