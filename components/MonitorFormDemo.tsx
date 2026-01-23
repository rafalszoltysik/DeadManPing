'use client'

import { useState, useEffect } from 'react'

type PayloadField = {
  name: string
  type: 'number' | 'boolean' | 'string'
  rule: '>' | '<' | '>=' | '<=' | '==' | '!='
  value: string
  severity: 'warn' | 'error'
}

export type MonitorFormData = {
  name: string
  scheduleType: 'interval' | 'cron'
  intervalValue: number
  intervalUnit: 'hours' | 'minutes'
  cronExpression?: string
  payloadFields: PayloadField[]
}

interface MonitorFormDemoProps {
  onChange?: (data: MonitorFormData) => void
}

export function MonitorFormDemo({ onChange }: MonitorFormDemoProps) {
  const [name, setName] = useState('Daily Backup')
  const [scheduleType, setScheduleType] = useState<'interval' | 'cron'>('interval')
  const [intervalValue, setIntervalValue] = useState(24)
  const [intervalUnit, setIntervalUnit] = useState<'hours' | 'minutes'>('hours')
  const [cronExpression, setCronExpression] = useState('0 0 * * *')
  const [gracePeriodHours, setGracePeriodHours] = useState(1)
  const [graceUnit, setGraceUnit] = useState<'hours' | 'minutes'>('hours')
  const [maxExecutionTimeMinutes, setMaxExecutionTimeMinutes] = useState(0)
  const [maxExecutionTimeUnit, setMaxExecutionTimeUnit] = useState<'hours' | 'minutes'>('minutes')
  const [maxExecutionTimeEnabled, setMaxExecutionTimeEnabled] = useState(false)
  const [showPayloadValidation, setShowPayloadValidation] = useState(false)
  const [payloadFields, setPayloadFields] = useState<PayloadField[]>([
    { name: 'count', type: 'number', rule: '>=', value: '1', severity: 'error' },
  ])

  // Notify parent when form data changes
  const updateFormData = (updates: Partial<{ name: string; scheduleType: 'interval' | 'cron'; intervalValue: number; intervalUnit: 'hours' | 'minutes'; cronExpression?: string; payloadFields: PayloadField[] }>) => {
    const newData: MonitorFormData = {
      name: updates.name ?? name,
      scheduleType: updates.scheduleType ?? scheduleType,
      intervalValue: updates.intervalValue ?? intervalValue,
      intervalUnit: updates.intervalUnit ?? intervalUnit,
      cronExpression: updates.cronExpression ?? cronExpression,
      payloadFields: updates.payloadFields ?? payloadFields,
    }
    onChange?.(newData)
  }

  const getGraceValue = () => {
    if (graceUnit === 'minutes') {
      return Math.round(gracePeriodHours * 60)
    }
    return gracePeriodHours
  }

  const setGraceValue = (value: number) => {
    if (graceUnit === 'minutes') {
      setGracePeriodHours(Math.round((value / 60) * 100) / 100)
    } else {
      setGracePeriodHours(value)
    }
  }

  const displayInterval = intervalUnit === 'hours' 
    ? `${intervalValue} ${intervalValue === 1 ? 'hour' : 'hours'}`
    : `${intervalValue} ${intervalValue === 1 ? 'minute' : 'minutes'}`

  const displayGrace = graceUnit === 'hours'
    ? `${gracePeriodHours} ${gracePeriodHours === 1 ? 'hour' : 'hours'}`
    : `${Math.round(gracePeriodHours * 60)} ${Math.round(gracePeriodHours * 60) === 1 ? 'minute' : 'minutes'}`

  const getMaxExecutionTimeValue = () => {
    if (maxExecutionTimeUnit === 'hours') {
      return Math.round((maxExecutionTimeMinutes / 60) * 10) / 10
    }
    return maxExecutionTimeMinutes
  }

  const setMaxExecutionTimeValue = (value: number) => {
    if (maxExecutionTimeUnit === 'hours') {
      setMaxExecutionTimeMinutes(Math.round(value * 60))
    } else {
      setMaxExecutionTimeMinutes(Math.round(value))
    }
  }

  const displayMaxExecutionTime = maxExecutionTimeUnit === 'hours'
    ? `${getMaxExecutionTimeValue()} ${getMaxExecutionTimeValue() === 1 ? 'hour' : 'hours'}`
    : `${maxExecutionTimeMinutes} ${maxExecutionTimeMinutes === 1 ? 'minute' : 'minutes'}`

  // Notify parent on mount
  useEffect(() => {
    updateFormData({})
  }, [])

  return (
    <div className="bg-background border border-border rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="demo-name" className="block text-sm font-medium mb-2">
          Monitor Name
        </label>
        <input
          id="demo-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            updateFormData({ name: e.target.value })
          }}
          placeholder="e.g., Daily Database Backup"
          className="w-full px-3 py-2.5 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          A descriptive name for this monitor
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="demo-schedule" className="block text-sm font-medium">
            Schedule
          </label>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setScheduleType('interval')
                updateFormData({ scheduleType: 'interval' })
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
                scheduleType === 'interval'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Interval
            </button>
            <button
              type="button"
              onClick={() => {
                setScheduleType('cron')
                updateFormData({ scheduleType: 'cron' })
              }}
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
                scheduleType === 'cron'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cron
            </button>
          </div>
        </div>

        {scheduleType === 'interval' ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="demo-interval" className="block text-xs text-muted-foreground">
                Expected Interval
              </label>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIntervalUnit('minutes')
                    updateFormData({ intervalUnit: 'minutes' })
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
                    intervalUnit === 'minutes'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Minutes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIntervalUnit('hours')
                    updateFormData({ intervalUnit: 'hours' })
                  }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
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
                id="demo-interval"
                type="range"
                min={intervalUnit === 'hours' ? '1' : '5'}
                max={intervalUnit === 'hours' ? '168' : '1440'}
                step={intervalUnit === 'hours' ? '1' : '5'}
                value={intervalValue}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setIntervalValue(val)
                  updateFormData({ intervalValue: val })
                }}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
              />
              <input
                type="number"
                min={intervalUnit === 'hours' ? '1' : '5'}
                max={intervalUnit === 'hours' ? '168' : '1440'}
                step={intervalUnit === 'hours' ? '1' : '5'}
                value={intervalValue}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  const min = intervalUnit === 'hours' ? 1 : 5
                  const max = intervalUnit === 'hours' ? 168 : 1440
                  if (value >= min && value <= max) {
                    setIntervalValue(value)
                    updateFormData({ intervalValue: value })
                  }
                }}
                className="w-20 px-2 py-2 bg-card border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Expected every {displayInterval}
            </p>
          </>
        ) : (
          <>
            <label htmlFor="demo-cron" className="block text-xs text-muted-foreground mb-2">
              Cron Expression
            </label>
            <input
              id="demo-cron"
              type="text"
              value={cronExpression}
              onChange={(e) => {
                setCronExpression(e.target.value)
                updateFormData({ cronExpression: e.target.value })
              }}
              placeholder="e.g., 0 0 * * *"
              className="w-full px-3 py-2.5 bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use standard cron format: minute hour day month weekday
            </p>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="demo-grace" className="block text-sm font-medium">
            Grace Period
          </label>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setGraceUnit('minutes')}
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
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
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
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
            id="demo-grace"
            type="range"
            min="0"
            max={graceUnit === 'hours' ? '24' : '1440'}
            step={graceUnit === 'hours' ? '0.5' : '30'}
            value={getGraceValue()}
            onChange={(e) => setGraceValue(Number(e.target.value))}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
          />
          <input
            type="number"
            min="0"
            max={graceUnit === 'hours' ? '24' : '1440'}
            step={graceUnit === 'hours' ? '0.5' : '30'}
            value={getGraceValue()}
            onChange={(e) => {
              const value = Number(e.target.value)
              const max = graceUnit === 'hours' ? 24 : 1440
              if (value >= 0 && value <= max) {
                setGraceValue(value)
              }
            }}
            className="w-20 px-2 py-2 bg-card border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          How long to wait before alerting if the job doesn't run? ({displayGrace})
        </p>
      </div>

      {/* Max Execution Time Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="demo-max-execution" className="block text-sm font-medium">
            Max Execution Time (Optional)
          </label>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setMaxExecutionTimeUnit('minutes')}
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
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
              className={`px-3 py-1 text-xs font-medium rounded transition-smooth ${
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
                setMaxExecutionTimeMinutes(0)
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
            className="text-sm text-muted-foreground cursor-pointer"
            onClick={() => {
              setMaxExecutionTimeEnabled(!maxExecutionTimeEnabled)
              if (maxExecutionTimeEnabled) {
                setMaxExecutionTimeMinutes(0)
              }
            }}
          >
            Enable timeout detection
          </label>
        </div>

        {maxExecutionTimeEnabled && (
          <div className="flex items-center gap-3">
            <input
              id="demo-max-execution"
              type="range"
              min={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
              max={maxExecutionTimeUnit === 'hours' ? '24' : '1440'}
              step={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
              value={getMaxExecutionTimeValue()}
              onChange={(e) => setMaxExecutionTimeValue(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
            />
            <input
              type="number"
              min={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
              max={maxExecutionTimeUnit === 'hours' ? '24' : '1440'}
              step={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
              value={getMaxExecutionTimeValue()}
              onChange={(e) => {
                const value = Number(e.target.value)
                const min = maxExecutionTimeUnit === 'hours' ? 0.1 : 1
                const max = maxExecutionTimeUnit === 'hours' ? 24 : 1440
                if (value >= min && value <= max) {
                  setMaxExecutionTimeValue(value)
                }
              }}
              className="w-20 px-2 py-2 bg-card border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
            />
          </div>
        )}
        {maxExecutionTimeEnabled && (
          <p className="mt-1 text-xs text-muted-foreground">
            Maximum time a job can run before being marked as timeout. If set, jobs that run longer than this time will trigger an alert. ({displayMaxExecutionTime})
          </p>
        )}
        {!maxExecutionTimeEnabled && (
          <p className="mt-1 text-xs text-muted-foreground">
            Optional: Set a maximum execution time to detect jobs that run longer than expected (zombie jobs).
          </p>
        )}
      </div>

      {/* Payload Validation Section */}
      <div className="border-t border-border pt-4 sm:pt-6">
        <button
          type="button"
          onClick={() => setShowPayloadValidation(!showPayloadValidation)}
          className="flex items-center justify-between w-full text-left group py-2 sm:py-0"
        >
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-sm font-medium group-hover:text-primary transition-smooth">Payload Validation (Optional)</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Verify that your cron job executed correctly by validating payload fields
            </p>
          </div>
          <span className="text-muted-foreground text-lg transition-transform group-hover:text-primary flex-shrink-0">
            {showPayloadValidation ? '▼' : '▶'}
          </span>
        </button>

        {showPayloadValidation && (
          <div className="mt-4 space-y-3 sm:space-y-4 pl-3 sm:pl-4 border-l-2 border-border">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Payload Fields
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (payloadFields.length < 5) {
                      const newFields = [...payloadFields, {
                        name: '',
                        type: 'number' as const,
                        rule: '>' as const,
                        value: '',
                        severity: 'error' as const,
                      }]
                      setPayloadFields(newFields)
                      updateFormData({ payloadFields: newFields })
                    }
                  }}
                  disabled={payloadFields.length >= 5}
                  className="text-xs px-3 py-2 sm:py-1 border border-border rounded hover:bg-accent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  + Add Field {payloadFields.length >= 5 ? '(max 5)' : ''}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Configure fields to validate in your payload. Only declared fields are processed, rest is ignored. Maximum 5 fields per monitor.
              </p>
              
              {payloadFields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No fields configured. Click "Add Field" to add validation rules.
                </p>
              ) : (
                <div className="space-y-3">
                  {payloadFields.map((field, index) => (
                    <div key={index} className="bg-card border border-input rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Field {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newFields = payloadFields.filter((_, i) => i !== index)
                            setPayloadFields(newFields)
                            updateFormData({ payloadFields: newFields })
                          }}
                          className="text-xs px-2 py-1 text-error hover:bg-error/10 rounded transition-smooth"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Field Name</label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].name = e.target.value
                              setPayloadFields(newFields)
                              updateFormData({ payloadFields: newFields })
                            }}
                            placeholder="e.g., count"
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium mb-1">Type</label>
                          <select
                            value={field.type}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].type = e.target.value as 'number' | 'boolean' | 'string'
                              if (e.target.value === 'number') {
                                newFields[index].rule = '>'
                                newFields[index].value = ''
                              } else {
                                newFields[index].rule = '=='
                                newFields[index].value = ''
                              }
                              setPayloadFields(newFields)
                              updateFormData({ payloadFields: newFields })
                            }}
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                          >
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="string">String</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium mb-1">Rule</label>
                          <select
                            value={field.rule}
                            onChange={(e) => {
                              const newFields = [...payloadFields]
                              newFields[index].rule = e.target.value as '>' | '<' | '>=' | '<=' | '==' | '!='
                              setPayloadFields(newFields)
                              updateFormData({ payloadFields: newFields })
                            }}
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
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
                              updateFormData({ payloadFields: newFields })
                            }}
                            placeholder={
                              field.type === 'number' 
                                ? 'e.g., 100' 
                                : field.type === 'boolean'
                                ? 'true or false'
                                : 'e.g., "ok"'
                            }
                            className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">Severity</label>
                        <select
                          value={field.severity}
                          onChange={(e) => {
                            const newFields = [...payloadFields]
                            newFields[index].severity = e.target.value as 'warn' | 'error'
                            setPayloadFields(newFields)
                            updateFormData({ payloadFields: newFields })
                          }}
                          className="w-full px-2 py-1.5 bg-background border border-input rounded text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
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
          </div>
        )}
      </div>
    </div>
  )
}
