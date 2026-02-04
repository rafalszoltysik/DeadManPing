/**
 * Billing settings component for subscription management.
 * 
 * Displays current subscription tier and status, provides links to Stripe
 * Customer Portal for subscription management, and handles currency preference
 * updates. Shows upgrade prompts for free tier users. Memoized for performance.
 * 
 * Does not handle payment processing - Stripe Portal handles that.
 */

'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { getErrorMessage } from '@/lib/error-utils'

interface BillingSettingsProps {
  subscriptionTier: string
  subscriptionStatus: string
  hasStripeCustomer: boolean
  currency: 'usd' | 'eur'
  onCurrencyChange?: (currency: 'usd' | 'eur') => void
}

export const BillingSettings = React.memo(function BillingSettings({
  subscriptionTier,
  subscriptionStatus,
  hasStripeCustomer,
  currency: initialCurrency,
  onCurrencyChange,
}: BillingSettingsProps) {
  const [currency, setCurrency] = useState<'usd' | 'eur'>(initialCurrency)
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleCurrencySubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Update workspace currency if changed using API endpoint (bypasses RLS)
    if (currency !== initialCurrency) {
      try {
        const response = await fetch('/api/workspace/currency', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ currency }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update currency')
        }

        onCurrencyChange?.(currency)
        setSuccess(true)
      } catch (err: unknown) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [currency, initialCurrency, onCurrencyChange])

  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create portal session')
      }

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No portal URL received')
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err))
      setPortalLoading(false)
    }
  }, [])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Subscription</h2>
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium">Plan:</span>
          <span className="text-sm sm:text-base capitalize font-semibold">{subscriptionTier}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base font-medium">Status:</span>
          <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${
            subscriptionStatus === 'active' 
              ? 'bg-success/10 text-success' 
              : subscriptionStatus === 'trialing'
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}>
            {subscriptionStatus}
          </span>
        </div>
      </div>
      
      {/* Currency Selection */}
      <form onSubmit={handleCurrencySubmit} className="mt-4 space-y-2">
        <label htmlFor="currency" className="block text-sm font-medium">
          Currency
        </label>
        <div className="flex gap-2">
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'usd' | 'eur')}
            className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
          >
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
          </select>
          <button
            type="submit"
            disabled={loading || currency === initialCurrency}
            className="px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-smooth border border-border disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:border-primary/20"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-3 py-2 rounded-lg text-xs sm:text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-3 py-2 rounded-lg text-xs sm:text-sm">
            Currency updated successfully!
          </div>
        )}
      </form>

      <div className="mt-auto pt-3 sm:pt-4 space-y-2">
        {hasStripeCustomer ? (
          <>
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard/billing"
                className="inline-block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift text-center active:scale-95"
              >
                Upgrade Plan
              </Link>
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="inline-block w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-smooth text-center border border-border disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:border-primary/20"
              >
                {portalLoading ? 'Loading...' : 'Manage Subscription'}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upgrade your plan to get more features, or manage your subscription, payment method, and invoices in Stripe Customer Portal.
            </p>
          </>
        ) : subscriptionTier !== 'free' ? (
          <>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
              To manage your subscription, please contact support or visit Stripe Dashboard.
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-block w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-smooth text-center border border-border active:scale-95 hover:border-primary/20"
            >
              View Plans
            </Link>
          </>
        ) : (
          <Link
            href="/dashboard/billing"
            className="inline-block w-full bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift text-center active:scale-95"
          >
            Upgrade Plan
          </Link>
        )}
      </div>
    </div>
  )
})

