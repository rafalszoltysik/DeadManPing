'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'
import { Monitor, Ping, MonitorDetailProps } from '@/lib/types/monitor'
import { WarningTooltip, InfoTooltip } from './Tooltip'
import { WarningIcon, InfoIcon } from './Icons'
import { captureSoftError } from '@/lib/sentry/client'

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-5 h-5" />
    case 'late':
      return <StatusLateIcon className="w-5 h-5" />
    case 'failed':
      return <StatusFailedIcon className="w-5 h-5" />
    case 'paused':
      return <StatusPendingIcon className="w-5 h-5" />
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
    case 'paused':
      return 'bg-muted text-muted-foreground border-border'
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
    case 'paused':
      return 'Paused'
    default:
      return 'Pending'
  }
}

export function MonitorDetail({ monitor: initialMonitor, pings: initialPings, pingUrl, isOnboarding }: MonitorDetailProps) {
  const [monitor, setMonitor] = useState(initialMonitor)
  const [pings, setPings] = useState(initialPings)
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [waitingForPing, setWaitingForPing] = useState(initialMonitor.status === 'pending' && initialPings.length === 0)
  const [showPayloadValidation, setShowPayloadValidation] = useState(false)
  const [editingPayloadRules, setEditingPayloadRules] = useState(false)
  const [payloadFields, setPayloadFields] = useState<Array<{
    name: string
    type: 'number' | 'boolean' | 'string'
    rule: '>' | '<' | '>=' | '<=' | '==' | '!='
    value: string
    severity: 'warn' | 'error'
  }>>([])
  const [showAlertChannels, setShowAlertChannels] = useState(false)
  const [editingAlertChannels, setEditingAlertChannels] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [customWebhook, setCustomWebhook] = useState('')
  const [userTier, setUserTier] = useState('free')
  const [loading, setLoading] = useState(false)
  const [payloadError, setPayloadError] = useState<string | null>(null)
  const [payloadSuccess, setPayloadSuccess] = useState(false)
  const [alertChannelsError, setAlertChannelsError] = useState<string | null>(null)
  const [alertChannelsSuccess, setAlertChannelsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null) // For delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editingInterval, setEditingInterval] = useState(false)
  const [intervalMinutes, setIntervalMinutes] = useState(Math.floor(monitor.expected_interval_seconds / 60))
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(Math.floor(monitor.grace_period_seconds / 60))
  const [intervalError, setIntervalError] = useState<string | null>(null)
  const [intervalSuccess, setIntervalSuccess] = useState(false)
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours'>('minutes')
  const [graceUnit, setGraceUnit] = useState<'minutes' | 'hours'>('hours')
  const [minIntervalMinutes, setMinIntervalMinutes] = useState(5)
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Fetch user tier
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          const tier = data.tier || 'free'
          setUserTier(tier)
          
          // Set minimum interval based on tier
          const { TIER_LIMITS } = await import('@/lib/limits')
          const limit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
          const minMinutes = limit.minInterval / 60
          setMinIntervalMinutes(minMinutes)
        }
      } catch (err) {
        console.error('Error fetching user tier:', err)
      }
    }
    fetchUserTier()
  }, [])

  // Convert interval to appropriate unit for display
  const getIntervalValue = () => {
    if (intervalUnit === 'hours') {
      return Math.round((intervalMinutes / 60) * 10) / 10
    }
    return intervalMinutes
  }

  const setIntervalValue = (value: number) => {
    if (intervalUnit === 'hours') {
      setIntervalMinutes(Math.round(value * 60))
    } else {
      setIntervalMinutes(value)
    }
  }

  // Convert grace period to appropriate unit for display
  const getGraceValue = () => {
    if (graceUnit === 'minutes') {
      return Math.round(gracePeriodMinutes)
    }
    return Math.round((gracePeriodMinutes / 60) * 10) / 10
  }

  const setGraceValue = (value: number) => {
    if (graceUnit === 'minutes') {
      setGracePeriodMinutes(Math.round(value))
    } else {
      setGracePeriodMinutes(Math.round(value * 60))
    }
  }

  // Load existing payload validation rules when monitor changes
  useEffect(() => {
    if (monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
      const fields = monitor.payload_validation_rules.fields.map((field: any) => ({
        name: field.name || '',
        type: field.type || 'number',
        rule: field.rule || '>',
        value: String(field.value ?? ''),
        severity: field.severity || 'error',
      }))
      setPayloadFields(fields)
    } else {
      setPayloadFields([])
    }
  }, [monitor.payload_validation_rules])

  // Reload payload fields when opening edit mode (in case monitor was updated)
  useEffect(() => {
    if (editingPayloadRules && monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
      const fields = monitor.payload_validation_rules.fields.map((field: any) => ({
        name: field.name || '',
        type: field.type || 'number',
        rule: field.rule || '>',
        value: String(field.value ?? ''),
        severity: field.severity || 'error',
      }))
      setPayloadFields(fields)
    } else if (editingPayloadRules && (!monitor.payload_validation_rules || !monitor.payload_validation_rules.fields)) {
      setPayloadFields([])
    }
  }, [editingPayloadRules, monitor.payload_validation_rules])

  // Load existing interval settings when editing
  useEffect(() => {
    if (editingInterval) {
      const currentIntervalMinutes = Math.floor(monitor.expected_interval_seconds / 60)
      const currentGraceMinutes = Math.floor(monitor.grace_period_seconds / 60)
      setIntervalMinutes(currentIntervalMinutes)
      setGracePeriodMinutes(currentGraceMinutes)
      // Auto-select appropriate unit based on value
      setIntervalUnit(currentIntervalMinutes >= 60 ? 'hours' : 'minutes')
      setGraceUnit(currentGraceMinutes >= 60 ? 'hours' : 'minutes')
    }
  }, [editingInterval, monitor.expected_interval_seconds, monitor.grace_period_seconds])

  // Load existing alert channel overrides
  useEffect(() => {
    if (monitor.alert_email) setAlertEmail(monitor.alert_email)
    if (monitor.slack_webhook_url) setSlackWebhook(monitor.slack_webhook_url)
    if (monitor.discord_webhook_url) setDiscordWebhook(monitor.discord_webhook_url)
    if (monitor.custom_webhook_url) setCustomWebhook(monitor.custom_webhook_url)
  }, [monitor.alert_email, monitor.slack_webhook_url, monitor.discord_webhook_url, monitor.custom_webhook_url])

  // Build curl command with example payload based on configured fields
  const buildCurlCommand = () => {
    const hasPayloadFields = monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0
    
    if (hasPayloadFields && monitor.payload_validation_rules) {
      // Build example payload from configured fields
      const examplePayload: Record<string, any> = {}
      monitor.payload_validation_rules.fields.forEach((field: any) => {
        // Generate example value based on type and rule
        if (field.type === 'number') {
          if (field.rule === '>' || field.rule === '>=') {
            examplePayload[field.name] = (Number(field.value) || 0) + 10
          } else if (field.rule === '<' || field.rule === '<=') {
            examplePayload[field.name] = Math.max(0, (Number(field.value) || 100) - 10)
          } else {
            examplePayload[field.name] = field.value || 0
          }
        } else if (field.type === 'boolean') {
          examplePayload[field.name] = field.value === false || field.value === 'false' ? false : true
        } else {
          examplePayload[field.name] = field.value || 'ok'
        }
      })
      
      const payloadJson = JSON.stringify(examplePayload)
      // For Windows, use --data-raw with escaped quotes, for Unix use single quotes
      const windowsCommand = `curl -X POST "${pingUrl}" -H "Content-Type: application/json" --data-raw "${payloadJson.replace(/"/g, '\\"')}"`
      const unixCommand = `curl -X POST "${pingUrl}" -H "Content-Type: application/json" -d '${payloadJson}'`
      
      return {
        windows: windowsCommand,
        unix: unixCommand,
        default: unixCommand, // Default for copy
      }
    } else {
      const simpleCommand = `curl -X POST "${pingUrl}"`
      return {
        windows: simpleCommand,
        unix: simpleCommand,
        default: simpleCommand,
      }
    }
  }

  const curlCommands = buildCurlCommand()
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'unix'>('unix')
  const curlCommand = curlCommands[selectedPlatform]

  const copyUrlToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pingUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
      
      // Track heartbeat URL copied (webhook method)
      const { captureHeartbeatUrlCopied } = await import('@/lib/posthog/client')
      captureHeartbeatUrlCopied({ method: 'webhook' })
      
      // Track soft error: user copied URL, check if no pings after 5 minutes
      setTimeout(async () => {
        // After 5 minutes, check if monitor still has no pings
        if (monitor.status === 'pending' && pings.length === 0) {
          captureSoftError('url_copied_no_pings', {
            route: window.location.pathname,
            action: 'copy_url',
            heartbeatId: monitor.id,
            monitorId: monitor.id,
            minutesSinceCopy: 5,
          })
        }
      }, 5 * 60 * 1000) // 5 minutes
    } catch (error) {
      // Track error copying URL (invalid format or clipboard error)
      captureSoftError('url_copy_failed', {
        route: window.location.pathname,
        action: 'copy_url',
        heartbeatId: monitor.id,
        monitorId: monitor.id,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const copyCurlToClipboard = async () => {
    navigator.clipboard.writeText(curlCommands[selectedPlatform])
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
    
    // Track heartbeat URL copied (curl method)
    const { captureHeartbeatUrlCopied } = await import('@/lib/posthog/client')
    captureHeartbeatUrlCopied({ method: 'curl' })
  }

  // Check if monitor should be marked as late or failed based on last_ping_at and expected interval
  const checkMonitorStatus = (monitorData: Monitor): Monitor => {
    // Check if monitor is healthy, pending, or late (late can transition to failed)
    if (monitorData.status !== 'healthy' && monitorData.status !== 'pending' && monitorData.status !== 'late') {
      return monitorData
    }

    const now = new Date()
    let referenceTime: Date | null = null
    
    // Determine reference time (when the ping was expected)
    if (monitorData.last_ping_at) {
      referenceTime = new Date(monitorData.last_ping_at)
    } else if (monitorData.status === 'pending' || (monitorData.status === 'healthy' && !monitorData.last_ping_at)) {
      referenceTime = new Date(monitorData.created_at)
    }
    
    if (!referenceTime) {
      return monitorData
    }
    
    const expectedIntervalEnd = new Date(
      referenceTime.getTime() + monitorData.expected_interval_seconds * 1000
    )
    const gracePeriodEnd = new Date(
      referenceTime.getTime() + 
      monitorData.expected_interval_seconds * 1000 + 
      monitorData.grace_period_seconds * 1000
    )
    
    // If grace period is 0, mark as failed immediately after expected interval
    if (monitorData.grace_period_seconds === 0) {
      if (now > expectedIntervalEnd) {
        return { ...monitorData, status: 'failed' as const }
      }
    } else {
      // Check if monitor is in grace period (late)
      if (now > expectedIntervalEnd && now <= gracePeriodEnd) {
        return { ...monitorData, status: 'late' as const }
      }
      // Check if monitor is past grace period (failed)
      else if (now > gracePeriodEnd) {
        return { ...monitorData, status: 'failed' as const }
      }
    }

    return monitorData
  }

  // Fetch latest monitor and pings data
  const fetchMonitorData = useCallback(async () => {
    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`)
      if (response.ok) {
        const data = await response.json()
        if (data.monitor) {
          // Check if monitor should be marked as late or failed
          const checkedMonitor = checkMonitorStatus(data.monitor)
          setMonitor(checkedMonitor)
          
          // If status changed to late or failed, update it on the server
          if ((checkedMonitor.status === 'late' || checkedMonitor.status === 'failed') && 
              data.monitor.status !== checkedMonitor.status) {
            // Silently update status on server (don't await to avoid blocking)
            fetch(`/api/monitors/${monitor.slug}/update`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                status: checkedMonitor.status,
                expectedUpdatedAt: data.monitor.updated_at 
              }),
            }).catch(err => console.error('Error updating monitor status:', err))
          }
        }
        if (data.pings) {
          setPings(data.pings)
        }
      }
    } catch (err) {
      console.error('Error fetching monitor data:', err)
    }
  }, [monitor.slug])

  // Poll for new pings and monitor updates
  // Don't poll when editing forms to prevent overwriting user changes
  useEffect(() => {
    // Don't poll if user is editing forms
    if (editingPayloadRules || editingAlertChannels || editingInterval) {
      return
    }

    // Poll every 5 seconds if onboarding and waiting for first ping
    if (isOnboarding && waitingForPing) {
      const interval = setInterval(() => {
        fetchMonitorData()
      }, 5000)

      return () => clearInterval(interval)
    } else {
      // Poll every 10 seconds for regular updates
      const interval = setInterval(() => {
        fetchMonitorData()
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [isOnboarding, waitingForPing, monitor.slug, editingPayloadRules, editingAlertChannels, editingInterval, fetchMonitorData])

  useEffect(() => {
    if (pings.length > 0 && waitingForPing) {
      setWaitingForPing(false)
    }
  }, [pings.length, waitingForPing])

  const handleSavePayloadRules = async () => {
    setLoading(true)
    setPayloadError(null)
    setPayloadSuccess(false)

    try {
      // Build payload validation rules from fields
      let payloadValidationRules: any = null
      if (payloadFields.length > 0) {
        const fields = payloadFields
          .filter((field) => field.name.trim() !== '')
          .map((field) => {
            // Parse value based on type
            let parsedValue: number | boolean | string
            if (field.type === 'number') {
              parsedValue = Number(field.value)
              if (isNaN(parsedValue)) {
                throw new Error(`Field "${field.name}" value must be a valid number`)
              }
            } else if (field.type === 'boolean') {
              if (field.value === 'true') parsedValue = true
              else if (field.value === 'false') parsedValue = false
              else {
                throw new Error(`Field "${field.name}" value must be "true" or "false"`)
              }
            } else {
              parsedValue = field.value
            }

            return {
              name: field.name.trim(),
              type: field.type,
              rule: field.rule,
              value: parsedValue,
              severity: field.severity || 'error',
            }
          })

        if (fields.length > 0) {
          payloadValidationRules = { fields }
        }
      }

      const requestBody: any = {
        payloadValidationRules: payloadValidationRules,
        expectedUpdatedAt: monitor.updated_at, // Send current updated_at for optimistic locking
      }

      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.conflict && data.latestMonitor) {
          // Monitor was modified - update local state and show error
          setMonitor(data.latestMonitor)
          throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
        }
        throw new Error(data.error || 'Failed to update payload validation rules')
      }

      const data = await response.json()
      // Update monitor state with latest data (including new updated_at)
      if (data.monitor) {
        setMonitor(data.monitor)
      }

      setPayloadSuccess(true)
      setEditingPayloadRules(false)
      // Refresh monitor data to get latest pings
      await fetchMonitorData()
      setTimeout(() => {
        setPayloadSuccess(false)
      }, 3000)
    } catch (err: any) {
      setPayloadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAlertChannels = async () => {
    setLoading(true)
    setAlertChannelsError(null)
    setAlertChannelsSuccess(false)

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
      expectedUpdatedAt: monitor.updated_at, // Send current updated_at for optimistic locking
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
          // Monitor was modified - update local state and show error
          setMonitor(data.latestMonitor)
          throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
        }
        throw new Error(data.error || 'Failed to update alert channels')
      }

      const data = await response.json()
      // Update monitor state with latest data (including new updated_at)
      if (data.monitor) {
        setMonitor(data.monitor)
      }

      setAlertChannelsSuccess(true)
      setEditingAlertChannels(false)
      // Refresh monitor data to get latest pings
      await fetchMonitorData()
      setTimeout(() => {
        setAlertChannelsSuccess(false)
      }, 3000)
    } catch (err: any) {
      setAlertChannelsError(err.message)
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
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-1.5 text-sm text-error border border-error/20 rounded-lg hover:bg-error/10 transition-smooth flex-shrink-0"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-2">Delete Monitor</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete "{monitor.name}"? This action cannot be undone. All pings and alerts for this monitor will also be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true)
                  setError(null)
                  try {
                    const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
                      method: 'DELETE',
                    })

                    if (!response.ok) {
                      const data = await response.json()
                      throw new Error(data.error || 'Failed to delete monitor')
                    }

                    // Redirect to dashboard after successful deletion
                    window.location.href = '/dashboard'
                  } catch (err: any) {
                    setError(err.message)
                    setDeleting(false)
                  }
                }}
                disabled={deleting}
                className="px-4 py-2 bg-error text-error-foreground rounded-lg text-sm font-medium hover:bg-error/90 transition-smooth disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Monitor'}
              </button>
            </div>
            {error && (
              <div className="mt-4 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      {isOnboarding && waitingForPing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Waiting for first ping...
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Copy the command below and run it in your terminal or add it to your cron job.
          </p>
          <div className="space-y-3">
            {monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0 && (
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('unix')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                    selectedPlatform === 'unix'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Linux/Mac
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlatform('windows')}
                  className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                    selectedPlatform === 'windows'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Windows
                </button>
              </div>
            )}
            <div className="bg-background border border-border rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm overflow-x-auto">
              <code className="text-foreground whitespace-pre-wrap break-all">{curlCommand}</code>
            </div>
          </div>
            <button
              onClick={copyCurlToClipboard}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto"
            >
              {copiedCurl ? '✓ Copied!' : 'Copy Command'}
            </button>
        </div>
      )}

      {!isOnboarding && (
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ping URL</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto break-all">{pingUrl}</code>
            <button
              onClick={copyUrlToClipboard}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto flex-shrink-0"
            >
              {copiedUrl ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm text-muted-foreground">Example curl command:</p>
              {monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0 && (
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('unix')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                      selectedPlatform === 'unix'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Linux/Mac
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatform('windows')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                      selectedPlatform === 'windows'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Windows
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <code className="flex-1 bg-background border border-border px-3 py-2 rounded-lg text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {curlCommand}
              </code>
              <button
                onClick={copyCurlToClipboard}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-smooth w-full sm:w-auto flex-shrink-0"
              >
                {copiedCurl ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interval Settings Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">Interval Settings</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Configure how often your cron job should ping and the grace period
            </p>
          </div>
          {!editingInterval && (
            <button
              onClick={() => setEditingInterval(true)}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-smooth"
            >
              Edit
            </button>
          )}
        </div>

        {intervalError && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {intervalError}
          </div>
        )}

        {intervalSuccess && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4 text-sm">
            Interval settings updated successfully!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Expected Interval</h3>
            <p className="text-xl sm:text-2xl font-bold font-mono">
              {Math.floor(monitor.expected_interval_seconds / 60)} min
            </p>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Grace Period</h3>
            <p className="text-xl sm:text-2xl font-bold font-mono">
              {Math.floor(monitor.grace_period_seconds / 60)} min
            </p>
          </div>
        </div>
      </div>

      {/* Interval Edit Modal */}
      {editingInterval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">Edit Interval Settings</h2>
                <button
                  onClick={() => {
                    setEditingInterval(false)
                    setIntervalError(null)
                    setIntervalSuccess(false)
                    setIntervalMinutes(Math.floor(monitor.expected_interval_seconds / 60))
                    setGracePeriodMinutes(Math.floor(monitor.grace_period_seconds / 60))
                  }}
                  className="text-muted-foreground hover:text-foreground transition-smooth text-xl"
                >
                  ×
                </button>
              </div>

              {intervalError && (
                <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 text-sm">
                  {intervalError}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="interval" className="block text-sm font-medium">
                      Expected Interval
                    </label>
                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setIntervalUnit('minutes')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          intervalUnit === 'minutes'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIntervalUnit('hours')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          intervalUnit === 'hours'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Hours
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="interval"
                      type="range"
                      min={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes}
                      max={intervalUnit === 'hours' ? '24' : '1440'}
                      step={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes >= 1 ? '1' : '0.5'}
                      value={getIntervalValue()}
                      onChange={(e) => setIntervalValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                    />
                    <input
                      type="number"
                      min={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes}
                      max={intervalUnit === 'hours' ? '24' : '1440'}
                      step={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes >= 1 ? '1' : '0.5'}
                      value={getIntervalValue()}
                      onChange={(e) => {
                        const value = Number(e.target.value)
                        if (value >= (intervalUnit === 'hours' ? 0.1 : minIntervalMinutes)) {
                          setIntervalValue(value)
                        }
                      }}
                      className="w-20 px-2 py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>
                      {intervalUnit === 'hours' 
                        ? '0.1 hr' 
                        : minIntervalMinutes >= 1 
                          ? `${minIntervalMinutes} min` 
                          : `${minIntervalMinutes * 60} sec`}
                    </span>
                    <span>24 {intervalUnit === 'hours' ? 'hours' : 'hours'}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    How often should this job run?
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="grace" className="block text-sm font-medium">
                      Grace Period
                    </label>
                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setGraceUnit('minutes')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          graceUnit === 'minutes'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setGraceUnit('hours')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          graceUnit === 'hours'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Hours
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="grace"
                      type="range"
                      min="0"
                      max={graceUnit === 'hours' ? '24' : '1440'}
                      step={graceUnit === 'hours' ? '0.5' : '30'}
                      value={getGraceValue()}
                      onChange={(e) => setGraceValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                    />
                    <input
                      type="number"
                      min="0"
                      max={graceUnit === 'hours' ? '24' : '1440'}
                      step={graceUnit === 'hours' ? '0.5' : '30'}
                      value={getGraceValue()}
                      onChange={(e) => setGraceValue(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0 {graceUnit}</span>
                    <span>{graceUnit === 'hours' ? '24 hours' : '1440 min'}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    How long to wait before alerting if the job doesn't run?
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={async () => {
                      setLoading(true)
                      setIntervalError(null)
                      setIntervalSuccess(false)

                      try {
                        const expectedIntervalSeconds = intervalMinutes * 60
                        const gracePeriodSeconds = gracePeriodMinutes * 60

                        if (expectedIntervalSeconds < 60) {
                          throw new Error('Expected interval must be at least 60 seconds (1 minute)')
                        }

                        if (gracePeriodSeconds < 0) {
                          throw new Error('Grace period cannot be negative')
                        }

                        const requestBody: any = {
                          expectedIntervalSeconds,
                          gracePeriodSeconds,
                          expectedUpdatedAt: monitor.updated_at,
                        }

                        const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(requestBody),
                        })

                        if (!response.ok) {
                          const data = await response.json()
                          if (data.conflict && data.latestMonitor) {
                            setMonitor(data.latestMonitor)
                            throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
                          }
                          throw new Error(data.error || 'Failed to update interval settings')
                        }

                        const data = await response.json()
                        if (data.monitor) {
                          setMonitor(data.monitor)
                        }

                        setIntervalSuccess(true)
                        setEditingInterval(false)
                        await fetchMonitorData()
                        setTimeout(() => {
                          setIntervalSuccess(false)
                        }, 3000)
                      } catch (err: any) {
                        setIntervalError(err.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-smooth disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingInterval(false)
                      setIntervalError(null)
                      setIntervalSuccess(false)
                      setIntervalMinutes(Math.floor(monitor.expected_interval_seconds / 60))
                      setGracePeriodMinutes(Math.floor(monitor.grace_period_seconds / 60))
                    }}
                    disabled={loading}
                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Last Ping</h3>
          <p className="text-xl sm:text-2xl font-bold text-sm sm:text-base" suppressHydrationWarning>
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

        {payloadError && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-4 text-sm">
            {payloadError}
          </div>
        )}

        {payloadSuccess && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg mb-4 text-sm">
            Payload validation rules updated successfully!
          </div>
        )}

        {editingPayloadRules ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Payload Fields
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (payloadFields.length < 5) {
                      setPayloadFields([...payloadFields, {
                        name: '',
                        type: 'number',
                        rule: '>',
                        value: '',
                        severity: 'error',
                      }])
                    }
                  }}
                  disabled={payloadFields.length >= 5}
                  className="text-xs px-2 py-1 border border-border rounded hover:bg-accent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Field {payloadFields.length >= 5 ? '(max 5)' : ''}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Configure fields to validate in your payload. Only declared fields are processed, rest is ignored.
              </p>
              
              {payloadFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No fields configured. Click "Add Field" to add validation rules.
                </p>
              ) : (
                <div className="space-y-3">
                  {payloadFields.map((field, index) => (
                    <div key={index} className="bg-background border border-input rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Field {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setPayloadFields(payloadFields.filter((_, i) => i !== index))
                          }}
                          className="text-xs px-2 py-1 text-error hover:bg-error/10 rounded transition-smooth"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Field Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].name = e.target.value
                              setPayloadFields(newFields)
                            }}
                            placeholder="e.g., count"
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].type = e.target.value as 'number' | 'boolean' | 'string'
                              // Reset rule and value when type changes
                              if (e.target.value === 'number') {
                                newFields[index].rule = '>'
                                newFields[index].value = ''
                              } else {
                                newFields[index].rule = '=='
                                newFields[index].value = ''
                              }
                              setPayloadFields(newFields)
                            }}
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          >
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="string">String</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Rule</label>
                          <select
                            value={field.rule}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].rule = e.target.value as '>' | '<' | '>=' | '<=' | '==' | '!='
                              setPayloadFields(newFields)
                            }}
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          >
                            {field.type === 'number' ? (
                              <>
                                <option value=">">Greater than (&gt;)</option>
                                <option value="<">Less than (&lt;)</option>
                                <option value=">=">Greater or equal (&gt;=)</option>
                                <option value="<=">Less or equal (&lt;=)</option>
                                <option value="==">Equal (==)</option>
                                <option value="!=">Not equal (!=)</option>
                              </>
                            ) : (
                              <>
                                <option value="==">Equal (==)</option>
                                <option value="!=">Not equal (!=)</option>
                              </>
                            )}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Value</label>
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={field.value}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].value = e.target.value
                              setPayloadFields(newFields)
                            }}
                            placeholder={
                              field.type === 'number' 
                                ? 'e.g., 100' 
                                : field.type === 'boolean'
                                ? 'true or false'
                                : 'e.g., "ok"'
                            }
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium mb-1">
                          Severity
                          <InfoTooltip content="Error: Monitor will be marked as FAIL if validation fails. Warning: Monitor stays healthy but shows warning status.">
                            <button type="button" className="text-muted-foreground hover:text-foreground transition-smooth">
                              <InfoIcon className="w-3.5 h-3.5" />
                            </button>
                          </InfoTooltip>
                        </label>
                        <select
                          value={field.severity}
                          onChange={(e) => {
                            const newFields = [...payloadFields]
                            newFields[index].severity = e.target.value as 'warn' | 'error'
                            setPayloadFields(newFields)
                          }}
                          className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                        >
                          <option value="error">Error (mark as FAIL)</option>
                          <option value="warn">Warning</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <p className="mt-3 text-xs text-muted-foreground">
                Example: Validate that <code className="px-1 py-0.5 bg-muted rounded">count</code> field is greater than 100.
                Your cron job should send: <code className="px-1 py-0.5 bg-muted rounded">{"{ \"count\": 120 }"}</code>
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
                  setPayloadError(null)
                  setPayloadSuccess(false)
                  // Reset to original values
                  if (monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
                    const fields = monitor.payload_validation_rules.fields.map((field: any) => ({
                      name: field.name || '',
                      type: field.type || 'number',
                      rule: field.rule || '>',
                      value: String(field.value ?? ''),
                      severity: field.severity || 'error',
                    }))
                    setPayloadFields(fields)
                  } else {
                    setPayloadFields([])
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
            {monitor.payload_validation_rules && monitor.payload_validation_rules.fields && monitor.payload_validation_rules.fields.length > 0 ? (
              <div className="space-y-2 text-sm">
                {monitor.payload_validation_rules.fields.map((field: any, index: number) => (
                  <div key={index} className="p-2 bg-background border border-input rounded">
                    <p>
                      <span className="font-medium">{field.name}</span> ({field.type}){' '}
                      <span className="text-muted-foreground">{field.rule}</span>{' '}
                      <span className="font-mono">{String(field.value)}</span>
                      {field.severity && field.severity !== 'error' && (
                        <WarningTooltip content="This is a warning rule. The monitor will stay healthy but show a warning status if validation fails.">
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-warning">
                            <WarningIcon className="w-3 h-3" />
                            ({field.severity})
                          </span>
                        </WarningTooltip>
                      )}
                    </p>
                  </div>
                ))}
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
                    {(() => {
                      // Determine ping display status based on ping.status and message
                      let displayStatus: 'ok' | 'warn' | 'fail' = 'ok'
                      let statusClass = 'bg-success/10 text-success border-success/20'
                      let statusText = 'OK'
                      
                      if (ping.status === 'fail') {
                        // Check if it's a "late" warning, payload warning, or a "failed" error
                        if (ping.message && ping.message.includes('Monitor is late')) {
                          displayStatus = 'warn'
                          statusClass = 'bg-warning/10 text-warning border-warning/20'
                          statusText = 'WARN'
                        } else if (ping.message && ping.message.includes('[WARNING]')) {
                          // Payload validation warning (severity: 'warn')
                          displayStatus = 'warn'
                          statusClass = 'bg-warning/10 text-warning border-warning/20'
                          statusText = 'WARN'
                        } else {
                          displayStatus = 'fail'
                          statusClass = 'bg-error/10 text-error border-error/20'
                          statusText = 'FAIL'
                        }
                      }
                      
                      return (
                        <span
                          className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded border flex-shrink-0 ${statusClass}`}
                        >
                          {statusText}
                        </span>
                      )
                    })()}
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
                    <p className="text-xs text-muted-foreground" suppressHydrationWarning>
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
