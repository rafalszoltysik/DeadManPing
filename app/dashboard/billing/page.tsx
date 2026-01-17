'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRICING_PLANS } from '@/lib/stripe'

function BillingContent() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan) {
      setSelectedPlan(plan)
    } else {
      setSelectedPlan(null)
    }
  }, [searchParams])

  const handleCheckout = async (plan: 'starter' | 'pro' | 'team') => {
    setLoadingPlan(plan)
    setError(null)

    try {
      // Try to change plan first (if user has active subscription)
      const changePlanResponse = await fetch('/api/billing/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const changePlanData = await changePlanResponse.json()

      // If plan change was successful, refresh the page
      if (changePlanResponse.ok && changePlanData.success) {
        setSuccess(changePlanData.message || 'Plan updated successfully!')
        setTimeout(() => {
          window.location.reload()
        }, 2000)
        return
      }

      // If change-plan failed (no active subscription), create new checkout
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Choose Your Plan</h1>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {Object.entries(PRICING_PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`bg-card border shadow-sm rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth flex flex-col h-full ${
              selectedPlan === key ? 'ring-2 ring-primary' : 'border-border'
            } ${key === 'pro' ? 'border-2 border-primary' : ''}`}
          >
            {key === 'pro' && (
              <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded mb-3 inline-block">
                MOST POPULAR
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-2xl sm:text-3xl font-bold mb-4">
              ${plan.amount / 100}
              <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
            </p>
            <ul className="space-y-2 mb-6 flex-grow">
              <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                <span className="mr-2 text-success">✓</span>
                {plan.monitors} monitors
              </li>
              <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                <span className="mr-2 text-success">✓</span>
                Min interval: {plan.minInterval >= 60 ? `${plan.minInterval / 60} minutes` : `${plan.minInterval} seconds`}
              </li>
              <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                <span className="mr-2 text-success">✓</span>
                Email alerts
              </li>
              {(key === 'starter' || key === 'pro' || key === 'team') && (
                <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Slack/Discord integrations
                </li>
              )}
              {key === 'team' && (
                <>
                  <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Custom webhooks
                  </li>
                  <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                    <span className="mr-2 text-success">✓</span>
                    API access
                  </li>
                  <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Up to {plan.maxMembers} team members
                  </li>
                </>
              )}
              {key === 'pro' && (
                <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Up to {plan.maxMembers} team members
                </li>
              )}
            </ul>
            <button
              onClick={() => handleCheckout(key as 'starter' | 'pro' | 'team')}
              disabled={loadingPlan !== null}
              className={`w-full px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-smooth disabled:opacity-50 mt-auto ${
                key === 'pro'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {loadingPlan === key ? 'Processing...' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    }>
      <BillingContent />
    </Suspense>
  )
}

