/**
 * Pricing section component for landing page.
 * 
 * Displays subscription plans with features, pricing, and call-to-action buttons.
 * Fetches prices from Stripe API with currency detection. Supports currency
 * switching and plan selection. Used on landing page for marketing.
 * 
 * Does not handle checkout - redirects to signup/billing pages.
 */

'use client'

import { useState, useEffect } from 'react'
import { AnimatedSection, AnimatedItem } from './AnimatedSection'
import { PricingButton } from './PricingButton'
import { formatPrice, type Currency } from '@/lib/currency-detection'

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

export function PricingSection() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currency, setCurrency] = useState<Currency>('usd')
  const [availableCurrencies, setAvailableCurrencies] = useState<Currency[]>(['usd'])
  const [loading, setLoading] = useState(true)
  const [loadingPrices, setLoadingPrices] = useState(false)

  useEffect(() => {
    // Pobierz walutę z localStorage (jeśli użytkownik wcześniej wybrał)
    // W przeciwnym razie API wykryje kraj automatycznie
    const savedCurrency = localStorage.getItem('preferred_currency') as Currency | null
    
    if (savedCurrency && ['usd', 'eur'].includes(savedCurrency)) {
      fetchPrices(savedCurrency, true)
    } else {
      // Nie przekazuj currency - pozwól API wykryć z kraju (geo headers)
      fetchPrices(undefined, true)
    }
  }, [])

  const fetchPrices = async (selectedCurrency?: Currency, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setLoadingPrices(true)
    }
    
    const startTime = Date.now()
    const minAnimationTime = 500 // Minimalny czas animacji w ms
    
    try {
      // Jeśli nie ma wybranej waluty, API wykryje z geo headers
      const url = selectedCurrency 
        ? `/api/billing/prices-public?currency=${selectedCurrency}`
        : `/api/billing/prices-public`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.plans) {
        setPlans(data.plans)
        setCurrency(data.currency || 'usd')
        setAvailableCurrencies(data.availableCurrencies || ['usd'])
      }
    } catch (err) {
      // Error is handled silently - prices will use default values
    } finally {
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(0, minAnimationTime - elapsedTime)
      
      setTimeout(() => {
        if (isInitialLoad) {
          setLoading(false)
        } else {
          setLoadingPrices(false)
        }
      }, remainingTime)
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    if (newCurrency === currency) return
    
    // Zapisz w localStorage
    localStorage.setItem('preferred_currency', newCurrency)
    setCurrency(newCurrency)
    setLoadingPrices(true)
    fetchPrices(newCurrency)
  }

  const getIntervalText = (seconds: number) => {
    if (seconds >= 60) {
      const minutes = seconds / 60
      return minutes === 1 ? '1 minute' : `${minutes} minutes`
    }
    return `${seconds} seconds`
  }

  if (loading) {
    return (
      <AnimatedSection>
        <section className="py-12 sm:py-16 lg:py-20" aria-label="Pricing plans">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-muted-foreground mb-8 sm:mb-12 text-sm sm:text-base px-4">14-day free trial • No credit card required</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 items-stretch">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 h-96 animate-pulse"></div>
            ))}
          </div>
        </section>
      </AnimatedSection>
    )
  }

  const starterPlan = plans.find(p => p.key === 'starter')
  const proPlan = plans.find(p => p.key === 'pro')
  const teamPlan = plans.find(p => p.key === 'team')

  return (
    <AnimatedSection>
      <section className="py-12 sm:py-16 lg:py-20" aria-label="Pricing plans">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4 px-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base px-4">14-day free trial • No credit card required</p>
        
        {/* Currency Selector - tylko jeśli są dostępne inne waluty */}
        {availableCurrencies.length > 1 && (
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-lg p-1">
              {availableCurrencies.includes('usd') && (
                <button
                  onClick={() => handleCurrencyChange('usd')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    currency === 'usd'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  USD ($)
                </button>
              )}
              {availableCurrencies.includes('eur') && (
                <button
                  onClick={() => handleCurrencyChange('eur')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    currency === 'eur'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  EUR (€)
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 items-stretch">
          {/* Starter Plan */}
          {starterPlan && (
            <AnimatedItem delay={0}>
              <div className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover-lift transition-smooth flex flex-col h-full card-hover">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Starter</h3>
                <p className="text-3xl sm:text-4xl font-bold mb-4 flex items-baseline gap-1 min-h-[2.5rem] sm:min-h-[3rem] relative">
                  <span className="inline-block relative">
                    <span 
                      key={`starter-${currency}-${starterPlan.amount}`}
                      className="inline-block animate-priceChange"
                    >
                      {formatPrice(starterPlan.amount, currency)}
                    </span>
                  </span>
                  <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    {starterPlan.monitors} monitors
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Min interval: {getIntervalText(starterPlan.minInterval)}
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Email alerts
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Slack/Discord integrations
                  </li>
                </ul>
                <PricingButton plan="starter">
                  Get Started
                </PricingButton>
              </div>
            </AnimatedItem>
          )}

          {/* Pro Plan */}
          {proPlan && (
            <AnimatedItem delay={200}>
              <div className="bg-card border-2 border-primary rounded-lg p-6 sm:p-8 hover-lift transition-smooth relative flex flex-col h-full hover:border-primary hover-glow group">
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 sm:px-3 py-1 rounded-full shadow-lg transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(var(--primary)/0.5)]" style={{ opacity: 1 }}>
                    MOST POPULAR
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold">Pro</h3>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-4 flex items-baseline gap-1 min-h-[2.5rem] sm:min-h-[3rem] relative">
                  <span className="inline-block relative">
                    <span 
                      key={`pro-${currency}-${proPlan.amount}`}
                      className="inline-block animate-priceChange"
                    >
                      {formatPrice(proPlan.amount, currency)}
                    </span>
                  </span>
                  <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    {proPlan.monitors} monitors
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Min interval: {getIntervalText(proPlan.minInterval)}
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Email alerts
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Slack/Discord integrations
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Up to {proPlan.maxMembers} team members
                  </li>
                </ul>
                <PricingButton plan="pro" isPrimary>
                  Get Started
                </PricingButton>
              </div>
            </AnimatedItem>
          )}

          {/* Team Plan */}
          {teamPlan && (
            <AnimatedItem delay={400}>
              <div className="bg-card border-2 border-border rounded-lg p-6 sm:p-8 hover-lift transition-smooth flex flex-col h-full card-hover">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">Team</h3>
                <p className="text-3xl sm:text-4xl font-bold mb-4 flex items-baseline gap-1 min-h-[2.5rem] sm:min-h-[3rem] relative">
                  <span className="inline-block relative">
                    <span 
                      key={`team-${currency}-${teamPlan.amount}`}
                      className="inline-block animate-priceChange"
                    >
                      {formatPrice(teamPlan.amount, currency)}
                    </span>
                  </span>
                  <span className="text-base sm:text-lg font-normal text-muted-foreground">/month</span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6 flex-grow">
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    {teamPlan.monitors} monitors
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Min interval: {getIntervalText(teamPlan.minInterval)}
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Email alerts
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Slack/Discord integrations
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Custom webhooks
                  </li>
                  <li className="flex items-center text-foreground">
                    <span className="mr-2 text-success">✓</span>
                    Up to {teamPlan.maxMembers} team members
                  </li>
                </ul>
                <PricingButton plan="team">
                  Get Started
                </PricingButton>
              </div>
            </AnimatedItem>
          )}
        </div>
      </section>
    </AnimatedSection>
  )
}

