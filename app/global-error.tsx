/**
 * Global error boundary component for root layout errors.
 * 
 * Client component that catches errors in root layout and displays error UI.
 * Must include html and body tags since it replaces root layout. Captures
 * errors to Sentry for monitoring. Used by Next.js App Router for root-level
 * error boundaries.
 * 
 * Does not catch errors in route segments - see error.tsx for that.
 */

'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { captureFrontendError } from '@/lib/sentry/client'

/**
 * Renders global error boundary UI with retry functionality.
 * 
 * Displays error message and retry button. Includes html/body tags.
 * Side effects: Sentry error tracking.
 * 
 * @param error - Error object with optional digest
 * @param reset - Function to retry rendering
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Capture error to Sentry
    captureFrontendError(error, {
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      action: 'global_error_boundary',
      additionalData: {
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-transparent">
          <div className="max-w-md w-full space-y-8 p-8 bg-card border border-border rounded-lg shadow">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">Something went wrong!</h2>
              <p className="mt-2 text-muted-foreground">{error.message || 'An unexpected error occurred'}</p>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={reset}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-smooth"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium transition-smooth inline-block"
                >
                  Go Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

