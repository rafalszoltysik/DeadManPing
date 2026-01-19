'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { capturePageView } from '@/lib/posthog/client'

let debounceTimer: NodeJS.Timeout | null = null

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
        
        capturePageView({
          path: currentPath,
          referrer,
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

