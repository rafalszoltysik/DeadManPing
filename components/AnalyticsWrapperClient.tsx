/**
 * Lazy-loaded analytics wrapper for performance optimization.
 * 
 * Dynamically imports AnalyticsWrapper after page becomes interactive to improve
 * initial page load performance. Uses requestIdleCallback when available for
 * optimal loading timing. Client-side only (no SSR) since it checks localStorage.
 * 
 * Does not handle analytics initialization - delegated to AnalyticsWrapper.
 */

'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Client-side only wrapper for AnalyticsWrapper
// Loaded asynchronously after page is interactive to improve initial page load
const AnalyticsWrapper = dynamic(() => import('@/components/AnalyticsWrapper').then(mod => ({ default: mod.AnalyticsWrapper })), {
  ssr: false, // Client-side only since it checks localStorage
})

/**
 * Lazy-loads analytics wrapper after page becomes interactive.
 * 
 * Defers loading until page is fully loaded and interactive. Side effects:
 * Dynamic import, analytics component loading.
 */
export default function AnalyticsWrapperClient() {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Defer loading analytics until after page is interactive
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if (typeof window !== 'undefined') {
      const loadAnalytics = () => {
        // Wait for page to be interactive
        if (document.readyState === 'complete') {
          setShouldLoad(true)
        } else {
          window.addEventListener('load', () => {
            // Additional delay to ensure page is fully interactive
            setTimeout(() => setShouldLoad(true), 100)
          })
        }
      }

      if ('requestIdleCallback' in window) {
        requestIdleCallback(loadAnalytics, { timeout: 2000 })
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(loadAnalytics, 1000)
      }
    }
  }, [])

  if (!shouldLoad) {
    return null
  }

  return <AnalyticsWrapper />
}

