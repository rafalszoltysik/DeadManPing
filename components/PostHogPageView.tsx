/**
 * PostHog page view tracking component.
 * 
 * Automatically tracks page navigation events for PostHog analytics. Waits for
 * PostHog initialization, debounces rapid navigation, and includes UTM parameter
 * tracking. Used in AnalyticsWrapper for automatic page view tracking.
 * 
 * Does not track errors - see Sentry for error tracking.
 */

'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { capturePageView, isPostHogEnabled } from '@/lib/posthog/client'

let debounceTimer: NodeJS.Timeout | null = null

/**
 * Waits for PostHog to be ready before capturing page view.
 * 
 * Retries up to 10 times with 200ms intervals (max 2 seconds wait).
 * 
 * @param callback - Function to call when PostHog is ready
 * @param retries - Number of retries remaining
 */
function waitForPostHog(callback: () => void, retries = 10): void {
  if (isPostHogEnabled()) {
    callback()
    return
  }

  if (retries > 0) {
    setTimeout(() => {
      waitForPostHog(callback, retries - 1)
    }, 200)
  }
}

/**
 * Tracks page views for PostHog analytics.
 * 
 * Monitors pathname and search params changes, debounces rapid navigation,
 * and captures page view events with UTM parameter tracking. Side effects:
 * PostHog API calls, localStorage checks.
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPathRef = useRef<string | null>(null)

  useEffect(() => {
    // Debounce page view tracking (500ms)
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      
      // Only track if path changed
      if (previousPathRef.current !== currentPath) {
        const referrer = typeof document !== 'undefined' ? document.referrer || null : null
        
        // Extract UTM parameters from URL
        const utmSource = searchParams.get('utm_source')
        const utmMedium = searchParams.get('utm_medium')
        const utmCampaign = searchParams.get('utm_campaign')
        const utmTerm = searchParams.get('utm_term')
        const utmContent = searchParams.get('utm_content')
        
        const pageViewData = {
          path: currentPath,
          referrer,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          utm_term: utmTerm || null,
          utm_content: utmContent || null,
        }
        
        // Wait for PostHog to be ready before capturing
        waitForPostHog(() => {
          capturePageView(pageViewData)
        })
        
        previousPathRef.current = currentPath
      }
    }, 500)

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [pathname, searchParams])

  return null
}

