'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WarningTooltip, InfoTooltip } from './Tooltip'
import { WarningIcon, InfoIcon } from './Icons'
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
}

export function SettingsForm({ profile, hasStripeCustomer, trialDaysRemaining, isTrialExpired, currency: initialCurrency = 'usd' }: SettingsFormProps) {
  const [slackWebhook, setSlackWebhook] = useState(profile.slack_webhook_url || '')
  const [discordWebhook, setDiscordWebhook] = useState(profile.discord_webhook_url || '')
  const [customWebhook, setCustomWebhook] = useState(profile.custom_webhook_url || '')
  const [alertEmail, setAlertEmail] = useState(profile.alert_email || '')
  const [currency, setCurrency] = useState<'usd' | 'eur' | 'pln'>(initialCurrency)
  const [loading, setLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  // Check which features are available for this tier
  const tier = profile.subscription_tier || 'free'
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(tier)
  const hasCustomWebhook = tier === 'team'

  // Check if user has password on mount
  useEffect(() => {
    const checkPassword = async () => {
      try {
        const response = await fetch('/api/auth/check-password')
        if (response.ok) {
          const data = await response.json()
          setHasPassword(data.hasPassword)
        }
      } catch (err) {
        console.error('Error checking password:', err)
      }
    }
    checkPassword()
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Subscription Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Subscription</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Plan:</span>
            <span className="capitalize font-semibold">{profile.subscription_tier}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
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
          {hasStripeCustomer ? (
            <div className="pt-2 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href="/dashboard/billing"
                  className="inline-block w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift text-center"
                >
                  Upgrade Plan
                </Link>
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-block w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-smooth text-center border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {portalLoading ? 'Loading...' : 'Manage Subscription'}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Upgrade your plan to get more features, or manage your subscription, payment method, and invoices in Stripe Customer Portal.
              </p>
            </div>
          ) : tier !== 'free' ? (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">
                To manage your subscription, please contact support or visit Stripe Dashboard.
              </p>
              <Link
                href="/dashboard/billing"
                className="inline-block bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-smooth"
              >
                View Plans
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <Link
                href="/dashboard/billing"
                className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-smooth hover-lift"
              >
                Upgrade Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Integrations Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Alert Integrations</h2>
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
              className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Email address to receive alerts. If not set, alerts will be sent to your account email ({profile.email}).
            </p>
          </div>

          <div>
            <label htmlFor="slack" className="flex items-center gap-2 text-sm font-medium mb-2">
              Slack Webhook URL
              {!hasSlackDiscord && (
                <WarningTooltip content="This feature is available on Starter, Pro, or Team plans. Upgrade your plan to use Slack webhooks.">
                  <button type="button" className="text-warning hover:text-warning/80 transition-smooth">
                    <WarningIcon className="w-4 h-4" />
                  </button>
                </WarningTooltip>
              )}
            </label>
            <input
              id="slack"
              type="url"
              value={slackWebhook}
              onChange={(e) => setSlackWebhook(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              disabled={!hasSlackDiscord}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
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
              {!hasSlackDiscord && (
                <WarningTooltip content="This feature is available on Starter, Pro, or Team plans. Upgrade your plan to use Discord webhooks.">
                  <button type="button" className="text-warning hover:text-warning/80 transition-smooth">
                    <WarningIcon className="w-4 h-4" />
                  </button>
                </WarningTooltip>
              )}
            </label>
            <input
              id="discord"
              type="url"
              value={discordWebhook}
              onChange={(e) => setDiscordWebhook(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
              disabled={!hasSlackDiscord}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
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
              {!hasCustomWebhook && (
                <WarningTooltip content="Custom webhooks are only available on Team plan. Upgrade to Team plan to use this feature.">
                  <button type="button" className="text-warning hover:text-warning/80 transition-smooth">
                    <WarningIcon className="w-4 h-4" />
                  </button>
                </WarningTooltip>
              )}
            </label>
            <input
              id="customWebhook"
              type="url"
              value={customWebhook}
              onChange={(e) => setCustomWebhook(e.target.value)}
              placeholder="https://your-custom-endpoint.com/webhook"
              disabled={!hasCustomWebhook}
              className={`w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
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

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={loading}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent disabled:opacity-50 transition-smooth"
            >
              Test Alert
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth hover-lift"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Security Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Account Security</h2>
        
        {hasPassword === null ? (
          <p className="text-sm text-muted-foreground">Checking...</p>
        ) : hasPassword ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ✅ You can sign in with your email and password or Google.
            </p>
            <p className="text-xs text-muted-foreground">
              To change your password, please use the password reset feature on the login page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleAddPassword} className="space-y-4" noValidate>
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
              <p className="text-sm text-muted-foreground mb-3">
                You signed up with Google. Add a password to also sign in with your email and password.
              </p>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
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
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
            </div>
            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
                ✅ Password added successfully! You can now sign in with your email and password.
              </div>
            )}
            <button
              type="submit"
              disabled={passwordLoading || passwordErrors.length > 0 || !password || password !== passwordConfirm}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-smooth hover-lift"
            >
              {passwordLoading ? 'Adding Password...' : 'Add Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

