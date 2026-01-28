'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { formatDistanceToNow, format } from 'date-fns'
import Link from 'next/link'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'
import { Monitor, Ping, MonitorDetailProps } from '@/lib/types/monitor'
import { WarningTooltip, InfoTooltip } from './Tooltip'
import { WarningIcon, InfoIcon } from './Icons'
import { captureSoftError } from '@/lib/sentry/client'
import { TIER_LIMITS } from '@/lib/limits'
import { CodeBlock } from './CodeBlock'

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

function getRuleLabel(rule: string): string {
  switch (rule) {
    case '>':
      return 'greater than'
    case '<':
      return 'less than'
    case '>=':
      return 'greater than or equal'
    case '<=':
      return 'less than or equal'
    case '==':
      return 'equal to'
    case '!=':
      return 'not equal to'
    default:
      return rule
  }
}

export function MonitorDetail({ monitor: initialMonitor, pings: initialPings, jobRuns: initialJobRuns = [], pingUrl, isOnboarding, userTier: initialUserTier = 'free' }: MonitorDetailProps) {
  const [monitor, setMonitor] = useState(initialMonitor)
  const [pings, setPings] = useState(initialPings)
  const [jobRuns, setJobRuns] = useState(initialJobRuns)
  const [pingMethod, setPingMethod] = useState<'simple' | 'job-runs'>('simple')
  const [waitingForPing, setWaitingForPing] = useState(initialMonitor.status === 'pending' && initialPings.length === 0)
  const [showPayloadValidation, setShowPayloadValidation] = useState(false)
  const [editingPayloadRules, setEditingPayloadRules] = useState(false)
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null)
  const [originalEditingField, setOriginalEditingField] = useState<{ name: string; rule: string } | null>(null)
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
  const [userTier, setUserTier] = useState(initialUserTier)
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
  const [maxExecutionTimeSeconds, setMaxExecutionTimeSeconds] = useState(
    monitor.max_execution_time_seconds || 0
  )
  const [maxExecutionTimeUnit, setMaxExecutionTimeUnit] = useState<'seconds' | 'minutes' | 'hours'>('seconds')
  const [maxExecutionTimeEnabled, setMaxExecutionTimeEnabled] = useState(
    monitor.max_execution_time_seconds !== null && monitor.max_execution_time_seconds > 0
  )
  
  // Calculate minIntervalMinutes from tier
  const limit = TIER_LIMITS[userTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
  const minIntervalMinutes = limit.minInterval / 60
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Poll for tier changes (e.g., after subscription upgrade/downgrade)
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          const tier = data.tier || 'free'
          setUserTier(tier)
        }
      } catch (err) {
        console.error('Error fetching user tier:', err)
      }
    }
    
    // Poll for tier changes every 30 seconds
    const interval = setInterval(fetchUserTier, 30000)
    
    // Also check when user returns to tab/window
    const handleFocus = () => fetchUserTier()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
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

  // Convert max execution time to appropriate unit for display
  const getMaxExecutionTimeValue = () => {
    if (maxExecutionTimeUnit === 'seconds') {
      return maxExecutionTimeSeconds
    } else if (maxExecutionTimeUnit === 'minutes') {
      return Math.round(maxExecutionTimeSeconds / 60)
    } else { // hours
      return Math.round((maxExecutionTimeSeconds / 3600) * 10) / 10
    }
  }

  const setMaxExecutionTimeValue = (value: number) => {
    if (maxExecutionTimeUnit === 'seconds') {
      setMaxExecutionTimeSeconds(Math.round(value))
    } else if (maxExecutionTimeUnit === 'minutes') {
      setMaxExecutionTimeSeconds(Math.round(value * 60))
    } else { // hours
      setMaxExecutionTimeSeconds(Math.round(value * 3600))
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

  // Reload payload fields only when editing a specific field (not when adding new)
  useEffect(() => {
    if (editingPayloadRules && editingFieldIndex !== null && monitor.payload_validation_rules && monitor.payload_validation_rules.fields) {
      const field = monitor.payload_validation_rules.fields[editingFieldIndex]
      if (field) {
        const fieldData = {
          name: field.name || '',
          type: field.type || 'number',
          rule: field.rule || '>',
          value: String(field.value ?? ''),
          severity: field.severity || 'error',
        }
        setPayloadFields([fieldData])
        // Store original values for comparison
        setOriginalEditingField({
          name: field.name || '',
          rule: field.rule || '>',
        })
      }
    } else if (editingFieldIndex === null) {
      // When adding new field, clear original values
      setOriginalEditingField(null)
    }
    // When adding new field (editingFieldIndex === null), the form is initialized with one empty field in the onClick handler
  }, [editingPayloadRules, editingFieldIndex, monitor.payload_validation_rules])

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

  // Determine monitoring mode based on monitor configuration
  const hasStartStop = monitor.max_execution_time_seconds !== null && monitor.max_execution_time_seconds > 0
  const hasPayloadFields = monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0

  // Build example payload from configured fields
  const buildExamplePayload = () => {
    if (!hasPayloadFields || !monitor.payload_validation_rules) {
      return null
    }
    
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
    
    return examplePayload
  }

  const examplePayload = buildExamplePayload()

  // Build curl command based on monitoring mode
  const buildCurlCommand = () => {
    if (hasStartStop && hasPayloadFields) {
      // Start/Stop with Payload
      const payloadJson = JSON.stringify(examplePayload)
      const startCommandUnix = `curl -X POST "${pingUrl}/start" \\
  -H "Content-Type: application/json" \\
  -d '{"run_id": "optional-uuid"}'`
      
      const startCommandWindows = `curl -X POST "${pingUrl}/start" -H "Content-Type: application/json" -d "{\\"run_id\\": \\"optional-uuid\\"}"`
      
      const completeCommandUnix = `curl -X POST "${pingUrl}?run_id=YOUR_RUN_ID" \\
  -H "Content-Type: application/json" \\
  -d '${payloadJson}'`
      
      const completeCommandWindows = `curl -X POST "${pingUrl}?run_id=YOUR_RUN_ID" -H "Content-Type: application/json" --data-raw "${payloadJson.replace(/"/g, '\\"')}"`
      
      return {
        type: 'start-stop-payload',
        start: {
          unix: startCommandUnix,
          windows: startCommandWindows,
          default: startCommandUnix,
        },
        complete: {
          unix: completeCommandUnix,
          windows: completeCommandWindows,
          default: completeCommandUnix,
        },
        examplePayload,
      }
    } else if (hasStartStop) {
      // Start/Stop only
      const startCommandUnix = `curl -X POST "${pingUrl}/start" \\
  -H "Content-Type: application/json" \\
  -d '{"run_id": "optional-uuid"}'`
      
      const startCommandWindows = `curl -X POST "${pingUrl}/start" -H "Content-Type: application/json" -d "{\\"run_id\\": \\"optional-uuid\\"}"`
      
      const completeCommandUnix = `curl -X POST "${pingUrl}?run_id=YOUR_RUN_ID" \\
  -H "Content-Type: application/json"`
      
      const completeCommandWindows = `curl -X POST "${pingUrl}?run_id=YOUR_RUN_ID" -H "Content-Type: application/json"`
      
      return {
        type: 'start-stop',
        start: {
          unix: startCommandUnix,
          windows: startCommandWindows,
          default: startCommandUnix,
        },
        complete: {
          unix: completeCommandUnix,
          windows: completeCommandWindows,
          default: completeCommandUnix,
        },
        examplePayload: null,
      }
    } else if (hasPayloadFields) {
      // Payload only
      const payloadJson = JSON.stringify(examplePayload)
      const windowsCommand = `curl -X POST "${pingUrl}" -H "Content-Type: application/json" --data-raw "${payloadJson.replace(/"/g, '\\"')}"`
      const unixCommand = `curl -X POST "${pingUrl}" -H "Content-Type: application/json" -d '${payloadJson}'`
      
      return {
        type: 'payload',
        windows: windowsCommand,
        unix: unixCommand,
        default: unixCommand,
        examplePayload,
      }
    } else {
      // Simple ping
      const simpleCommand = `curl -X POST "${pingUrl}"`
      return {
        type: 'simple',
        windows: simpleCommand,
        unix: simpleCommand,
        default: simpleCommand,
        examplePayload: null,
      }
    }
  }

  const curlCommands = buildCurlCommand()
  const [selectedPlatform, setSelectedPlatform] = useState<'windows' | 'unix'>('unix')
  // For start-stop-payload mode, show complete command first (more useful with payload)
  // For start-stop only mode, show start command first
  const [showStartStopExample, setShowStartStopExample] = useState(
    hasStartStop && hasPayloadFields ? false : true
  )
  
  // Get the command to display based on mode
  const getDisplayCommand = (): string => {
    if (curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') {
      if (showStartStopExample) {
        // Start command - check if it's an object with platform-specific versions
        if (typeof curlCommands.start === 'object' && curlCommands.start !== null) {
          return (curlCommands.start as any)[selectedPlatform] || (curlCommands.start as any).default || ''
        }
        return curlCommands.start || ''
      }
      // Complete command
      return curlCommands.complete?.[selectedPlatform] || curlCommands.complete?.default || ''
    } else if (curlCommands.type === 'payload' || curlCommands.type === 'simple') {
      return (curlCommands as any)[selectedPlatform] || curlCommands.default || ''
    }
    return ''
  }
  
  const curlCommand = getDisplayCommand()

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

  // Check if a rule with the same field name and condition already exists
  const checkDuplicateRule = (
    fieldName: string,
    rule: string,
    currentFieldIndex: number | null = null
  ): boolean => {
    if (!fieldName.trim()) return false

    // When editing, only show validation if values have changed from original
    if (editingFieldIndex !== null && originalEditingField) {
      const isSameAsOriginal = 
        fieldName.trim().toLowerCase() === originalEditingField.name.trim().toLowerCase() &&
        rule === originalEditingField.rule
      
      // If values are the same as original, don't show duplicate validation
      if (isSameAsOriginal) return false
    }

    // Check existing rules in monitor (skip the one being edited)
    if (monitor.payload_validation_rules?.fields) {
      for (let i = 0; i < monitor.payload_validation_rules.fields.length; i++) {
        // Skip the field being edited
        if (editingFieldIndex !== null && i === editingFieldIndex) continue
        
        const existingField = monitor.payload_validation_rules.fields[i]
        if (
          existingField.name.trim().toLowerCase() === fieldName.trim().toLowerCase() &&
          existingField.rule === rule
        ) {
          return true
        }
      }
    }

    // Check rules in payloadFields (only when adding new fields, not when editing)
    // When editing, payloadFields contains only the field being edited, so we skip this check
    if (editingFieldIndex === null) {
      for (let i = 0; i < payloadFields.length; i++) {
        // Skip the current field being checked
        if (currentFieldIndex !== null && i === currentFieldIndex) continue
        
        const field = payloadFields[i]
        if (
          field.name.trim().toLowerCase() === fieldName.trim().toLowerCase() &&
          field.rule === rule
        ) {
          return true
        }
      }
    }

    return false
  }

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
          // Validate for duplicates before saving
          for (let i = 0; i < fields.length; i++) {
            const field = fields[i]
            // When editing, we need to check against existing fields excluding the one being edited
            // When adding new, we need to check both existing fields and other fields in payloadFields
            const isDuplicate = checkDuplicateRule(
              field.name,
              field.rule,
              editingFieldIndex !== null ? null : i // Skip current field index when adding new
            )
            
            if (isDuplicate) {
              throw new Error(
                `A rule with field name '${field.name}' and condition '${getRuleLabel(field.rule)}' already exists. You can add multiple rules for the same field only if they have different conditions.`
              )
            }
          }
          
          // Also check for duplicates within payloadFields itself (when adding multiple new fields)
          if (editingFieldIndex === null && fields.length > 1) {
            const seen = new Set<string>()
            for (const field of fields) {
              const key = `${field.name.trim().toLowerCase()}:${field.rule}`
              if (seen.has(key)) {
                throw new Error(
                  `Duplicate rule detected: field name '${field.name}' with condition '${getRuleLabel(field.rule)}' appears multiple times. You can add multiple rules for the same field only if they have different conditions.`
                )
              }
              seen.add(key)
            }
          }

          // If editing a single field, merge with existing fields
          if (editingFieldIndex !== null && monitor.payload_validation_rules?.fields) {
            const existingFields = [...monitor.payload_validation_rules.fields]
            existingFields[editingFieldIndex] = fields[0]
            payloadValidationRules = { fields: existingFields }
          } else {
            // Adding new field(s) - merge with existing if any
            if (monitor.payload_validation_rules?.fields) {
              payloadValidationRules = { fields: [...monitor.payload_validation_rules.fields, ...fields] }
            } else {
              payloadValidationRules = { fields }
            }
          }
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
      setEditingFieldIndex(null)
      setOriginalEditingField(null)
      setPayloadFields([])
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

  const handleDeletePayloadRule = async (index: number) => {
    if (!monitor.payload_validation_rules?.fields) return
    
    const newFields = [...monitor.payload_validation_rules.fields]
    newFields.splice(index, 1)
    
    const payloadValidationRules = newFields.length > 0 ? { fields: newFields } : null
    
    try {
      const response = await fetch(`/api/monitors/${monitor.slug}/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payloadValidationRules,
          expectedUpdatedAt: monitor.updated_at,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete rule')
      }

      const data = await response.json()
      setMonitor(data.monitor)
    } catch (err: any) {
      console.error('Error deleting rule:', err)
    }
  }

  const handleEditPayloadRule = (index: number) => {
    if (!monitor.payload_validation_rules?.fields) return
    const field = monitor.payload_validation_rules.fields[index]
    setEditingFieldIndex(index)
    setPayloadFields([{
      name: field.name,
      type: field.type,
      rule: field.rule,
      value: String(field.value),
      severity: field.severity || 'error',
    }])
    // Store original values for comparison
    setOriginalEditingField({
      name: field.name,
      rule: field.rule,
    })
    setEditingPayloadRules(true)
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
      {showDeleteConfirm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 backdrop-blur-md flex items-start justify-center z-50 pt-20 sm:pt-24">
          <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 max-w-md w-full mx-4">
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
        </div>,
        document.body
      )}

      {isOnboarding && waitingForPing && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 animate-fade-in">
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Waiting for first ping...
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload'
              ? 'Use the commands below to track your job execution. First call the Start Command when your job begins, then call the Complete Command when it finishes.'
              : 'Copy the command below and run it in your terminal or add it to your cron job.'}
          </p>
          <div className="space-y-3">
            {/* Platform selector - show for payload or start-stop-payload */}
            {(hasPayloadFields || (hasStartStop && hasPayloadFields)) && (
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
            
            {/* Start/Stop mode - show tabs for start and complete */}
            {(curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') && (
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                <button
                  type="button"
                  onClick={() => setShowStartStopExample(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                    showStartStopExample
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Start Command
                </button>
                <button
                  type="button"
                  onClick={() => setShowStartStopExample(false)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                    !showStartStopExample
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Complete Command
                </button>
              </div>
            )}
            
            <CodeBlock
              code={curlCommand}
              language="bash"
            />
            
            {/* Additional info for start-stop mode */}
            {(curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') && (
              <p className="text-xs text-muted-foreground">
                {showStartStopExample 
                  ? 'Call this endpoint when your job starts. Save the run_id from the response.'
                  : 'Call this endpoint when your job completes. Use the run_id from the start response.'}
              </p>
            )}
          </div>
        </div>
      )}

      {!isOnboarding && (
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Ping URL</h2>
          
          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1 mb-4 w-fit mx-auto">
            <button
              type="button"
              onClick={() => setPingMethod('simple')}
              className={`flex-1 min-w-[120px] px-10 py-1.5 text-xs sm:text-sm font-medium rounded transition-smooth whitespace-nowrap ${
                pingMethod === 'simple'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Simple Ping
            </button>
            <button
              type="button"
              onClick={() => setPingMethod('job-runs')}
              className={`flex-1 min-w-[120px] px-10 py-1.5 text-xs sm:text-sm font-medium rounded transition-smooth whitespace-nowrap ${
                pingMethod === 'job-runs'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Job Ping
            </button>
          </div>

          {/* Simple Ping Tab */}
          {pingMethod === 'simple' && (
            <>
              <CodeBlock
                code={pingUrl}
                language="text"
              />
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
                <CodeBlock
                  code={curlCommand}
                  language="bash"
                />
              </div>
            </>
          )}

          {/* Job Runs API Tab */}
          {pingMethod === 'job-runs' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Use these endpoints to track individual job executions and detect zombie jobs:
              </p>

              {/* Platform selector - show for start-stop modes */}
              {(curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') && (
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

              {/* Start Endpoint */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium">1. Start Job:</span>
                  <div className="flex-1">
                    <CodeBlock
                      code={`POST ${pingUrl}/start`}
                      language="http"
                      className="[&_pre]:!p-2 [&_pre]:!text-xs [&_pre]:!text-xs"
                    />
                  </div>
                </div>
                <CodeBlock
                  code={(curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') && (curlCommands as any).start 
                    ? (typeof (curlCommands as any).start === 'object' && (curlCommands as any).start !== null
                        ? ((curlCommands as any).start as any)[selectedPlatform] || ((curlCommands as any).start as any).default || ''
                        : (curlCommands as any).start)
                    : ''}
                  language="bash"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Call this at the start of your job. Returns <code className="px-1 py-0.5 bg-muted rounded text-xs">run_id</code> if not provided.
                </p>
              </div>

              {/* Completion Endpoint */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs sm:text-sm font-medium">2. Complete Job:</span>
                  <div className="flex-1">
                    <CodeBlock
                      code={`POST ${pingUrl}?run_id=xxx`}
                      language="http"
                      className="[&_pre]:!p-2 [&_pre]:!text-xs [&_pre]:!text-xs"
                    />
                  </div>
                </div>
                <CodeBlock
                  code={(() => {
                    if (curlCommands.type === 'start-stop' || curlCommands.type === 'start-stop-payload') {
                      return curlCommands.complete?.[selectedPlatform] || curlCommands.complete?.default || ''
                    } else if (curlCommands.type === 'payload') {
                      return (curlCommands as any)[selectedPlatform] || curlCommands.default || ''
                    } else if (curlCommands.type === 'simple') {
                      return curlCommands.default || ''
                    }
                    return ''
                  })()}
                  language="bash"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Call this when your job completes. Use the <code className="px-1 py-0.5 bg-muted rounded text-xs">run_id</code> from the start endpoint.
                  {monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0 && (
                    <> Include payload data for validation.</>
                  )}
                </p>
              </div>

              {/* Example Workflow */}
              <div>
                <p className="text-xs sm:text-sm font-medium mb-2">Example workflow:</p>
                <CodeBlock
                  code={`# 1. Start job
RUN_ID=$(curl -X POST "${pingUrl}/start" | jq -r '.run_id')
# 2. Do your work...
# 3. Complete job
curl -X POST "${pingUrl}?run_id=$RUN_ID"`}
                  language="bash"
                />
              </div>
            </div>
          )}
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <div>
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Max Execution Time</h3>
            <p className="text-xl sm:text-2xl font-bold font-mono">
              {monitor.max_execution_time_seconds 
                ? (() => {
                    const seconds = monitor.max_execution_time_seconds
                    if (seconds < 60) {
                      return `${seconds} sec`
                    } else if (seconds < 3600) {
                      return `${Math.floor(seconds / 60)} min`
                    } else {
                      const hours = Math.floor(seconds / 3600)
                      const remainingMinutes = Math.floor((seconds % 3600) / 60)
                      return remainingMinutes > 0 
                        ? `${hours} hr ${remainingMinutes} min`
                        : `${hours} hr`
                    }
                  })()
                : 'Disabled'}
            </p>
          </div>
        </div>
      </div>

      {/* Interval Edit Modal */}
      {editingInterval && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 sm:pt-16 bg-background/60 backdrop-blur-md overflow-y-auto">
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
                    setMaxExecutionTimeSeconds(monitor.max_execution_time_seconds || 0)
                    // Set appropriate unit based on value
                    if (monitor.max_execution_time_seconds) {
                      if (monitor.max_execution_time_seconds < 60) {
                        setMaxExecutionTimeUnit('seconds')
                      } else if (monitor.max_execution_time_seconds < 3600) {
                        setMaxExecutionTimeUnit('minutes')
                      } else {
                        setMaxExecutionTimeUnit('hours')
                      }
                    } else {
                      setMaxExecutionTimeUnit('seconds')
                    }
                    setMaxExecutionTimeEnabled(monitor.max_execution_time_seconds !== null && monitor.max_execution_time_seconds > 0)
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="maxExecutionTime" className="block text-sm font-medium">
                      Max Execution Time (Optional)
                    </label>
                    <div className="flex gap-1 bg-muted rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => setMaxExecutionTimeUnit('seconds')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          maxExecutionTimeUnit === 'seconds'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Seconds
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaxExecutionTimeUnit('minutes')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          maxExecutionTimeUnit === 'minutes'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Minutes
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaxExecutionTimeUnit('hours')}
                        className={`px-2 py-1 text-xs font-medium rounded transition-smooth ${
                          maxExecutionTimeUnit === 'hours'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Hours
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMaxExecutionTimeEnabled(!maxExecutionTimeEnabled)
                        if (maxExecutionTimeEnabled) {
                          setMaxExecutionTimeSeconds(0)
                        }
                      }}
                      className="relative flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer"
                      style={{
                        backgroundColor: maxExecutionTimeEnabled ? 'rgb(var(--primary))' : 'transparent',
                        borderColor: maxExecutionTimeEnabled ? 'rgb(var(--primary))' : 'rgb(var(--input))',
                      }}
                      aria-label="Enable timeout detection"
                    >
                      {maxExecutionTimeEnabled && (
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
                    <label 
                      htmlFor="maxExecutionTimeEnabled" 
                      className="text-sm text-muted-foreground cursor-pointer"
                      onClick={() => {
                        setMaxExecutionTimeEnabled(!maxExecutionTimeEnabled)
                        if (maxExecutionTimeEnabled) {
                          setMaxExecutionTimeSeconds(0)
                        }
                      }}
                    >
                      Enable timeout detection
                    </label>
                  </div>

                  {maxExecutionTimeEnabled && (
                    <>
                      <div className="flex items-center gap-3">
                        <input
                          id="maxExecutionTime"
                          type="range"
                          min={maxExecutionTimeUnit === 'seconds' ? '1' : maxExecutionTimeUnit === 'minutes' ? '1' : '1'}
                          max={maxExecutionTimeUnit === 'seconds' ? '60' : maxExecutionTimeUnit === 'minutes' ? '60' : '24'}
                          step={maxExecutionTimeUnit === 'hours' ? '1' : '1'}
                          value={getMaxExecutionTimeValue()}
                          onChange={(e) => setMaxExecutionTimeValue(Number(e.target.value))}
                          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                        />
                        <input
                          type="number"
                          min={maxExecutionTimeUnit === 'seconds' ? '1' : maxExecutionTimeUnit === 'minutes' ? '1' : '1'}
                          max={maxExecutionTimeUnit === 'seconds' ? '60' : maxExecutionTimeUnit === 'minutes' ? '60' : '24'}
                          step={maxExecutionTimeUnit === 'hours' ? '1' : '1'}
                          value={getMaxExecutionTimeValue()}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            const minValue = maxExecutionTimeUnit === 'seconds' ? 1 : maxExecutionTimeUnit === 'minutes' ? 1 : 1
                            if (value >= minValue) {
                              setMaxExecutionTimeValue(value)
                            }
                          }}
                          className="w-20 px-2 py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>
                          {maxExecutionTimeUnit === 'seconds' ? '1 sec' : maxExecutionTimeUnit === 'minutes' ? '1 min' : '1 hr'}
                        </span>
                        <span>
                          {maxExecutionTimeUnit === 'seconds' ? '60 sec' : maxExecutionTimeUnit === 'minutes' ? '60 min' : '24 hr'}
                        </span>
                      </div>
                    </>
                  )}

                  <p className="mt-2 text-sm text-muted-foreground">
                    Maximum time a job can run before being marked as timeout. If set, jobs that run longer than this time will trigger an alert.
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
                        const maxExecutionTimeSecondsForApi = maxExecutionTimeEnabled && maxExecutionTimeSeconds > 0
                          ? maxExecutionTimeSeconds
                          : null

                        if (expectedIntervalSeconds < 60) {
                          throw new Error('Expected interval must be at least 60 seconds (1 minute)')
                        }

                        if (gracePeriodSeconds < 0) {
                          throw new Error('Grace period cannot be negative')
                        }

                        if (maxExecutionTimeSeconds !== null && maxExecutionTimeSeconds < 1) {
                          throw new Error('Max execution time must be at least 1 second')
                        }

                        const requestBody: any = {
                          expectedIntervalSeconds,
                          gracePeriodSeconds,
                          maxExecutionTimeSeconds: maxExecutionTimeSecondsForApi,
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
        </div>,
        document.body
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
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6 hover-lift transition-smooth">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Last Job Duration</h3>
          <p className="text-xl sm:text-2xl font-bold font-mono">
            {(() => {
              const lastCompletedJob = jobRuns
                .filter(run => run.status === 'completed' && run.duration_ms !== null)
                .sort((a, b) => new Date(b.completed_at || b.started_at).getTime() - new Date(a.completed_at || a.started_at).getTime())[0]
              
              if (!lastCompletedJob || lastCompletedJob.duration_ms === null) {
                return 'No jobs yet'
              }
              
              const durationMs = lastCompletedJob.duration_ms
              const durationSeconds = Math.floor(durationMs / 1000)
              const minutes = Math.floor(durationSeconds / 60)
              const seconds = durationSeconds % 60
              
              if (minutes > 0) {
                return `${minutes}m ${seconds}s`
              } else if (durationSeconds > 0) {
                return `${durationSeconds}s`
              } else {
                return `${durationMs}ms`
              }
            })()}
          </p>
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
              onClick={() => {
                setEditingFieldIndex(null)
                setOriginalEditingField(null)
                setPayloadFields([{
                  name: '',
                  type: 'number',
                  rule: '>',
                  value: '',
                  severity: 'error',
                }])
                setEditingPayloadRules(true)
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition-smooth"
            >
              Add
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
                {editingFieldIndex === null && (
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
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Configure fields to validate in your payload. Only declared fields are processed, rest is ignored. Maximum 5 fields per monitor. Field names must be 100 characters or less.
              </p>
              
              {payloadFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No fields configured. Click "Add Field" to add validation rules.
                </p>
              ) : (
                <div className="space-y-4">
                  {payloadFields.map((field, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <h4 className="text-sm font-semibold">Field {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            setPayloadFields(payloadFields.filter((_, i) => i !== index))
                          }}
                          className="text-xs px-3 py-1.5 text-error hover:bg-error/10 rounded transition-smooth font-medium"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-2 text-foreground">Field Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].name = e.target.value
                              setPayloadFields(newFields)
                            }}
                            placeholder="e.g., count"
                            className={`w-full px-3 py-2 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth ${
                              field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index)
                                ? 'border-error/50 focus:ring-error/50'
                                : 'border-input'
                            }`}
                          />
                          {field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index) && (
                            <p className="text-xs text-error mt-1">
                              A rule with this field name and condition already exists. Use a different condition to add multiple rules for the same field.
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-2 text-foreground">Type</label>
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
                            className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                          >
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="string">String</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium mb-2 text-foreground">Rule</label>
                          <select
                            value={field.rule}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].rule = e.target.value as '>' | '<' | '>=' | '<=' | '==' | '!='
                              setPayloadFields(newFields)
                            }}
                            className={`w-full px-3 py-2 bg-card border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${
                              field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index)
                                ? 'border-error/50 focus:ring-error/50'
                                : 'border-input'
                            }`}
                          >
                            {field.type === 'number' ? (
                              <>
                                <option value=">">Greater than</option>
                                <option value="<">Less than</option>
                                <option value=">=">Greater than or equal</option>
                                <option value="<=">Less than or equal</option>
                                <option value="==">Equal to</option>
                                <option value="!=">Not equal to</option>
                              </>
                            ) : (
                              <>
                                <option value="==">Equal to</option>
                                <option value="!=">Not equal to</option>
                              </>
                            )}
                          </select>
                          {field.name.trim() && checkDuplicateRule(field.name, field.rule, editingFieldIndex !== null ? null : index) && (
                            <p className="text-xs text-error mt-1">
                              A rule with this field name and condition already exists. Use a different condition to add multiple rules for the same field.
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-2 text-foreground">Value</label>
                          <div className="relative">
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
                              className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                            />
                            {field.type === 'number' && (
                              <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFields = [...payloadFields]
                                    const currentValue = Number(newFields[index].value) || 0
                                    newFields[index].value = String(currentValue + 1)
                                    setPayloadFields(newFields)
                                  }}
                                  className="w-5 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth rounded-t"
                                  tabIndex={-1}
                                >
                                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 0L10 6H0L5 0Z" fill="currentColor"/>
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFields = [...payloadFields]
                                    const currentValue = Number(newFields[index].value) || 0
                                    newFields[index].value = String(Math.max(0, currentValue - 1))
                                    setPayloadFields(newFields)
                                  }}
                                  className="w-5 h-3 flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth rounded-b"
                                  tabIndex={-1}
                                >
                                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 6L0 0H10L5 6Z" fill="currentColor"/>
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium mb-2 text-foreground">
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
                          className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                        >
                          <option value="error">Error (mark as FAIL)</option>
                          <option value="warn">Warning</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {payloadFields.length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-xs font-medium mb-1.5 text-foreground">Example:</p>
                  <p className="text-xs text-muted-foreground">
                    Validate that <code className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">count</code> field is greater than 100.
                    Your cron job should send: <code className="px-1.5 py-0.5 bg-background border border-border rounded text-xs font-mono">{"{ \"count\": 120 }"}</code>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleSavePayloadRules}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
              >
                {loading ? 'Saving...' : editingFieldIndex !== null ? 'Save Changes' : 'Add Rule'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingPayloadRules(false)
                  setEditingFieldIndex(null)
                  setOriginalEditingField(null)
                  setPayloadFields([])
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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Condition</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monitor.payload_validation_rules.fields.map((field: any, index: number) => (
                      <tr key={index} className="border-b border-border last:border-b-0">
                        <td className="py-2 px-3 font-medium">{field.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{getRuleLabel(field.rule)}</td>
                        <td className="py-2 px-3 font-mono">{String(field.value)}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditPayloadRule(index)}
                              className="px-2 py-1 text-xs border border-border rounded hover:bg-accent transition-smooth"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePayloadRule(index)}
                              className="px-2 py-1 text-xs text-error border border-error/20 rounded hover:bg-error/10 transition-smooth"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6">
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

      {/* Job Runs Section */}
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="text-base sm:text-lg font-semibold">Job Runs</h2>
        </div>
        <div className="divide-y divide-border">
          {jobRuns.length === 0 ? (
            <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-sm">
              <p className="mb-2">No job runs yet</p>
              <p className="text-xs">
                Use <code className="px-1 py-0.5 bg-muted rounded text-xs">POST /api/ping/[slug]/start</code> to track individual job executions
              </p>
            </div>
          ) : (
            jobRuns.map((run, index) => {
              const startedAt = new Date(run.started_at)
              const isRunning = run.status === 'running'
              const isTimeout = run.status === 'timeout'
              const isCompleted = run.status === 'completed'
              const isFailed = run.status === 'failed'
              
              // Check if running job exceeds max execution time
              const exceedsMaxTime = isRunning && monitor.max_execution_time_seconds && monitor.max_execution_time_seconds > 0
                ? (Date.now() - startedAt.getTime()) > (monitor.max_execution_time_seconds * 1000)
                : false
              
              const runningDurationMs = isRunning ? Date.now() - startedAt.getTime() : null
              const runningDurationSeconds = runningDurationMs ? Math.floor(runningDurationMs / 1000) : null
              
              let statusBadge = ''
              let statusClass = ''
              let statusText = ''
              
              if (isRunning) {
                statusBadge = '⏳'
                statusClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                statusText = 'RUNNING'
              } else if (isCompleted) {
                statusBadge = '✓'
                statusClass = 'bg-success/10 text-success border-success/20'
                statusText = 'COMPLETED'
              } else if (isTimeout) {
                statusBadge = '⚠️'
                statusClass = 'bg-warning/10 text-warning border-warning/20'
                statusText = 'TIMEOUT'
              } else if (isFailed) {
                statusBadge = '✗'
                statusClass = 'bg-error/10 text-error border-error/20'
                statusText = 'FAILED'
              }
              
              return (
                <div
                  key={run.id}
                  className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-accent/50 transition-smooth animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <span
                        className={`px-2 py-0.5 sm:py-1 text-xs font-semibold rounded border flex-shrink-0 ${statusClass}`}
                      >
                        {statusBadge} {statusText}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium font-mono truncate">
                          {run.run_id.substring(0, 8)}...
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {format(startedAt, 'PPp')}
                        </p>
                        {isRunning && runningDurationSeconds !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Running for: {Math.floor(runningDurationSeconds / 60)}m {runningDurationSeconds % 60}s
                            {exceedsMaxTime && (
                              <span className="ml-2 text-warning">⚠️ Exceeds max execution time</span>
                            )}
                          </p>
                        )}
                        {isCompleted && run.duration_ms !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Duration: {run.duration_ms}ms
                          </p>
                        )}
                        {isTimeout && run.duration_ms !== null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Timed out after: {Math.floor(run.duration_ms / 1000)}s
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {formatDistanceToNow(startedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
