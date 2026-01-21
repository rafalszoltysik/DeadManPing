'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { capturePageView, isPostHogEnabled } from '@/lib/posthog/client'

let debounceTimer: NodeJS.Timeout | null = null

/**
 * Wait for PostHog to be ready before capturing page view
 * Retries up to 10 times with 200ms intervals (max 2 seconds wait)
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

