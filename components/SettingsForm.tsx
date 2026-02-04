/**
 * Main settings form component with tabbed interface.
 * 
 * Combines multiple settings sections (billing, profile, alerts, account deletion,
 * support) into tabbed interface. Manages active tab state and coordinates between
 * child components. Used in dashboard settings page.
 * 
 * Does not handle individual settings updates - delegated to child components.
 */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { BillingSettings } from './BillingSettings'
import { ProfileSettings } from './ProfileSettings'
import { DeleteAccountSection } from './DeleteAccountSection'
import { AlertSettings } from './AlertSettings'
import { SupportForm } from './SupportForm'

interface Profile {
  id: string
  email: string
  subscription_tier: string
  subscription_status: string
  slack_webhook_url: string | null
  discord_webhook_url: string | null
  custom_webhook_url: string | null
  alert_email: string | null
  disable_email_alerts?: boolean
}

interface SettingsFormProps {
  profile: Profile
  hasStripeCustomer: boolean
  trialDaysRemaining?: number | null
  isTrialExpired?: boolean
  currency?: 'usd' | 'eur'
  hasPassword?: boolean
  hasGoogleConnection?: boolean
}

export function SettingsForm({ 
  profile, 
  hasStripeCustomer, 
  trialDaysRemaining, 
  isTrialExpired, 
  currency: initialCurrency = 'usd', 
  hasPassword: initialHasPassword = false, 
  hasGoogleConnection: initialHasGoogleConnection = false 
}: SettingsFormProps) {
  const [mounted, setMounted] = useState(false)
  const [currency, setCurrency] = useState<'usd' | 'eur'>(initialCurrency)
  const [hasPassword, setHasPassword] = useState<boolean>(initialHasPassword)

  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)
  const integrationsRef = useRef<HTMLDivElement>(null)
  const supportRef = useRef<HTMLDivElement>(null)

  // Set mounted flag after hydration to prevent flickering
  useEffect(() => {
    setMounted(true)
    
    // Add staggered animations after mount with smooth transitions
    const timer1 = setTimeout(() => {
      if (card1Ref.current) {
        card1Ref.current.classList.add('slide-up')
      }
    }, 50)
    
    const timer2 = setTimeout(() => {
      if (card2Ref.current) {
        card2Ref.current.classList.add('slide-up')
      }
    }, 150)
    
    const timer3 = setTimeout(() => {
      if (card3Ref.current) {
        card3Ref.current.classList.add('slide-up')
      }
    }, 250)
    
    const timer4 = setTimeout(() => {
      if (integrationsRef.current) {
        integrationsRef.current.classList.add('slide-up')
      }
    }, 350)
    
    const timer5 = setTimeout(() => {
      if (supportRef.current) {
        supportRef.current.classList.add('slide-up')
      }
    }, 450)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
    }
  }, [])

  const handlePasswordAdded = useCallback(() => {
    setHasPassword(true)
  }, [])

  const handlePasswordChanged = useCallback(() => {
    // Password changed successfully
  }, [])

  const handleCurrencyChange = useCallback((newCurrency: 'usd' | 'eur') => {
    setCurrency(newCurrency)
  }, [])

  // Prevent rendering before hydration to avoid flickering
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 h-64 animate-pulse" />
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 h-64 animate-pulse" />
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 h-64 animate-pulse" />
        </div>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 h-96 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Section - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Column 1: Subscription */}
        <div ref={card1Ref} className="opacity-0 translate-y-4">
          <BillingSettings
            subscriptionTier={profile.subscription_tier}
            subscriptionStatus={profile.subscription_status}
            hasStripeCustomer={hasStripeCustomer}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
          />
        </div>

        {/* Column 2: Account Connection */}
        <div ref={card2Ref} className="opacity-0 translate-y-4">
          <ProfileSettings
            hasGoogleConnection={initialHasGoogleConnection}
            hasPassword={hasPassword}
            onPasswordAdded={handlePasswordAdded}
            onPasswordChanged={handlePasswordChanged}
          />
        </div>

        {/* Column 3: Delete Account */}
        <div ref={card3Ref} className="opacity-0 translate-y-4">
          <DeleteAccountSection email={profile.email} />
        </div>
      </div>

      {/* Integrations Section */}
      <div ref={integrationsRef} className="opacity-0 translate-y-4">
        <AlertSettings
          profileId={profile.id}
          email={profile.email}
          initialSlackWebhook={profile.slack_webhook_url || ''}
          initialDiscordWebhook={profile.discord_webhook_url || ''}
          initialCustomWebhook={profile.custom_webhook_url || ''}
          initialAlertEmail={profile.alert_email || ''}
          initialDisableEmailAlerts={profile.disable_email_alerts || false}
          subscriptionTier={profile.subscription_tier}
          subscriptionStatus={profile.subscription_status}
          trialDaysRemaining={trialDaysRemaining}
          isTrialExpired={isTrialExpired}
        />
      </div>

      {/* Support Section */}
      <div ref={supportRef} className="opacity-0 translate-y-4">
        <SupportForm email={profile.email} />
      </div>
    </div>
  )
}
