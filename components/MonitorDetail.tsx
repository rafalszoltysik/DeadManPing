'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'

interface Monitor {
  id: string
  name: string
  slug: string
  status: 'pending' | 'healthy' | 'late' | 'failed'
  last_ping_at: string | null
  next_expected_ping_at: string | null
  expected_interval_seconds: number
  grace_period_seconds: number
  payload_validation_rules: any
  alert_email: string | null
  slack_webhook_url: string | null
  discord_webhook_url: string | null
  custom_webhook_url: string | null
  created_at: string
}

interface Ping {
  id: string
  status: 'ok' | 'fail'
  message: string | null
  duration_ms: number | null
  metadata: any
  received_at: string
}

interface MonitorDetailProps {
  monitor: Monitor
  pings: Ping[]
  pingUrl: string
  isOnboarding?: boolean
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-5 h-5" />
    case 'late':
      return <StatusLateIcon className="w-5 h-5" />
    case 'failed':
      return <StatusFailedIcon className="w-5 h-5" />
    default:
      return <StatusPendingIcon className="w-5 h-5" />
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 text-success border-success/20'
    case 'late':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'failed':
      return 'bg-error/10 text-error border-error/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'healthy':
      return 'Healthy'
    case 'late':
      return 'Late'
    case 'failed':
      return 'Failed'
    default:
      return 'Pending'
  }
}

export function MonitorDetail({ monitor, pings, pingUrl, isOnboarding }: MonitorDetailProps) {
  const [copied, setCopied] = useState(false)
  const [waitingForPing, setWaitingForPing] = useState(monitor.status === 'pending' && pings.length === 0)
  const [showPayloadValidation, setShowPayloadValidation] = useState(false)
  const [editingPayloadRules, setEditingPayloadRules] = useState(false)
  const [maxDurationMs, setMaxDurationMs] = useState<number | ''>('')
  const [minCount, setMinCount] = useState<number | ''>('')
  const [maxCount, setMaxCount] = useState<number | ''>('')
  const [requiredFields, setRequiredFields] = useState<Array<{ key: string; value: string }>>([])
  const [showAlertChannels, setShowAlertChannels] = useState(false)
  const [editingAlertChannels, setEditingAlertChannels] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [customWebhook, setCustomWebhook] = useState('')
  const [userTier, setUserTier] = useState('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Fetch user tier
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          setUserTier(data.tier || 'free')
        }
      } catch (err) {
        console.error('Error fetching user tier:', err)
      }
    }
    fetchUserTier()
  }, [])

  // Load existing payload validation rules
  useEffect(() => {
    if (monitor.payload_validation_rules) {
      const rules = monitor.payload_validation_rules
      if (rules.maxDurationMs) setMaxDurationMs(rules.maxDurationMs)
      if (rules.minCount) setMinCount(rules.minCount)
      if (rules.maxCount) setMaxCount(rules.maxCount)
      if (rules.requiredFields) {
        const fields = Object.entries(rules.requiredFields).map(([key, value]) => ({
          key,
          value: String(value === null ? '' : value),
        }))
        setRequiredFields(fields)
      }
    }
  }, [monitor.payload_validation_rules])

  // Load existing alert channel overrides
  useEffect(() => {
    if (monitor.alert_email) setAlertEmail(monitor.alert_email)
    if (monitor.slack_webhook_url) setSlackWebhook(monitor.slack_webhook_url)
    if (monitor.discord_webhook_url) setDiscordWebhook(monitor.discord_webhook_url)
    if (monitor.custom_webhook_url) setCustomWebhook(monitor.custom_webhook_url)
  }, [monitor.alert_email, monitor.slack_webhook_url, monitor.discord_webhook_url, monitor.custom_webhook_url])

  const curlCommand = `curl -X POST "${pingUrl}"`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Poll for new pings if onboarding
  useEffect(() => {
    if (isOnboarding && waitingForPing) {
      const interval = setInterval(() => {
        window.location.reload()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isOnboarding, waitingForPing])

  useEffect(() => {
    if (pings.length > 0 && waitingForPing) {
      setWaitingForPing(false)
    }
  }, [pings.length, waitingForPing])

  const handleSavePayloadRules = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Build payload validation rules
    const payloadValidationRules: any = {}
    if (maxDurationMs !== '') {
      payloadValidationRules.maxDurationMs = Number(maxDurationMs)
    }
    if (minCount !== '') {
      payloadValidationRules.minCount = Number(minCount)
    }
    if (maxCount !== '') {
      payloadValidationRules.maxCount = Number(maxCount)
    }
    if (requiredFields.length > 0) {
      const requiredFieldsObj: Record<string, any> = {}
      requiredFields.forEach((field) => {
        if (field.key.trim()) {
          let value: any = field.value.trim()
          if (value === 'true') value = true
          else if (value === 'false') value = false
          else if (!isNaN(Number(value)) && value !== '') value = Number(value)
          else if (value === '') value = null
          requiredFieldsObj[field.key.trim()] = value
        }
      })
      if (Object.keys(requiredFieldsObj).length > 0) {
        payloadValidationRules.requiredFields = requiredFieldsObj
      }
    }

    const requestBody: any = {
      payloadValidationRules: Object.keys(payloadValidationRules).length > 0 ? payloadValidationRules : null,
    }

    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update payload validation rules')
      }

      setSuccess(true)
      setEditingPayloadRules(false)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAlertChannels = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const alertChannels: any = {}
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

    const requestBody: any = {
      alertChannels: Object.keys(alertChannels).length > 0 ? alertChannels : null,
    }

    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update alert channels')
      }

      setSuccess(true)
      setEditingAlertChannels(false)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <Link href="/dashboard" className="text-primary hover:text-primary/80 text-xs sm:text-sm mb-3 sm:mb-4 inline-block transition-smooth">
          ← Back to monitors
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className={`p-2 sm:p-3 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
              {getStatusIcon(monitor.status)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{monitor.name}</h1>
              <span className={`mt-1 sm:mt-2 inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-full border ${getStatusColor(monitor.status)}`}>
                {getStatusLabel(monitor.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOnboarding && waitingForPing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Waiting for first ping...
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Copy the command below and run it in your terminal or add it to your cron job.
          </p>
          <div className="bg-background border border-border rounded-lg p-3 sm:p-4 mb-4 font-mono text-xs sm:text-sm overflow-x-auto">
            <code className="text-foreground break-all">{curlCommand}</code>
          </div>
          <button
            onClick={copyToClipboard}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto"
          >
            {copied ? '✓ Copied!' : 'Copy Command'}
          </button>
        </div>
      )}

      {!isOnboarding && (
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ping URL</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto break-all">{pingUrl}</code>
            <button
              onClick={copyToClipboard}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto flex-shrink-0"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-4">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2">Example curl command:</p>
            <code className="block bg-background border border-border px-3 py-2 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto break-all">
              {curlCommand}
            </code>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Expected Interval</h3>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {Math.floor(monitor.expected_interval_seconds / 60)} min
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Last Ping</h3>
          <p className="text-xl sm:text-2xl font-bold text-sm sm:text-base">
            {monitor.last_ping_at
              ? formatDistanceToNow(new Date(monitor.last_ping_at), { addSuffix: true })
              : 'Never'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Total Pings</h3>
          <p className="text-xl sm:text-2xl font-bold font-mono">{pings.length}</p>
        </div>
      </div>

      {/* Payload Validation Rules Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Payload Validation Rules</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configure rules to verify that your cron job executed correctly
            </p>
          </div>
          {!editingPayloadRules && (
            <button
              onClick={() => setEditingPayloadRules(true)}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-smooth"
            >
              {monitor.payload_validation_rules ? 'Edit' : 'Configure'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4 text-sm">
            Payload validation rules updated successfully!
          </div>
        )}

        {editingPayloadRules ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="maxDuration" className="block text-sm font-medium mb-2">
                Max Execution Time (milliseconds)
              </label>
              <input
                id="maxDuration"
                type="number"
                min="0"
                max="3600000"
                value={maxDurationMs}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value)
                  setMaxDurationMs(val as number | '')
                }}
                placeholder="e.g., 5000 (5 seconds)"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Alert if script execution time exceeds this value
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minCount" className="block text-sm font-medium mb-2">
                  Min Count
                </label>
                <input
                  id="minCount"
                  type="number"
                  min="0"
                  value={minCount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value)
                    setMinCount(val as number | '')
                  }}
                  placeholder="e.g., 10"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
              <div>
                <label htmlFor="maxCount" className="block text-sm font-medium mb-2">
                  Max Count
                </label>
                <input
                  id="maxCount"
                  type="number"
                  min="0"
                  value={maxCount}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value)
                    setMaxCount(val as number | '')
                  }}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground -mt-2">
              Validate that the <code className="px-1 py-0.5 bg-muted rounded">count</code> field in payload is within this range
            </p>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Required Fields
                </label>
                <button
                  type="button"
                  onClick={() => setRequiredFields([...requiredFields, { key: '', value: '' }])}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-accent transition-smooth"
                >
                  + Add Field
                </button>
              </div>
              {requiredFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No required fields configured
                </p>
              ) : (
                <div className="space-y-2">
                  {requiredFields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={field.key}
                        onChange={(e) => {
                          const newFields = [...requiredFields]
                          newFields[index].key = e.target.value
                          setRequiredFields(newFields)
                        }}
                        placeholder="Field name (e.g., file_exists)"
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      <span className="text-muted-foreground">=</span>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => {
                          const newFields = [...requiredFields]
                          newFields[index].value = e.target.value
                          setRequiredFields(newFields)
                        }}
                        placeholder="Expected value"
                        className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRequiredFields(requiredFields.filter((_, i) => i !== index))
                        }}
                        className="px-2 py-2 text-error hover:bg-error/10 rounded-lg transition-smooth"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Fields that must be present in payload metadata with specific values
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleSavePayloadRules}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
              >
                {loading ? 'Saving...' : 'Save Rules'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPayloadRules(false)
                  setError(null)
                  setSuccess(false)
                  // Reset to original values
                  if (monitor.payload_validation_rules) {
                    const rules = monitor.payload_validation_rules
                    setMaxDurationMs(rules.maxDurationMs || '')
                    setMinCount(rules.minCount || '')
                    setMaxCount(rules.maxCount || '')
                    if (rules.requiredFields) {
                      const fields = Object.entries(rules.requiredFields).map(([key, value]) => ({
                        key,
                        value: String(value === null ? '' : value),
                      }))
                      setRequiredFields(fields)
                    } else {
                      setRequiredFields([])
                    }
                  } else {
                    setMaxDurationMs('')
                    setMinCount('')
                    setMaxCount('')
                    setRequiredFields([])
                  }
                }}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {monitor.payload_validation_rules ? (
              <div className="space-y-2 text-sm">
                {monitor.payload_validation_rules.maxDurationMs && (
                  <p>
                    <span className="font-medium">Max Duration:</span>{' '}
                    {monitor.payload_validation_rules.maxDurationMs}ms
                  </p>
                )}
                {(monitor.payload_validation_rules.minCount !== undefined ||
                  monitor.payload_validation_rules.maxCount !== undefined) && (
                  <p>
                    <span className="font-medium">Count Range:</span>{' '}
                    {monitor.payload_validation_rules.minCount !== undefined
                      ? monitor.payload_validation_rules.minCount
                      : '0'}
                    {' - '}
                    {monitor.payload_validation_rules.maxCount !== undefined
                      ? monitor.payload_validation_rules.maxCount
                      : '∞'}
                  </p>
                )}
                {monitor.payload_validation_rules.requiredFields &&
                  Object.keys(monitor.payload_validation_rules.requiredFields).length > 0 && (
                    <p>
                      <span className="font-medium">Required Fields:</span>{' '}
                      {Object.entries(monitor.payload_validation_rules.requiredFields)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(', ')}
                    </p>
                  )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No payload validation rules configured. Click "Configure" to add rules.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Alert Channels Override Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden">
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

        {error && (
          <div className="mx-4 sm:mx-6 mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
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
                  setError(null)
                  setSuccess(false)
                  // Reset to original values
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

      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold">Recent Pings</h2>
        </div>
        <div className="divide-y divide-border">
          {pings.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-sm">
              No pings received yet
            </div>
          ) : (
            pings.map((ping, index) => (
              <div
                key={ping.id}
                className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-smooth animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <span
                      className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded border flex-shrink-0 ${
                        ping.status === 'ok' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                      }`}
                    >
                      {ping.status === 'ok' ? 'OK' : 'FAIL'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium font-mono truncate">
                        {format(new Date(ping.received_at), 'PPp')}
                      </p>
                      {ping.message && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{ping.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    {ping.duration_ms !== null && (
                      <p className="text-xs sm:text-sm text-muted-foreground font-mono">{ping.duration_ms}ms</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(ping.received_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
