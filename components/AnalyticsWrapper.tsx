'use client'

import { useEffect, useState, Suspense } from 'react'
import { Analytics } from "@vercel/analytics/next"
import { PostHogPageView } from '@/components/PostHogPageView'

/**
 * Wrapper component that conditionally renders analytics based on cookie consent
 * This ensures GDPR compliance - analytics only load after user consent
 */
export function AnalyticsWrapper() {
  const [hasConsent, setHasConsent] = useState(false)

  useEffect(() => {
    // Check cookie consent on mount
    const checkConsent = () => {
      // Check for developer block cookie (custom cookie to block analytics for developers)
      const blockAnalytics = localStorage.getItem('blockAnalytics')
      if (blockAnalytics === 'true') {
        setHasConsent(false)
        return
      }
      
      const cookieConsent = localStorage.getItem('cookieConsent')
      setHasConsent(cookieConsent === 'accepted')
    }
    
    // Initial check
    checkConsent()
    
    // Listen for storage changes (in case consent changes in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookieConsent' || e.key === 'blockAnalytics') {
        checkConsent()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Don't render analytics until user has given consent
  // Also check if we're in production
  if (!hasConsent || process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Analytics />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
    </>
  )
}

