'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import { Monitor, MonitorUpdateRequest } from '@/lib/types/monitor'
import { TIER_LIMITS } from '@/lib/limits'
import { getErrorMessage } from '@/lib/error-utils'

interface MonitorIntervalSettingsProps {
  monitor: Monitor
  userTier: string
  loading: boolean
  onUpdate: (updatedMonitor: Monitor) => void
  onRefresh: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const MonitorIntervalSettings = memo(function MonitorIntervalSettings({
  monitor,
  userTier,
  loading,
  onUpdate,
  onRefresh,
  setLoading: setParentLoading,
}: MonitorIntervalSettingsProps) {
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

  // Sync state when monitor changes
  useEffect(() => {
    setIntervalMinutes(Math.floor(monitor.expected_interval_seconds / 60))
    setGracePeriodMinutes(Math.floor(monitor.grace_period_seconds / 60))
    setMaxExecutionTimeSeconds(monitor.max_execution_time_seconds || 0)
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
  }, [monitor.expected_interval_seconds, monitor.grace_period_seconds, monitor.max_execution_time_seconds])

  // Convert interval to appropriate unit for display
  const getIntervalValue = useCallback(() => {
    if (intervalUnit === 'hours') {
      return Math.round((intervalMinutes / 60) * 10) / 10
    }
    return intervalMinutes
  }, [intervalUnit, intervalMinutes])

  const setIntervalValue = useCallback((value: number) => {
    if (intervalUnit === 'hours') {
      setIntervalMinutes(Math.round(value * 60))
    } else {
      setIntervalMinutes(value)
    }
  }, [intervalUnit])

  // Convert grace period to appropriate unit for display
  const getGraceValue = useCallback(() => {
    if (graceUnit === 'minutes') {
      return Math.round(gracePeriodMinutes)
    }
    return Math.round((gracePeriodMinutes / 60) * 10) / 10
  }, [graceUnit, gracePeriodMinutes])

  const setGraceValue = useCallback((value: number) => {
    if (graceUnit === 'minutes') {
      setGracePeriodMinutes(Math.round(value))
    } else {
      setGracePeriodMinutes(Math.round(value * 60))
    }
  }, [graceUnit])

  // Convert max execution time to appropriate unit for display
  const getMaxExecutionTimeValue = useCallback(() => {
    if (maxExecutionTimeUnit === 'seconds') {
      return maxExecutionTimeSeconds
    } else if (maxExecutionTimeUnit === 'minutes') {
      return Math.round(maxExecutionTimeSeconds / 60)
    } else {
      return Math.round((maxExecutionTimeSeconds / 3600) * 10) / 10
    }
  }, [maxExecutionTimeUnit, maxExecutionTimeSeconds])

  const setMaxExecutionTimeValue = useCallback((value: number) => {
    if (maxExecutionTimeUnit === 'seconds') {
      setMaxExecutionTimeSeconds(Math.round(value))
    } else if (maxExecutionTimeUnit === 'minutes') {
      setMaxExecutionTimeSeconds(Math.round(value * 60))
    } else {
      setMaxExecutionTimeSeconds(Math.round(value * 3600))
    }
  }, [maxExecutionTimeUnit])

  const handleSaveIntervalSettings = useCallback(async () => {
    setParentLoading(true)
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

      const requestBody: MonitorUpdateRequest = {
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
          onUpdate(data.latestMonitor)
          throw new Error(data.error || 'Monitor was modified. Please review changes and try again.')
        }
        throw new Error(data.error || 'Failed to update interval settings')
      }

      const data = await response.json()
      if (data.monitor) {
        onUpdate(data.monitor)
      }

      setIntervalSuccess(true)
      setEditingInterval(false)
      await onRefresh()
      setTimeout(() => {
        setIntervalSuccess(false)
      }, 3000)
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err)
      setIntervalError(errorMessage)
    } finally {
      setParentLoading(false)
    }
  }, [
    intervalMinutes,
    gracePeriodMinutes,
    maxExecutionTimeEnabled,
    maxExecutionTimeSeconds,
    monitor.slug,
    monitor.updated_at,
    onUpdate,
    onRefresh,
    setParentLoading,
  ])

  const handleCancelIntervalEdit = useCallback(() => {
    setEditingInterval(false)
    setIntervalError(null)
    setIntervalSuccess(false)
    setIntervalMinutes(Math.floor(monitor.expected_interval_seconds / 60))
    setGracePeriodMinutes(Math.floor(monitor.grace_period_seconds / 60))
    setMaxExecutionTimeSeconds(monitor.max_execution_time_seconds || 0)
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
  }, [monitor.expected_interval_seconds, monitor.grace_period_seconds, monitor.max_execution_time_seconds])

  return (
    <>
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
                  onClick={handleCancelIntervalEdit}
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
                    onClick={handleSaveIntervalSettings}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-smooth disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelIntervalEdit}
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
    </>
  )
})

