'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatPrice } from '@/lib/currency-detection'

interface Plan {
  key: string
  name: string
  amount: number
  currency: string
  priceId: string | null
  monitors: number
  minInterval: number
  maxMembers: number
}

function BillingContent() {
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [currency] = useState<string>('usd')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan) {
      setSelectedPlan(plan)
    } else {
      setSelectedPlan(null)
    }
  }, [searchParams])

  useEffect(() => {
    // Zawsze używaj USD
    const url = `/api/billing/prices?currency=usd`
    
    // Pobierz ceny z API
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
      if (data.plans) {
        setPlans(data.plans)
      }
      })
      .catch((err) => {
        console.error('Error fetching prices:', err)
        setError('Failed to load pricing. Please refresh the page.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

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
        body: JSON.stringify({ plan, currency }),
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 h-64 animate-pulse"></div>
        </div>
      </div>
    )
  }


  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Choose Your Plan</h1>
      </div>

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
        {plans.map((plan) => (
          <div
            key={plan.key}
            className={`bg-card border shadow-sm rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth flex flex-col h-full relative ${
              selectedPlan === plan.key ? 'ring-2 ring-primary' : 'border-border'
            } ${plan.key === 'pro' ? 'border-2 border-primary' : ''}`}
          >
            {plan.key === 'pro' && (
              <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 animate-pulse-subtle">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                  MOST POPULAR
                </span>
              </div>
            )}
            <h2 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-2xl sm:text-3xl font-bold mb-4 flex items-baseline gap-1 min-h-[2rem] sm:min-h-[2.5rem] relative">
                  <span className="inline-block relative">
                    <span 
                      key={`${plan.key}-${plan.currency}-${plan.amount}`}
                      className="inline-block animate-priceChange"
                    >
                      {formatPrice(plan.amount, plan.currency as 'usd' | 'eur' | 'pln')}
                    </span>
                  </span>
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
              {(plan.key === 'starter' || plan.key === 'pro' || plan.key === 'team') && (
                <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Slack/Discord integrations
                </li>
              )}
              {plan.key === 'team' && (
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
              {plan.key === 'pro' && (
                <li className="flex items-center text-sm sm:text-base text-muted-foreground">
                  <span className="mr-2 text-success">✓</span>
                  Up to {plan.maxMembers} team members
                </li>
              )}
            </ul>
            <button
              onClick={() => handleCheckout(plan.key as 'starter' | 'pro' | 'team')}
              disabled={loadingPlan !== null || !plan.priceId}
              className={`w-full px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-smooth disabled:opacity-50 mt-auto ${
                plan.key === 'pro'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {loadingPlan === plan.key ? 'Processing...' : plan.priceId ? 'Subscribe' : 'Unavailable'}
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

