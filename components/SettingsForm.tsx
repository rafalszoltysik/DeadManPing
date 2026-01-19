'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { InfoTooltip } from './Tooltip'
import { InfoIcon, EyeIcon, EyeOffIcon } from './Icons'
import { validatePassword } from '@/lib/password-validator'

interface Profile {
  id: string
  email: string
  subscription_tier: string
  subscription_status: string
  slack_webhook_url: string | null
  discord_webhook_url: string | null
  custom_webhook_url: string | null
  alert_email: string | null
}

interface SettingsFormProps {
  profile: Profile
  hasStripeCustomer: boolean
  trialDaysRemaining?: number | null
  isTrialExpired?: boolean
  currency?: 'usd' | 'eur' | 'pln'
  hasPassword?: boolean
  hasGoogleConnection?: boolean
}

export function SettingsForm({ profile, hasStripeCustomer, trialDaysRemaining, isTrialExpired, currency: initialCurrency = 'usd', hasPassword: initialHasPassword = false, hasGoogleConnection: initialHasGoogleConnection = false }: SettingsFormProps) {
  const [mounted, setMounted] = useState(false)
  const [slackWebhook, setSlackWebhook] = useState(profile.slack_webhook_url || '')
  const [discordWebhook, setDiscordWebhook] = useState(profile.discord_webhook_url || '')
  const [customWebhook, setCustomWebhook] = useState(profile.custom_webhook_url || '')
  const [alertEmail, setAlertEmail] = useState(profile.alert_email || '')
  const [currency, setCurrency] = useState<'usd' | 'eur' | 'pln'>(initialCurrency)
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean>(initialHasPassword)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [hasGoogleConnection, setHasGoogleConnection] = useState<boolean>(initialHasGoogleConnection)
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [supportSubject, setSupportSubject] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [supportLoading, setSupportLoading] = useState(false)
  const [supportError, setSupportError] = useState<string | null>(null)
  const [supportSuccess, setSupportSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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

  // Check which features are available for this tier
  const tier = profile.subscription_tier || 'free'
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(tier)
  const hasCustomWebhook = tier === 'team'

  const handlePasswordChange = (newPassword: string) => {
    setPassword(newPassword)
    const validation = validatePassword(newPassword)
    if (!validation.valid) {
      setPasswordErrors(validation.errors)
    } else {
      setPasswordErrors([])
    }
  }

  const handleAddPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setError(null)
    setSuccess(false)

    if (!password) {
      setError('Password is required')
      setPasswordLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match')
      setPasswordLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setPasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/add-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add password')
      }

      setSuccess(true)
      setPassword('')
      setPasswordConfirm('')
      setPasswordErrors([])
      setHasPassword(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to add password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangePasswordLoading(true)
    setError(null)
    setSuccess(false)

    if (!currentPassword) {
      setError('Current password is required')
      setChangePasswordLoading(false)
      return
    }

    if (!password) {
      setError('New password is required')
      setChangePasswordLoading(false)
      return
    }

    if (password !== passwordConfirm) {
      setError('New passwords do not match')
      setChangePasswordLoading(false)
      return
    }

    if (currentPassword === password) {
      setError('New password must be different from current password')
      setChangePasswordLoading(false)
      return
    }

    const validation = validatePassword(password)
    if (!validation.valid) {
      setError(validation.errors.join('. '))
      setChangePasswordLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword,
          newPassword: password 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      setSuccess(true)
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirm('')
      setPasswordErrors([])
      setShowChangePassword(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to change password')
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleCurrencySubmit = async (e: React.FormEvent) => {
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
      } catch (err: any) {
        setError(err.message || 'Failed to update currency')
        setLoading(false)
        return
      }
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate webhook URLs before saving
    if (slackWebhook) {
      try {
        const { validateWebhookUrl } = await import('@/lib/webhooks-validator')
        const validation = validateWebhookUrl(slackWebhook, 'slack')
        if (!validation.valid) {
          setError(`Slack webhook: ${validation.error}`)
          setLoading(false)
          return
        }
      } catch (err) {
        setError('Failed to validate Slack webhook URL')
        setLoading(false)
        return
      }
    }

    if (discordWebhook) {
      try {
        const { validateWebhookUrl } = await import('@/lib/webhooks-validator')
        const validation = validateWebhookUrl(discordWebhook, 'discord')
        if (!validation.valid) {
          setError(`Discord webhook: ${validation.error}`)
          setLoading(false)
          return
        }
      } catch (err) {
        setError('Failed to validate Discord webhook URL')
        setLoading(false)
        return
      }
    }

    // Validate custom webhook if provided (only for team tier)
    if (customWebhook && hasCustomWebhook) {
      try {
        const url = new URL(customWebhook)
        if (!['http:', 'https:'].includes(url.protocol)) {
          setError('Custom webhook URL must use HTTP or HTTPS')
          setLoading(false)
          return
        }
      } catch (err) {
        setError('Invalid custom webhook URL format')
        setLoading(false)
        return
      }
    }

    // Validate alert email if provided
    if (alertEmail && alertEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(alertEmail.trim())) {
        setError('Invalid email address format')
        setLoading(false)
        return
      }
    }

    // Block webhooks if tier doesn't support them
    if (!hasSlackDiscord && (slackWebhook || discordWebhook)) {
      setError('Slack and Discord webhooks are only available on Starter, Pro, or Team plans. Upgrade your plan to use these features.')
      setLoading(false)
      return
    }

    if (!hasCustomWebhook && customWebhook) {
      setError('Custom webhooks are only available on Team plan. Upgrade to Team plan to use this feature.')
      setLoading(false)
      return
    }

    const updateData: any = {}
    
    // Only update webhooks if tier supports them
    if (hasSlackDiscord) {
      updateData.slack_webhook_url = slackWebhook || null
      updateData.discord_webhook_url = discordWebhook || null
    } else {
      // Clear webhooks if downgraded
      updateData.slack_webhook_url = null
      updateData.discord_webhook_url = null
    }

    if (hasCustomWebhook) {
      updateData.custom_webhook_url = customWebhook || null
    } else {
      updateData.custom_webhook_url = null
    }

    // Always allow alert_email update
    updateData.alert_email = alertEmail.trim() || null

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      router.refresh()
    }
  }

  const handleTestAlert = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/internal/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monitor_id: 'test', // This will fail but trigger the test
          alert_type: 'recovered',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send test alert')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
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
    } catch (err: any) {
      setError(err.message)
      setPortalLoading(false)
    }
  }

  const handleLinkGoogle = async () => {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      const redirectTo = `${appUrl}/auth/callback?redirect=${encodeURIComponent('/dashboard/settings')}`
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data?.url) {
        window.location.href = data.url
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link Google account')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('A confirmation email will be sent to your email address. Click the link in the email to complete the account deletion process.')) {
      return
    }

    setDeleteAccountLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/auth/request-delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send deletion email')
      }

      setSuccess(true)
      setError(null)
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send deletion email')
    } finally {
      setDeleteAccountLoading(false)
    }
  }

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSupportLoading(true)
    setSupportError(null)
    setSupportSuccess(false)

    if (!supportSubject.trim()) {
      setSupportError('Subject is required')
      setSupportLoading(false)
      return
    }

    if (!supportMessage.trim()) {
      setSupportError('Message is required')
      setSupportLoading(false)
      return
    }

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: supportSubject.trim(),
          message: supportMessage.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSupportSuccess(true)
      setSupportSubject('')
      setSupportMessage('')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSupportSuccess(false), 5000)
    } catch (err: any) {
      setSupportError(err.message || 'Failed to send message')
    } finally {
      setSupportLoading(false)
    }
  }

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
        <div ref={card1Ref} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover opacity-0 translate-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Subscription</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium">Plan:</span>
              <span className="text-sm sm:text-base capitalize font-semibold">{profile.subscription_tier}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-medium">Status:</span>
              <span className={`capitalize px-2 py-1 rounded text-xs font-medium ${
                profile.subscription_status === 'active' 
                  ? 'bg-success/10 text-success' 
                  : profile.subscription_status === 'trialing'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {profile.subscription_status}
              </span>
            </div>
          </div>
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
            ) : tier !== 'free' ? (
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

        {/* Column 2: Account Connection */}
        <div ref={card2Ref} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover opacity-0 translate-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Account Connection</h2>
          
          <div className="space-y-4 sm:space-y-6 flex-1">
            {/* Google Connection */}
            <div>
              <h3 className="text-sm font-medium mb-2">Google Account</h3>
              {hasGoogleConnection ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your account is connected to Google. You can sign in with Google.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Link your Google account to sign in with Google.
                  </p>
                </div>
              )}
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Password</h3>
              {hasPassword ? (
                <div>
                  {!showChangePassword ? (
                    <p className="text-sm text-muted-foreground">
                      You have a password set. You can sign in with your email and password.
                    </p>
                  ) : (
                      <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter your current password and new password.
                      </p>
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
                            aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                          >
                            {showCurrentPassword ? (
                              <EyeOffIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="changePassword" className="flex items-center gap-2 text-sm font-medium mb-2">
                          New Password
                          <InfoTooltip 
                            content={
                              <div className="space-y-1">
                                <p className="font-semibold mb-1">Password requirements:</p>
                                <ul className="list-disc list-inside space-y-0.5 text-xs">
                                  <li>At least 8 characters</li>
                                  <li>One uppercase letter</li>
                                  <li>One lowercase letter</li>
                                  <li>One number</li>
                                  <li>One special character</li>
                                </ul>
                              </div>
                            }
                            position="right"
                          >
                            <button type="button" className="text-muted-foreground hover:text-foreground transition-smooth">
                              <InfoIcon className="w-4 h-4" />
                            </button>
                          </InfoTooltip>
                        </label>
                        <div className="relative">
                          <input
                            id="changePassword"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.length > 0 && (
                          <ul className="mt-2 text-sm text-error space-y-1">
                            {passwordErrors.map((err, idx) => (
                              <li key={idx}>• {err}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div>
                        <label htmlFor="changePasswordConfirm" className="block text-sm font-medium mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="changePasswordConfirm"
                            type={showPasswordConfirm ? "text" : "password"}
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth active:scale-90"
                            aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                          >
                            {showPasswordConfirm ? (
                              <EyeOffIcon className="w-5 h-5" />
                            ) : (
                              <EyeIcon className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                          {error}
                        </div>
                      )}
                      {success && (
                        <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                          Password changed successfully.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Add a password to sign in with your email and password.
                  </p>
                  <div>
                    <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium mb-2">
                      Add Password
                      <InfoTooltip 
                        content={
                          <div className="space-y-1">
                            <p className="font-semibold mb-1">Password requirements:</p>
                            <ul className="list-disc list-inside space-y-0.5 text-xs">
                              <li>At least 8 characters</li>
                              <li>One uppercase letter</li>
                              <li>One lowercase letter</li>
                              <li>One number</li>
                              <li>One special character</li>
                            </ul>
                          </div>
                        }
                        position="right"
                      >
                        <button type="button" className="text-muted-foreground hover:text-foreground transition-smooth">
                          <InfoIcon className="w-4 h-4" />
                        </button>
                      </InfoTooltip>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.length > 0 && (
                      <ul className="mt-2 text-sm text-error space-y-1">
                        {passwordErrors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="passwordConfirm"
                        type={showPasswordConfirm ? "text" : "password"}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-3 py-2 pr-10 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                        aria-label={showPasswordConfirm ? "Hide password" : "Show password"}
                      >
                        {showPasswordConfirm ? (
                          <EyeOffIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                      Password added successfully. You can now sign in with your email and password.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buttons at the bottom */}
          <div className="mt-auto pt-3 sm:pt-4 space-y-2">
            {/* Google Account Button */}
            {!hasGoogleConnection && (
              <button
                onClick={handleLinkGoogle}
                className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-smooth border border-border active:scale-95 hover:border-primary/20 hover:shadow-sm"
              >
                Link Google Account
              </button>
            )}

            {/* Password Buttons */}
            {hasPassword && !showChangePassword && (
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium transition-smooth border border-border active:scale-95 hover:border-primary/20 hover:shadow-sm"
              >
                Change Password
              </button>
            )}

            {hasPassword && showChangePassword && (
              <form onSubmit={handleChangePassword} noValidate>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false)
                      setCurrentPassword('')
                      setPassword('')
                      setPasswordConfirm('')
                      setPasswordErrors([])
                      setError(null)
                      setSuccess(false)
                    }}
                    className="flex-1 px-3 sm:px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth active:scale-95 hover:border-primary/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changePasswordLoading || passwordErrors.length > 0 || !currentPassword || !password || password !== passwordConfirm}
                    className="flex-1 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
                  >
                    {changePasswordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {!hasPassword && (
              <form onSubmit={handleAddPassword} noValidate>
                <button
                  type="submit"
                  disabled={passwordLoading || passwordErrors.length > 0 || !password || password !== passwordConfirm}
                  className="w-full px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
                >
                  {passwordLoading ? 'Adding Password...' : 'Add Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Column 3: Delete Account */}
        <div ref={card3Ref} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 flex flex-col h-full card-hover opacity-0 translate-y-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Delete Account</h2>
          <div className="flex-1 flex flex-col">
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm font-medium text-error mb-2">
                Warning: This action cannot be undone
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                Deleting your account will permanently delete all your data, including monitors, pings, and alerts. 
                Your subscription will be canceled immediately.
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Process:</strong> Click the button below to receive a confirmation email. You'll need to click the link in the email to complete the deletion.
              </p>
            </div>
            <div className="mt-auto space-y-2 sm:space-y-3">
              {error && (
                <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                  <p className="font-medium mb-1">Deletion email sent</p>
                  <p className="text-xs sm:text-sm">
                    Please check your email ({profile.email}) and click the confirmation link to delete your account. The link will expire in 24 hours.
                  </p>
                </div>
              )}
              <button
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading || success}
                className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground border border-error/20 rounded-lg text-sm font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth active:scale-95 hover:border-error/40 hover:shadow-sm"
              >
                {deleteAccountLoading ? 'Sending Email...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Section */}
      <div ref={integrationsRef} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 card-hover opacity-0 translate-y-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Alert Integrations</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          <div>
            <label htmlFor="alertEmail" className="block text-sm font-medium mb-2">
              Alert Email Address
            </label>
            <input
              id="alertEmail"
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder={profile.email || 'your-email@example.com'}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Email address to receive alerts. If not set, alerts will be sent to your account email ({profile.email}).
            </p>
          </div>

          <div>
            <label htmlFor="slack" className="flex items-center gap-2 text-sm font-medium mb-2">
              Slack Webhook URL
            </label>
            <input
              id="slack"
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              disabled={!hasSlackDiscord}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 ${
                !hasSlackDiscord ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {hasSlackDiscord ? (
                <>
                  Get your webhook URL from{' '}
                  <a
                    href="https://api.slack.com/messaging/webhooks"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-smooth"
                  >
                    Slack API
                  </a>
                </>
              ) : (
                'Available on Starter, Pro, or Team plans'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="discord" className="flex items-center gap-2 text-sm font-medium mb-2">
              Discord Webhook URL
            </label>
            <input
              id="discord"
              type="url"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              disabled={!hasSlackDiscord}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 ${
                !hasSlackDiscord ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {hasSlackDiscord ? (
                'Get your webhook URL from Discord channel settings'
              ) : (
                'Available on Starter, Pro, or Team plans'
              )}
            </p>
          </div>

          <div>
            <label htmlFor="customWebhook" className="flex items-center gap-2 text-sm font-medium mb-2">
              Custom Webhook URL
            </label>
            <input
              id="customWebhook"
              type="url"
              value={customWebhook}
              onChange={(e) => setCustomWebhook(e.target.value)}
              placeholder="https://your-custom-endpoint.com/webhook"
              disabled={!hasCustomWebhook}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 ${
                !hasCustomWebhook ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {hasCustomWebhook ? (
                'Send alerts to any custom webhook endpoint (PagerDuty, OpsGenie, etc.)'
              ) : (
                'Available on Team plan only. Upgrade to Team plan to use custom webhooks.'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={loading}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-smooth active:scale-95 hover:border-primary/20 hover:shadow-sm"
            >
              Test Alert
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth hover-lift active:scale-95"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Support Section */}
      <div id="support" ref={supportRef} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 card-hover opacity-0 translate-y-4">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact Support</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Have a question or need help? Send us a message and we'll get back to you as soon as possible.
        </p>
        <form onSubmit={handleSupportSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="supportSubject" className="block text-sm font-medium mb-2">
              Subject
            </label>
            <input
              id="supportSubject"
              type="text"
              value={supportSubject}
              onChange={(e) => setSupportSubject(e.target.value)}
              placeholder="What can we help you with?"
              maxLength={200}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
            />
          </div>

          <div>
            <label htmlFor="supportMessage" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="supportMessage"
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Please describe your question or issue in detail..."
              rows={6}
              maxLength={5000}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 resize-y"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {supportMessage.length}/5000 characters
            </p>
          </div>

          {supportError && (
            <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              {supportError}
            </div>
          )}

          {supportSuccess && (
            <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
              Your message has been sent successfully. We will get back to you soon at {profile.email}.
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={supportLoading || !supportSubject.trim() || !supportMessage.trim()}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift active:scale-95"
            >
              {supportLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Your message will be sent to our support inbox. We'll get back to you as soon as possible.
          </p>
        </form>
      </div>

    </div>
  )
}

