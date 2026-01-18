'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TIER_LIMITS } from '@/lib/limits'
import { WarningTooltip, InfoTooltip } from '@/components/Tooltip'
import { WarningIcon, InfoIcon } from '@/components/Icons'

function NewMonitorForm() {
  const [name, setName] = useState('')
  const [userTier, setUserTier] = useState<keyof typeof TIER_LIMITS>('free')
  const [minIntervalMinutes, setMinIntervalMinutes] = useState(5) // Default to free tier minimum
  const [intervalMinutes, setIntervalMinutes] = useState(5) // Default to minimum
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours'>('minutes')
  const [gracePeriodHours, setGracePeriodHours] = useState(1)
  const [graceUnit, setGraceUnit] = useState<'minutes' | 'hours'>('hours')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPayloadValidation, setShowPayloadValidation] = useState(false)
  const [payloadFields, setPayloadFields] = useState<Array<{
    name: string
    type: 'number' | 'boolean' | 'string'
    rule: '>' | '<' | '>=' | '<=' | '==' | '!='
    value: string
    severity: 'warn' | 'error'
  }>>([])
  const [showAlertChannels, setShowAlertChannels] = useState(false)
  const [alertEmail, setAlertEmail] = useState('')
  const [slackWebhook, setSlackWebhook] = useState('')
  const [discordWebhook, setDiscordWebhook] = useState('')
  const [customWebhook, setCustomWebhook] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOnboarding, setIsOnboarding] = useState(false)
  
  useEffect(() => {
    const onboarding = searchParams.get('onboarding')
    setIsOnboarding(onboarding === 'true')
  }, [searchParams])
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Fetch user tier and set minimum interval
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          const tier = (data.tier || 'free') as keyof typeof TIER_LIMITS
          setUserTier(tier)
          
          // Set minimum interval based on tier
          const limit = TIER_LIMITS[tier] || TIER_LIMITS.free
          const minMinutes = limit.minInterval / 60
          setMinIntervalMinutes(minMinutes)
          
          // Update current interval if it's below minimum
          setIntervalMinutes((current) => Math.max(current, minMinutes))
        }
      } catch (err) {
        console.error('Error fetching user tier:', err)
      }
    }
    
    fetchUserTier()
    
    // Poll for tier changes (e.g., after subscription upgrade/downgrade)
    const interval = setInterval(fetchUserTier, 30000) // Check every 30 seconds
    
    // Also check when user returns to tab/window
    const handleFocus = () => fetchUserTier()
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!name.trim()) {
      setError('Monitor name is required')
      setLoading(false)
      return
    }

    // Convert to seconds for API
    // intervalMinutes is always stored in minutes (conversion happens in setIntervalValue)
    const expectedIntervalSeconds = intervalMinutes * 60
    // gracePeriodHours is always stored in hours (conversion happens in setGraceValue)
    const gracePeriodSeconds = gracePeriodHours * 3600

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
      name: name.trim(),
      expectedIntervalSeconds,
      gracePeriodSeconds,
    }

    // Include payload validation rules if any fields are configured
    if (payloadValidationRules) {
      requestBody.payloadValidationRules = payloadValidationRules
    }

    // Include alert channel overrides if any are set
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
    if (Object.keys(alertChannels).length > 0) {
      requestBody.alertChannels = alertChannels
    }

    // Create monitor via API route
    const response = await fetch('/api/monitors/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (response.status === 401) {
      router.push('/auth/login')
      return
    }

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Failed to create monitor')
      setLoading(false)
      return
    }

    // Redirect to monitor detail page
    if (data.monitor?.slug) {
      window.location.href = `/dashboard/monitors/${data.monitor.slug}?onboarding=${isOnboarding}`
    } else {
      setError('Monitor created but slug is missing')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        {isOnboarding ? 'Create Your First Monitor' : 'New Monitor'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Monitor Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Database Backup"
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
            />
            <p className="mt-2 text-sm text-muted-foreground">
              A descriptive name for this monitor
            </p>
          </div>

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

          {/* Payload Validation Section */}
          <div className="border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setShowPayloadValidation(!showPayloadValidation)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div>
                <h3 className="text-sm font-medium group-hover:text-primary transition-smooth">Payload Validation (Optional)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Verify that your cron job executed correctly by validating payload fields
                </p>
              </div>
              <span className="text-muted-foreground text-lg transition-transform group-hover:text-primary">
                {showPayloadValidation ? '▼' : '▶'}
              </span>
            </button>

            {showPayloadValidation && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
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
              </div>
            )}
          </div>

          {/* Alert Channels Override Section */}
          <div className="border-t border-border pt-6">
            <button
              type="button"
              onClick={() => setShowAlertChannels(!showAlertChannels)}
              className="flex items-center justify-between w-full text-left group"
            >
              <div>
                <h3 className="text-sm font-medium group-hover:text-primary transition-smooth">Alert Channels (Optional Override)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Override global alert settings for this monitor. Leave empty to use workspace defaults.
                </p>
              </div>
              <span className="text-muted-foreground text-lg transition-transform group-hover:text-primary">
                {showAlertChannels ? '▼' : '▶'}
              </span>
            </button>

            {showAlertChannels && (
              <div className="mt-4 space-y-4 pl-4 border-l-2 border-border">
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
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
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
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
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
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
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
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Override custom webhook for this monitor (Team plan only)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth"
            >
              {loading ? 'Creating...' : 'Create Monitor'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default function NewMonitorPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">New Monitor</h1>
        <div className="bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    }>
      <NewMonitorForm />
    </Suspense>
  )
}

