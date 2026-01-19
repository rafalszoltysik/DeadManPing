'use client'

import { useState, useEffect } from 'react'
import { PageNav } from '@/components/PageNav'
import { setPostHogOptOut, isPostHogOptedOut } from '@/lib/posthog/client'
import Link from 'next/link'

export default function OptOutPage() {
  const [isOptedOut, setIsOptedOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check current opt-out status
    const checkStatus = () => {
      if (typeof window !== 'undefined') {
        const optedOut = isPostHogOptedOut()
        setIsOptedOut(optedOut)
        setIsLoading(false)
      }
    }
    checkStatus()
  }, [])

  const handleOptOut = () => {
    if (typeof window === 'undefined') return
    
    setPostHogOptOut(true)
    setIsOptedOut(true)
    setMessage('Analytics have been disabled. You can re-enable them at any time.')
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleOptIn = () => {
    if (typeof window === 'undefined') return
    
    setPostHogOptOut(false)
    setIsOptedOut(false)
    setMessage('Analytics have been re-enabled.')
    
    // Reload page to apply changes
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Analytics Opt-Out</h1>
        <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
          
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR Article 21, you have the right to object to processing of your personal data 
              based on legitimate interest. We use analytics services (PostHog and Vercel Analytics) 
              in cookieless/anonymized mode to improve our service.
            </p>
            <p className="text-muted-foreground mb-4">
              You can opt-out of PostHog analytics at any time. Vercel Analytics is fully anonymous 
              and cookieless, so it doesn't require opt-out, but you can block it using browser 
              extensions if desired.
            </p>
          </section>

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

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">About Our Analytics</h2>
            <p className="text-muted-foreground mb-4">
              We use analytics to understand how users interact with our service and to improve performance. 
              Our analytics are configured to be privacy-friendly:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>PostHog:</strong> Configured in cookieless mode with anonymized IP addresses. 
                No cookies are used, and IP addresses are anonymized before processing.</li>
              <li><strong>Vercel Analytics:</strong> Fully anonymous and cookieless by design. 
                No personal data is collected or stored.</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              For more information, please see our{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about our analytics or privacy practices, please contact us at:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
              <p className="text-muted-foreground mb-2">
                <strong>Email:</strong> support@deadmanping.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

