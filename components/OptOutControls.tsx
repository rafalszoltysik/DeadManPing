'use client'

import { useState, useEffect, useCallback } from 'react'
import { setPostHogOptOut, isPostHogOptedOut } from '@/lib/posthog/client'

export function OptOutControls() {
  const [isOptedOut, setIsOptedOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check current opt-out status
    if (typeof window !== 'undefined') {
      const optedOut = isPostHogOptedOut()
      setIsOptedOut(optedOut)
      setIsLoading(false)
    }
  }, [])

  const handleOptOut = useCallback(() => {
    if (typeof window === 'undefined') return
    
    setPostHogOptOut(true)
    setIsOptedOut(true)
    setMessage('Analytics have been disabled. You can re-enable them at any time.')
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }, [])

  const handleOptIn = useCallback(() => {
    if (typeof window === 'undefined') return
    
    setPostHogOptOut(false)
    setIsOptedOut(false)
    setMessage('Analytics have been re-enabled.')
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }, [])

  return (
    <>
      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Current Status</h2>
        {isLoading ? (
          <p className="text-muted-foreground mb-4">Checking status...</p>
        ) : (
          <div className="mb-4">
            <p className="text-muted-foreground mb-2">
              <strong>PostHog Analytics:</strong>{' '}
              {isOptedOut ? (
                <span className="text-green-600 dark:text-green-400">Disabled</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400">Enabled</span>
              )}
            </p>
            <p className="text-muted-foreground mb-2">
              <strong>Vercel Analytics:</strong>{' '}
              <span className="text-muted-foreground">Enabled (cookieless, fully anonymous)</span>
            </p>
          </div>
        )}
      </section>

      <section className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Manage Analytics</h2>
        {message && (
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
            <p className="text-sm text-foreground">{message}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {isOptedOut ? (
            <button
              onClick={handleOptIn}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm sm:text-base font-medium transition-smooth"
            >
              Re-enable PostHog Analytics
            </button>
          ) : (
            <button
              onClick={handleOptOut}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-secondary text-foreground hover:bg-secondary/80 border border-border rounded-md text-sm sm:text-base font-medium transition-smooth"
            >
              Opt-out of PostHog Analytics
            </button>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-4">
          Changes will take effect immediately after page reload.
        </p>
      </section>
    </>
  )
}

