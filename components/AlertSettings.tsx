'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { getErrorMessage } from '@/lib/error-utils'

interface AlertSettingsProps {
  profileId: string
  email: string
  initialSlackWebhook: string
  initialDiscordWebhook: string
  initialCustomWebhook: string
  initialAlertEmail: string
  initialDisableEmailAlerts: boolean
  subscriptionTier: string
  subscriptionStatus: string
  trialDaysRemaining?: number | null
  isTrialExpired?: boolean
}

export const AlertSettings = React.memo(function AlertSettings({
  profileId,
  email,
  initialSlackWebhook,
  initialDiscordWebhook,
  initialCustomWebhook,
  initialAlertEmail,
  initialDisableEmailAlerts,
  subscriptionTier,
  subscriptionStatus,
  trialDaysRemaining,
  isTrialExpired,
}: AlertSettingsProps) {
  const [slackWebhook, setSlackWebhook] = useState(initialSlackWebhook)
  const [discordWebhook, setDiscordWebhook] = useState(initialDiscordWebhook)
  const [customWebhook, setCustomWebhook] = useState(initialCustomWebhook)
  const [alertEmail, setAlertEmail] = useState(initialAlertEmail)
  const [disableEmailAlerts, setDisableEmailAlerts] = useState(initialDisableEmailAlerts)
  const [loading, setLoading] = useState(false)
  const [testAlertSuccess, setTestAlertSuccess] = useState(false)
  const [testAlertError, setTestAlertError] = useState<string | null>(null)
  const [settingsSuccess, setSettingsSuccess] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check which features are available for this tier
  const tier = subscriptionTier || 'free'
  const isTrial = !isTrialExpired && trialDaysRemaining !== null && subscriptionStatus === 'trialing' && tier === 'free'
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(tier) || isTrial
  const hasCustomWebhook = tier === 'team'

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSettingsError(null)
    setSettingsSuccess(false)
    setTestAlertError(null)
    setTestAlertSuccess(false)

    // Validate webhook URLs before saving
    if (slackWebhook) {
      try {
        const { validateWebhookUrl } = await import('@/lib/webhooks-validator')
        const validation = validateWebhookUrl(slackWebhook, 'slack')
        if (!validation.valid) {
          setSettingsError(`Slack webhook: ${validation.error}`)
          setLoading(false)
          return
        }
      } catch (err) {
        setSettingsError('Failed to validate Slack webhook URL')
        setLoading(false)
        return
      }
    }

    if (discordWebhook) {
      try {
        const { validateWebhookUrl } = await import('@/lib/webhooks-validator')
        const validation = validateWebhookUrl(discordWebhook, 'discord')
        if (!validation.valid) {
          setSettingsError(`Discord webhook: ${validation.error}`)
          setLoading(false)
          return
        }
      } catch (err) {
        setSettingsError('Failed to validate Discord webhook URL')
        setLoading(false)
        return
      }
    }

    // Validate custom webhook if provided (only for team tier)
    if (customWebhook && hasCustomWebhook) {
      try {
        const url = new URL(customWebhook)
        if (!['http:', 'https:'].includes(url.protocol)) {
          setSettingsError('Custom webhook URL must use HTTP or HTTPS')
          setLoading(false)
          return
        }
      } catch (err) {
        setSettingsError('Invalid custom webhook URL format')
        setLoading(false)
        return
      }
    }

    // Validate alert email if provided
    if (alertEmail && alertEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(alertEmail.trim())) {
        setSettingsError('Invalid email address format')
        setLoading(false)
        return
      }
    }

    // Block webhooks if tier doesn't support them
    if (!hasSlackDiscord && (slackWebhook || discordWebhook)) {
      setSettingsError('Slack and Discord webhooks are only available on Starter, Pro, or Team plans. Upgrade your plan to use these features.')
      setLoading(false)
      return
    }

    if (!hasCustomWebhook && customWebhook) {
      setSettingsError('Custom webhooks are only available on Team plan. Upgrade to Team plan to use this feature.')
      setLoading(false)
      return
    }

    const updateData: Record<string, string | boolean | null> = {}
    
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
    
    // Only allow disabling email alerts if at least one webhook is configured
    const hasAnyWebhook = !!(slackWebhook.trim() || discordWebhook.trim() || customWebhook.trim())
    if (hasAnyWebhook) {
      updateData.disable_email_alerts = disableEmailAlerts
    } else {
      // If no webhooks, force enable email alerts
      updateData.disable_email_alerts = false
    }

    // Update profile
    const { error: updateError } = await (supabase
      .from('profiles') as any)
      .update(updateData)
      .eq('id', profileId)

    if (updateError) {
      setSettingsError(updateError.message)
      setLoading(false)
    } else {
      setSettingsSuccess(true)
      setLoading(false)
      setTimeout(() => setSettingsSuccess(false), 3000)
      router.refresh()
    }
  }, [
    slackWebhook,
    discordWebhook,
    customWebhook,
    alertEmail,
    disableEmailAlerts,
    hasSlackDiscord,
    hasCustomWebhook,
    profileId,
    supabase,
    router,
  ])

  const handleTestAlert = useCallback(async () => {
    setLoading(true)
    setTestAlertError(null)
    setTestAlertSuccess(false)

    try {
      // Send current form values (before saving) to test
      const response = await fetch('/api/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert_email: alertEmail.trim() || undefined,
          slack_webhook_url: slackWebhook.trim() || undefined,
          discord_webhook_url: discordWebhook.trim() || undefined,
          custom_webhook_url: customWebhook.trim() || undefined,
          disable_email_alerts: disableEmailAlerts,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send test alert')
      }

      if (data.success) {
        setTestAlertSuccess(true)
        setTimeout(() => setTestAlertSuccess(false), 5000)
      } else {
        throw new Error(data.error || 'Failed to send test alert')
      }
    } catch (err: unknown) {
      setTestAlertError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [alertEmail, slackWebhook, discordWebhook, customWebhook, disableEmailAlerts])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 card-hover">
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
            placeholder={email || 'your-email@example.com'}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30"
          />
          <p className="mt-1 text-sm text-muted-foreground">
            Email address to receive alerts. If not set, alerts will be sent to your account email ({email}).
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

        {/* Disable Email Alerts Option */}
        {(slackWebhook.trim() || discordWebhook.trim() || customWebhook.trim()) && (
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 border border-border rounded-lg hover:bg-muted/40 transition-smooth">
            <button
              type="button"
              onClick={() => setDisableEmailAlerts(!disableEmailAlerts)}
              className="relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
              style={{
                backgroundColor: disableEmailAlerts ? 'rgb(var(--primary))' : 'transparent',
                borderColor: disableEmailAlerts ? 'rgb(var(--primary))' : 'rgb(var(--input))',
              }}
              aria-label="Disable email alerts"
            >
              {disableEmailAlerts && (
                <svg
                  className="absolute inset-0 w-full h-full text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <label
                htmlFor="disableEmailAlerts"
                onClick={() => setDisableEmailAlerts(!disableEmailAlerts)}
                className="text-sm font-medium cursor-pointer block"
              >
                Disable email alerts
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                When enabled, alerts will only be sent via configured webhooks (Slack, Discord, or Custom). Email alerts will be disabled.
              </p>
            </div>
          </div>
        )}

        {(testAlertError || testAlertSuccess || settingsError || settingsSuccess) && (
          <div className="space-y-2">
            {testAlertError && (
              <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {testAlertError}
              </div>
            )}
            {testAlertSuccess && (
              <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                Test alert sent successfully! Check your configured integrations (email, Slack, Discord, or custom webhook).
              </div>
            )}
            {settingsError && (
              <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                {settingsError}
              </div>
            )}
            {settingsSuccess && (
              <div className="bg-success/10 border border-success/20 text-success px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm">
                Settings saved successfully!
              </div>
            )}
          </div>
        )}
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
  )
})

