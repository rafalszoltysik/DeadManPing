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
import { CodeBlock } from './CodeBlock'
import { getErrorMessage } from '@/lib/error-utils'
import type { PayloadField } from '@/lib/payload-validator'
import { MonitorHeader } from './MonitorHeader'
import { MonitorDeleteConfirmation } from './MonitorDeleteConfirmation'
import { MonitorIntervalSettings } from './MonitorIntervalSettings'
import { MonitorPayloadValidation } from './MonitorPayloadValidation'
import { MonitorAlertChannels } from './MonitorAlertChannels'

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


export function MonitorDetail({ monitor: initialMonitor, pings: initialPings, jobRuns: initialJobRuns = [], pingUrl, isOnboarding, userTier: initialUserTier = 'free' }: MonitorDetailProps) {
  const [monitor, setMonitor] = useState(initialMonitor)
  const [pings, setPings] = useState(initialPings)
  const [jobRuns, setJobRuns] = useState(initialJobRuns)
  const [pingMethod, setPingMethod] = useState<'simple' | 'job-runs'>('simple')
  const [waitingForPing, setWaitingForPing] = useState(initialMonitor.status === 'pending' && initialPings.length === 0)
  const [userTier, setUserTier] = useState(initialUserTier)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null) // For delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  

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
        // Silently fail - tier polling is not critical
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





  // Determine monitoring mode based on monitor configuration
  const hasStartStop = monitor.max_execution_time_seconds !== null && monitor.max_execution_time_seconds > 0
  const hasPayloadFields = monitor.payload_validation_rules?.fields && monitor.payload_validation_rules.fields.length > 0

  // Build example payload from configured fields
  const buildExamplePayload = () => {
    if (!hasPayloadFields || !monitor.payload_validation_rules) {
      return null
    }
    
    const examplePayload: Record<string, unknown> = {}
    monitor.payload_validation_rules.fields.forEach((field: PayloadField) => {
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
            }).catch(() => {
              // Silently fail - status update is not critical
            })
          }
        }
        if (data.pings) {
          setPings(data.pings)
        }
      }
    } catch (err) {
      // Error handling is done by parent component
    }
  }, [monitor.slug])

  // Poll for new pings and monitor updates
  useEffect(() => {

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
  }, [isOnboarding, waitingForPing, monitor.slug, fetchMonitorData])

  useEffect(() => {
    if (pings.length > 0 && waitingForPing) {
      setWaitingForPing(false)
    }
  }, [pings.length, waitingForPing])



  const handleDeleteMonitor = useCallback(async () => {
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
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)
      setDeleting(false)
    }
  }, [monitor.slug])

  return (
    <div>
      <MonitorHeader 
        monitor={monitor} 
        onDeleteClick={() => setShowDeleteConfirm(true)} 
      />

      <MonitorDeleteConfirmation
        monitorName={monitor.name}
        monitorSlug={monitor.slug}
        show={showDeleteConfirm}
        deleting={deleting}
        error={error}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteMonitor}
      />

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

      <MonitorIntervalSettings
        monitor={monitor}
        userTier={userTier}
        loading={loading}
        onUpdate={setMonitor}
        onRefresh={fetchMonitorData}
        setLoading={setLoading}
      />

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

      <MonitorPayloadValidation
        monitor={monitor}
        loading={loading}
        onUpdate={setMonitor}
        onRefresh={fetchMonitorData}
        setLoading={setLoading}
      />

      <MonitorAlertChannels
        monitor={monitor}
        userTier={userTier}
        loading={loading}
        onUpdate={setMonitor}
        onRefresh={fetchMonitorData}
        setLoading={setLoading}
      />

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
