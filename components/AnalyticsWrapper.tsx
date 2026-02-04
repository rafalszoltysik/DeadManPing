/**
 * Analytics wrapper component with opt-out support.
 * 
 * Conditionally renders Vercel Analytics, Speed Insights, and PostHog page view
 * tracking based on user preferences and developer flags. Analytics enabled by
 * default under GDPR "legitimate interest" (Art. 6(1)(f)). Both services run in
 * cookieless/anonymized mode. Respects localStorage opt-out flags.
 * 
 * Does not track errors - see Sentry for error tracking.
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { PostHogPageView } from '@/components/PostHogPageView'

/**
 * Renders analytics components based on opt-out preferences.
 * 
 * Checks localStorage for developer and user opt-out flags. Side effects:
 * Analytics initialization, page view tracking.
 */
export function AnalyticsWrapper() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    // Check if analytics should be enabled
    const checkAnalytics = () => {
      // Check for developer block flags (custom localStorage to block analytics for developers)
      // To disable analytics as a developer: localStorage.setItem('blockAnalytics', 'true')
      const blockAnalytics = localStorage.getItem('blockAnalytics')
      const blockEssentialCookies = localStorage.getItem('blockEssentialCookies')
      
      if (blockAnalytics === 'true' || blockEssentialCookies === 'true') {
        setShouldRender(false)
        return
      }
      
      // Check for user opt-out flag (users can opt-out via /legal/opt-out page)
      const posthogOptOut = localStorage.getItem('posthog_opt_out')
      if (posthogOptOut === 'true') {
        // User has opted out of PostHog, but Vercel Analytics is cookieless and doesn't need opt-out
        // We'll still render Vercel Analytics as it's fully anonymous
        // PostHog will be blocked by instrumentation-client.ts checking posthog_opt_out
        setShouldRender(true)
        return
      }
      
      // Analytics are enabled by default (no consent required - legitimate interest)
      setShouldRender(true)
    }
    
    // Initial check
    checkAnalytics()
    
    // Listen for storage changes (in case block flags or opt-out change in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'blockAnalytics' || e.key === 'blockEssentialCookies' || e.key === 'posthog_opt_out') {
        checkAnalytics()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Don't render analytics in development
  // Also check if analytics should be blocked
  if (!shouldRender || process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
    </>
  )
}

