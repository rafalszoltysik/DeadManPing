'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { Monitor, MonitorUpdateRequest, AlertChannels } from '@/lib/types/monitor'
import { getErrorMessage } from '@/lib/error-utils'

interface MonitorAlertChannelsProps {
  monitor: Monitor
  userTier: string
  loading: boolean
  onUpdate: (updatedMonitor: Monitor) => void
  onRefresh: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const MonitorAlertChannels = memo(function MonitorAlertChannels({
  monitor,
  userTier,
  loading,
  onUpdate,
  onRefresh,
  setLoading: setParentLoading,
}: MonitorAlertChannelsProps) {
  const [editingAlertChannels, setEditingAlertChannels] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [customWebhook, setCustomWebhook] = useState('')
  const [alertChannelsError, setAlertChannelsError] = useState<string | null>(null)
  const [alertChannelsSuccess, setAlertChannelsSuccess] = useState(false)

  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Load existing alert channel overrides
  useEffect(() => {
    if (monitor.alert_email) setAlertEmail(monitor.alert_email)
    if (monitor.slack_webhook_url) setSlackWebhook(monitor.slack_webhook_url)
    if (monitor.discord_webhook_url) setDiscordWebhook(monitor.discord_webhook_url)
    if (monitor.custom_webhook_url) setCustomWebhook(monitor.custom_webhook_url)
  }, [monitor.alert_email, monitor.slack_webhook_url, monitor.discord_webhook_url, monitor.custom_webhook_url])

  const handleSaveAlertChannels = useCallback(async () => {
    setParentLoading(true)
    setAlertChannelsError(null)
    setAlertChannelsSuccess(false)

    const alertChannels: AlertChannels = {}
    if (alertEmail.trim()) {
      alertChannels.alertEmail = alertEmail.trim()
    }
    if (slackWebhook.trim() && hasSlackDiscord) {
      alertChannels.slackWebhookUrl = slackWebhook.trim()
    }
    if (discordWebhook.trim() && hasSlackDiscord) {
      alertChannels.discordWebhookUrl = discordWebhook.trim()
    }
    if (customWebhook.trim() && hasCustomWebhook) {
      alertChannels.customWebhookUrl = customWebhook.trim()
    }

    const requestBody: MonitorUpdateRequest = {
      alertChannels: Object.keys(alertChannels).length > 0 ? alertChannels : null,
      expectedUpdatedAt: monitor.updated_at,
    }

    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.conflict && data.latestMonitor) {
          onUpdate(data.latestMonitor)
          throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
        }
        throw new Error(data.error || 'Failed to update alert channels')
      }

      const data = await response.json()
      if (data.monitor) {
        onUpdate(data.monitor)
      }

      setAlertChannelsSuccess(true)
      setEditingAlertChannels(false)
      await onRefresh()
      setTimeout(() => {
        setAlertChannelsSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setAlertChannelsError(errorMessage)
    } finally {
      setParentLoading(false)
    }
  }, [
    alertEmail,
    slackWebhook,
    discordWebhook,
    customWebhook,
    hasSlackDiscord,
    hasCustomWebhook,
    monitor.slug,
    monitor.updated_at,
    onUpdate,
    onRefresh,
    setParentLoading,
  ])

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">Alert Channels Override</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Override global alert settings for this monitor
          </p>
        </div>
        {!editingAlertChannels && (
          <button
            onClick={() => setEditingAlertChannels(true)}
            className="px-3 py-1.5 text-xs sm:text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
          >
            {monitor.alert_email || monitor.slack_webhook_url || monitor.discord_webhook_url || monitor.custom_webhook_url ? 'Edit' : 'Configure'}
          </button>
        )}
      </div>

      {alertChannelsError && (
        <div className="mx-4 sm:mx-6 mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
          {alertChannelsError}
        </div>
      )}

      {alertChannelsSuccess && (
        <div className="mx-4 sm:mx-6 mt-4 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg text-sm">
          Alert channels updated successfully!
        </div>
      )}

      {editingAlertChannels ? (
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="alertEmail" className="block text-sm font-medium mb-2">
              Alert Email Address
            </label>
            <input
              id="alertEmail"
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Leave empty to use workspace default"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Override email address for alerts from this monitor
            </p>
          </div>

          {hasSlackDiscord && (
            <>
              <div>
                <label htmlFor="slackWebhook" className="block text-sm font-medium mb-2">
                  Slack Webhook URL
                </label>
                <input
                  id="slackWebhook"
                  type="url"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                  placeholder="Leave empty to use workspace default"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Override Slack webhook for this monitor
                </p>
              </div>

              <div>
                <label htmlFor="discordWebhook" className="block text-sm font-medium mb-2">
                  Discord Webhook URL
                </label>
                <input
                  id="discordWebhook"
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="Leave empty to use workspace default"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Override Discord webhook for this monitor
                </p>
              </div>
            </>
          )}

          {hasCustomWebhook && (
            <div>
              <label htmlFor="customWebhook" className="block text-sm font-medium mb-2">
                Custom Webhook URL
              </label>
              <input
                id="customWebhook"
                type="url"
                value={customWebhook}
                onChange={(e) => setCustomWebhook(e.target.value)}
                placeholder="Leave empty to use workspace default"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Override custom webhook for this monitor (Team plan only)
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleSaveAlertChannels}
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
            >
              {loading ? 'Saving...' : 'Save Channels'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingAlertChannels(false)
                setAlertChannelsError(null)
                setAlertChannelsSuccess(false)
                setAlertEmail(monitor.alert_email || '')
                setSlackWebhook(monitor.slack_webhook_url || '')
                setDiscordWebhook(monitor.discord_webhook_url || '')
                setCustomWebhook(monitor.custom_webhook_url || '')
              }}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 sm:p-6">
          {monitor.alert_email || monitor.slack_webhook_url || monitor.discord_webhook_url || monitor.custom_webhook_url ? (
            <div className="space-y-2 text-sm">
              {monitor.alert_email && (
                <p>
                  <span className="font-medium">Alert Email:</span> {monitor.alert_email}
                </p>
              )}
              {monitor.slack_webhook_url && (
                <p>
                  <span className="font-medium">Slack Webhook:</span> Configured
                </p>
              )}
              {monitor.discord_webhook_url && (
                <p>
                  <span className="font-medium">Discord Webhook:</span> Configured
                </p>
              )}
              {monitor.custom_webhook_url && (
                <p>
                  <span className="font-medium">Custom Webhook:</span> Configured
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No alert channel overrides configured. Using workspace defaults. Click "Configure" to add overrides.
            </p>
          )}
        </div>
      )}
    </div>
  )
})

