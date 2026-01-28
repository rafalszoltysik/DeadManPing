'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TIER_LIMITS } from '@/lib/limits'
import { WarningTooltip, InfoTooltip } from '@/components/Tooltip'
import { WarningIcon, InfoIcon } from '@/components/Icons'
import { CronExpressionParser } from 'cron-parser'
import { format, addDays, startOfDay, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay, addMonths, addYears } from 'date-fns'

interface NewMonitorFormProps {
  userTier: keyof typeof TIER_LIMITS
}

export function NewMonitorForm({ userTier: initialUserTier }: NewMonitorFormProps) {
  const [name, setName] = useState('')
  const [userTier, setUserTier] = useState<keyof typeof TIER_LIMITS>(initialUserTier)
  const [scheduleType, setScheduleType] = useState<'interval' | 'cron' | 'calendar'>('interval')
  
  // Calculate minIntervalMinutes from tier
  const limit = TIER_LIMITS[userTier] || TIER_LIMITS.free
  const minIntervalMinutes = limit.minInterval / 60
  
  const [intervalMinutes, setIntervalMinutes] = useState(minIntervalMinutes) // Default to minimum
  const [intervalUnit, setIntervalUnit] = useState<'minutes' | 'hours'>('minutes')
  const [cronExpression, setCronExpression] = useState('0 */5 * * * *') // Default: every 5 minutes
  const [cronError, setCronError] = useState<string | null>(null)
  const [nextRuns, setNextRuns] = useState<Date[]>([])
  const [cronInputMode, setCronInputMode] = useState<'visual' | 'manual'>('manual')
  // Visual cron builder state
  const [cronMinute, setCronMinute] = useState<string>('*/5')
  const [cronHour, setCronHour] = useState<string>('*')
  const [cronDay, setCronDay] = useState<string>('*')
  const [cronMonth, setCronMonth] = useState<string>('*')
  const [cronWeekday, setCronWeekday] = useState<string>('*')
  const [selectedTime, setSelectedTime] = useState({ hour: 0, minute: 0 })
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([])
  const [cronFrequency, setCronFrequency] = useState<'every-minute' | 'every-hour' | 'daily' | 'weekly' | 'monthly' | 'custom'>('every-minute')
  // Calendar schedule state
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedHour, setSelectedHour] = useState<number>(0)
  const [selectedMinute, setSelectedMinute] = useState<number>(0)
  const [repeatType, setRepeatType] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [calendarSelectedDaysOfWeek, setCalendarSelectedDaysOfWeek] = useState<number[]>([])
  const [calendarSelectedDayOfMonth, setCalendarSelectedDayOfMonth] = useState<number>(1)
  const [gracePeriodHours, setGracePeriodHours] = useState(1)
  const [graceUnit, setGraceUnit] = useState<'minutes' | 'hours'>('hours')
  const [maxExecutionTimeMinutes, setMaxExecutionTimeMinutes] = useState(0)
  const [maxExecutionTimeUnit, setMaxExecutionTimeUnit] = useState<'minutes' | 'hours'>('minutes')
  const [maxExecutionTimeEnabled, setMaxExecutionTimeEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [monitoringMode, setMonitoringMode] = useState<'simple' | 'payload' | 'start-stop' | 'start-stop-payload'>('simple')
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

  // Auto-open payload validation when selecting modes that require it
  useEffect(() => {
    if (monitoringMode === 'payload' || monitoringMode === 'start-stop-payload') {
      setShowPayloadValidation(true)
    } else {
      setShowPayloadValidation(false)
    }
  }, [monitoringMode])

  // Auto-switch to manual mode on mobile (since Calendar button is hidden)
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 640 && cronInputMode === 'visual') {
        setCronInputMode('manual')
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [cronInputMode])
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(userTier)
  const hasCustomWebhook = userTier === 'team'

  // Poll for tier changes (e.g., after subscription upgrade/downgrade)
  useEffect(() => {
    async function fetchUserTier() {
      try {
        const response = await fetch('/api/user/tier')
        if (response.ok) {
          const data = await response.json()
          const tier = (data.tier || 'free') as keyof typeof TIER_LIMITS
          setUserTier(tier)
          
          // Update current interval if it's below minimum for new tier
          const limit = TIER_LIMITS[tier] || TIER_LIMITS.free
          const minMinutes = limit.minInterval / 60
          setIntervalMinutes((current) => Math.max(current, minMinutes))
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

  // Generate cron expression from calendar selections
  useEffect(() => {
    if (scheduleType === 'calendar') {
      let generated = '0 * * * * *'
      
      switch (repeatType) {
        case 'once':
          // Single execution - use the selected date and time
          const date = new Date(selectedDate)
          date.setHours(selectedHour, selectedMinute, 0, 0)
          // For single execution, we'll use a cron that runs once (this is a limitation - cron doesn't support one-time)
          // We'll use the date components
          generated = `0 ${selectedMinute} ${selectedHour} ${date.getDate()} ${date.getMonth() + 1} *`
          break
        case 'daily':
          generated = `0 ${selectedMinute} ${selectedHour} * * *`
          break
        case 'weekly':
          if (calendarSelectedDaysOfWeek.length > 0) {
            const weekday = calendarSelectedDaysOfWeek.sort((a, b) => a - b).join(',')
            generated = `0 ${selectedMinute} ${selectedHour} * * ${weekday}`
          } else {
            // Default to the day of the selected date
            const date = new Date(selectedDate)
            generated = `0 ${selectedMinute} ${selectedHour} * * ${getDay(date)}`
          }
          break
        case 'monthly':
          generated = `0 ${selectedMinute} ${selectedHour} ${calendarSelectedDayOfMonth} * *`
          break
        case 'yearly':
          const yearDate = new Date(selectedDate)
          generated = `0 ${selectedMinute} ${selectedHour} ${yearDate.getDate()} ${yearDate.getMonth() + 1} *`
          break
      }
      
      setCronExpression(generated)
    }
  }, [scheduleType, repeatType, selectedDate, selectedHour, selectedMinute, calendarSelectedDaysOfWeek, calendarSelectedDayOfMonth])

  // Validate and calculate next runs for cron expression
  useEffect(() => {
    if (scheduleType === 'cron' && cronExpression) {
      try {
        const interval = CronExpressionParser.parse(cronExpression, {
          currentDate: new Date(),
        })
        const runs: Date[] = []
        const now = new Date()
        for (let i = 0; i < 10; i++) {
          const next = interval.next()
          if (next.getTime() > now.getTime()) {
            runs.push(next.toDate())
          }
        }
        setNextRuns(runs)
        setCronError(null)
      } catch (err: any) {
        setCronError(err.message || 'Invalid cron expression')
        setNextRuns([])
      }
    } else {
      setNextRuns([])
      setCronError(null)
    }
  }, [cronExpression, scheduleType])

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

  // Convert max execution time to appropriate unit for display
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!name.trim()) {
      setError('Monitor name is required')
      setLoading(false)
      return
    }

    // Validate cron expression if using cron or calendar
    if (scheduleType === 'cron' || scheduleType === 'calendar') {
      if (!cronExpression.trim()) {
        setError('Cron expression is required')
        setLoading(false)
        return
      }
      if (cronError) {
        setError(`Invalid cron expression: ${cronError}`)
        setLoading(false)
        return
      }
      // Additional validation for calendar
      if (scheduleType === 'calendar' && repeatType === 'weekly' && calendarSelectedDaysOfWeek.length === 0) {
        setError('Please select at least one day of the week for weekly schedule')
        setLoading(false)
        return
      }
    }

    // Convert to seconds for API
    // intervalMinutes is always stored in minutes (conversion happens in setIntervalValue)
    const expectedIntervalSeconds = scheduleType === 'interval' ? intervalMinutes * 60 : 0
    // gracePeriodHours is always stored in hours (conversion happens in setGraceValue)
    const gracePeriodSeconds = gracePeriodHours * 3600
    // maxExecutionTimeMinutes is always stored in minutes (conversion happens in setMaxExecutionTimeValue)
    const maxExecutionTimeSeconds = maxExecutionTimeEnabled && maxExecutionTimeMinutes > 0
      ? maxExecutionTimeMinutes * 60
      : null

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
      maxExecutionTimeSeconds,
      scheduleType,
      ...(scheduleType === 'cron' && { cronExpression: cronExpression.trim() }),
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
    <div style={{ 
      opacity: 0, 
      animation: 'fadeIn 0.3s ease-out 0.1s forwards' 
    }}>
      <div className="mb-4 sm:mb-6">
        <Link 
          href="/dashboard" 
          className="text-primary hover:text-primary/80 text-xs sm:text-sm inline-block transition-smooth flex items-center gap-1.5 group hover-lift-smooth"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          Back to monitors
        </Link>
      </div>
      <div className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
          {isOnboarding ? 'Create Your First Monitor' : 'New Monitor'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 card-hover hover-lift-smooth" noValidate>
          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 animate-scale-in text-sm break-words">
              {error}
            </div>
          )}

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Monitor Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Daily Database Backup"
              className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 text-sm sm:text-base"
            />
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              A descriptive name for this monitor
            </p>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
              <label className="block text-sm font-medium">
                Schedule Type
              </label>
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setScheduleType('interval')}
                  className={`flex-1 sm:flex-none px-3 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                    scheduleType === 'interval'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Simple Interval
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType('cron')}
                  className={`flex-1 sm:flex-none px-3 sm:px-3 py-2 sm:py-1.5 text-xs sm:text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                    scheduleType === 'cron'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Cron Expression
                </button>
                {/* Calendar tab - hidden for now */}
                {/* <button
                  type="button"
                  onClick={() => setScheduleType('calendar')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                    scheduleType === 'calendar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Calendar
                </button> */}
              </div>
            </div>

            {scheduleType === 'interval' ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
                  <label htmlFor="interval" className="block text-sm font-medium">
                    Expected Interval
                  </label>
                  <div className="flex gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIntervalUnit('minutes')}
                      className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                        intervalUnit === 'minutes'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      Minutes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIntervalUnit('hours')}
                      className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                        intervalUnit === 'hours'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      Hours
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    id="interval"
                    type="range"
                    min={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes}
                    max={intervalUnit === 'hours' ? '24' : '1440'}
                    step={intervalUnit === 'hours' ? '0.1' : minIntervalMinutes >= 1 ? '1' : '0.5'}
                    value={getIntervalValue()}
                    onChange={(e) => setIntervalValue(Number(e.target.value))}
                    className="flex-1 h-2 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
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
                    className="w-20 sm:w-20 px-2 sm:px-2 py-2 sm:py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth focus:scale-[1.02] hover:border-primary/30 min-h-[44px] sm:min-h-0"
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
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                  How often should this job run?
                </p>
              </>
            ) : scheduleType === 'cron' ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
                  <label className="block text-sm font-medium">
                    Schedule Configuration
                  </label>
                  <div className="flex gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setCronInputMode('visual')}
                      className={`hidden sm:flex px-3 py-1.5 text-xs font-medium rounded transition-smooth ${
                        cronInputMode === 'visual'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      Calendar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCronInputMode('manual')}
                      className={`flex-1 sm:flex-none px-3 sm:px-3 py-2 sm:py-1.5 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                        cronInputMode === 'manual'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {cronInputMode === 'visual' ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Frequency</label>
                      <select
                        value={cronFrequency}
                        onChange={(e) => setCronFrequency(e.target.value as any)}
                        className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth focus:scale-[1.01] hover:border-primary/30 min-h-[44px] sm:min-h-0"
                      >
                        <option value="every-minute">Every Minute</option>
                        <option value="every-hour">Every Hour</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {(cronFrequency === 'daily' || cronFrequency === 'weekly' || cronFrequency === 'monthly') && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min="0"
                            max="23"
                            value={selectedTime.hour}
                            onChange={(e) => setSelectedTime({ ...selectedTime, hour: parseInt(e.target.value) || 0 })}
                            className="w-20 sm:w-20 px-2 sm:px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth focus:scale-[1.02] hover:border-primary/30 min-h-[44px] sm:min-h-0"
                            placeholder="Hour"
                          />
                          <span className="self-center text-muted-foreground">:</span>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={selectedTime.minute}
                            onChange={(e) => setSelectedTime({ ...selectedTime, minute: parseInt(e.target.value) || 0 })}
                            className="w-20 sm:w-20 px-2 sm:px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth focus:scale-[1.02] hover:border-primary/30 min-h-[44px] sm:min-h-0"
                            placeholder="Minute"
                          />
                        </div>
                      </div>
                    )}

                    {cronFrequency === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Days of Week</label>
                        <div className="flex flex-wrap gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (selectedDaysOfWeek.includes(idx)) {
                                  setSelectedDaysOfWeek(selectedDaysOfWeek.filter(d => d !== idx))
                                } else {
                                  setSelectedDaysOfWeek([...selectedDaysOfWeek, idx])
                                }
                              }}
                          className={`flex-1 sm:flex-none px-3 sm:px-3 py-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                            selectedDaysOfWeek.includes(idx)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {cronFrequency === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Day of Month</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={cronDay === '*' ? '' : cronDay}
                          onChange={(e) => setCronDay(e.target.value || '*')}
                          className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth min-h-[44px] sm:min-h-0"
                          placeholder="Day (1-31)"
                        />
                      </div>
                    )}

                    {cronFrequency === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Minute</label>
                          <input
                            type="text"
                            value={cronMinute}
                            onChange={(e) => setCronMinute(e.target.value)}
                            placeholder="*/5"
                            className="w-full px-3 py-2.5 sm:py-1.5 bg-background border border-input rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.01] hover:border-primary/30 transition-smooth min-h-[44px] sm:min-h-0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Hour</label>
                          <input
                            type="text"
                            value={cronHour}
                            onChange={(e) => setCronHour(e.target.value)}
                            placeholder="*"
                            className="w-full px-3 py-2.5 sm:py-1.5 bg-background border border-input rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.01] hover:border-primary/30 transition-smooth min-h-[44px] sm:min-h-0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Day</label>
                          <input
                            type="text"
                            value={cronDay}
                            onChange={(e) => setCronDay(e.target.value)}
                            placeholder="*"
                            className="w-full px-3 py-2.5 sm:py-1.5 bg-background border border-input rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.01] hover:border-primary/30 transition-smooth min-h-[44px] sm:min-h-0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Month</label>
                          <input
                            type="text"
                            value={cronMonth}
                            onChange={(e) => setCronMonth(e.target.value)}
                            placeholder="*"
                            className="w-full px-3 py-2.5 sm:py-1.5 bg-background border border-input rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.01] hover:border-primary/30 transition-smooth min-h-[44px] sm:min-h-0"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium mb-1">Weekday</label>
                          <input
                            type="text"
                            value={cronWeekday}
                            onChange={(e) => setCronWeekday(e.target.value)}
                            placeholder="*"
                            className="w-full px-3 py-2.5 sm:py-1.5 bg-background border border-input rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:scale-[1.01] hover:border-primary/30 transition-smooth min-h-[44px] sm:min-h-0"
                          />
                        </div>
                      </div>
                    )}

                    <div className="p-3 sm:p-3 bg-muted/30 rounded-lg border border-border animate-slide-up">
                      <p className="text-xs font-medium mb-1.5">Generated Cron Expression:</p>
                      <code className="text-xs sm:text-sm font-mono text-primary break-all block">{cronExpression}</code>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="cronExpression" className="block text-sm font-medium mb-2">
                      Cron Expression
                      <InfoTooltip content="Format: second minute hour day month weekday. Example: '0 */5 * * * *' runs every 5 minutes.">
                        <button type="button" className="ml-1 text-muted-foreground hover:text-foreground transition-smooth">
                          <InfoIcon className="w-4 h-4 inline" />
                        </button>
                      </InfoTooltip>
                    </label>
                    <input
                      id="cronExpression"
                      type="text"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="0 */5 * * * *"
                      className={`w-full px-3 py-2.5 sm:py-2 bg-background border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-h-[44px] sm:min-h-0 ${
                        cronError ? 'border-error' : 'border-input'
                      }`}
                    />
                    {cronError && (
                      <p className="mt-1 text-xs text-error">{cronError}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Format: <code className="px-1 py-0.5 bg-muted rounded">second minute hour day month weekday</code>
                    </p>
                    <div className="mt-2 p-3 sm:p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium mb-2">Common Examples:</p>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="break-words"><code className="text-primary">0 */5 * * * *</code> - Every 5 minutes</div>
                        <div className="break-words"><code className="text-primary">0 0 * * * *</code> - Every hour</div>
                        <div className="break-words"><code className="text-primary">0 0 0 * * *</code> - Daily at midnight</div>
                        <div className="break-words"><code className="text-primary">0 0 9 * * 1-5</code> - Weekdays at 9 AM</div>
                        <div className="break-words"><code className="text-primary">0 0 0 1 * *</code> - First day of month</div>
                      </div>
                    </div>
                  </div>
                )}

                {nextRuns.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Next Scheduled Runs
                    </label>
                    <div className="bg-background border border-input rounded-lg p-3 sm:p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-1.5">
                        {nextRuns.map((date, idx) => (
                          <div key={idx} className="text-xs sm:text-sm font-mono text-muted-foreground break-words">
                            {format(date, 'yyyy-MM-dd HH:mm:ss')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Calendar schedule
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-h-[44px] sm:min-h-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(parseInt(e.target.value) || 0)}
                      className="w-20 sm:w-20 px-2 sm:px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth focus:scale-[1.02] hover:border-primary/30 min-h-[44px] sm:min-h-0"
                      placeholder="Hour"
                    />
                    <span className="self-center text-muted-foreground">:</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(parseInt(e.target.value) || 0)}
                      className="w-20 sm:w-20 px-2 sm:px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth focus:scale-[1.02] hover:border-primary/30 min-h-[44px] sm:min-h-0"
                      placeholder="Minute"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Repeat</label>
                  <select
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value as any)}
                    className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth min-h-[44px] sm:min-h-0"
                  >
                    <option value="once">Once (single execution)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {repeatType === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Days of Week</label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (calendarSelectedDaysOfWeek.includes(idx)) {
                              setCalendarSelectedDaysOfWeek(calendarSelectedDaysOfWeek.filter(d => d !== idx))
                            } else {
                              setCalendarSelectedDaysOfWeek([...calendarSelectedDaysOfWeek, idx])
                            }
                          }}
                          className={`flex-1 sm:flex-none px-3 sm:px-3 py-2.5 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                            calendarSelectedDaysOfWeek.includes(idx)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {repeatType === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={calendarSelectedDayOfMonth}
                      onChange={(e) => setCalendarSelectedDayOfMonth(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-smooth min-h-[44px] sm:min-h-0"
                    />
                  </div>
                )}

                <div className="p-3 sm:p-3 bg-muted/30 rounded-lg border border-border animate-slide-up">
                  <p className="text-xs font-medium mb-1.5">Generated Cron Expression:</p>
                  <code className="text-xs sm:text-sm font-mono text-primary break-all block">{cronExpression}</code>
                </div>

                {nextRuns.length > 0 && (
                  <div className="animate-slide-up">
                    <label className="block text-sm font-medium mb-2">
                      Next Scheduled Runs
                    </label>
                    <div className="bg-background border border-input rounded-lg p-3 sm:p-3 max-h-48 overflow-y-auto">
                      <div className="space-y-1.5">
                        {nextRuns.map((date, idx) => (
                          <div key={idx} className="text-xs sm:text-sm font-mono text-muted-foreground animate-fade-in break-words" style={{ animationDelay: `${idx * 50}ms` }}>
                            {format(date, 'yyyy-MM-dd HH:mm:ss')}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2">
              <label htmlFor="grace" className="block text-sm font-medium">
                Grace Period
              </label>
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setGraceUnit('minutes')}
                      className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                        graceUnit === 'minutes'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                >
                  Minutes
                </button>
                <button
                  type="button"
                  onClick={() => setGraceUnit('hours')}
                  className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                    graceUnit === 'hours'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Hours
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <input
                id="grace"
                type="range"
                min="0"
                max={graceUnit === 'hours' ? '24' : '1440'}
                step={graceUnit === 'hours' ? '0.5' : '30'}
                value={getGraceValue()}
                onChange={(e) => setGraceValue(Number(e.target.value))}
                className="flex-1 h-2 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
              />
              <input
                type="number"
                min="0"
                max={graceUnit === 'hours' ? '24' : '1440'}
                step={graceUnit === 'hours' ? '0.5' : '30'}
                value={getGraceValue()}
                onChange={(e) => setGraceValue(Number(e.target.value))}
                className="w-20 sm:w-20 px-2 sm:px-2 py-2 sm:py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth min-h-[44px] sm:min-h-0"
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0 {graceUnit}</span>
              <span>{graceUnit === 'hours' ? '24 hours' : '1440 min'}</span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              How long to wait before alerting if the job doesn't run?
            </p>
          </div>

          {/* Max Execution Time Section */}
          <div className="border-t border-border pt-4 sm:pt-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="maxExecutionTime" className="block text-sm font-medium">
                Max Execution Time (Optional)
              </label>
              <div className="flex gap-1 bg-muted rounded-lg p-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setMaxExecutionTimeUnit('minutes')}
                  className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                    maxExecutionTimeUnit === 'minutes'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  Minutes
                </button>
                <button
                  type="button"
                  onClick={() => setMaxExecutionTimeUnit('hours')}
                  className={`flex-1 sm:flex-none px-3 py-2 sm:py-1 text-xs font-medium rounded transition-smooth active:scale-95 min-h-[44px] sm:min-h-0 ${
                    maxExecutionTimeUnit === 'hours'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
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
                htmlFor="maxExecutionTimeEnabled" 
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
              <>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    id="maxExecutionTime"
                    type="range"
                    min={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
                    max={maxExecutionTimeUnit === 'hours' ? '24' : '1440'}
                    step={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
                    value={getMaxExecutionTimeValue()}
                    onChange={(e) => setMaxExecutionTimeValue(Number(e.target.value))}
                    className="flex-1 h-2 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0"
                  />
                  <input
                    type="number"
                    min={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
                    max={maxExecutionTimeUnit === 'hours' ? '24' : '1440'}
                    step={maxExecutionTimeUnit === 'hours' ? '0.1' : '1'}
                    value={getMaxExecutionTimeValue()}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value >= (maxExecutionTimeUnit === 'hours' ? 0.1 : 1)) {
                        setMaxExecutionTimeValue(value)
                      }
                    }}
                    className="w-20 sm:w-20 px-2 sm:px-2 py-2 sm:py-1 bg-background border border-input rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-smooth min-h-[44px] sm:min-h-0"
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {maxExecutionTimeUnit === 'hours' ? '0.1 hr' : '1 min'}
                  </span>
                  <span>{maxExecutionTimeUnit === 'hours' ? '24 hours' : '1440 min'}</span>
                </div>
              </>
            )}

            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Maximum time a job can run before being marked as timeout. If set, jobs that run longer than this time will trigger an alert.
            </p>
          </div>

          {/* Monitoring Mode Section */}
          <div className="border-t border-border pt-4 sm:pt-6">
            <h3 className="text-sm font-medium mb-3">Monitoring Mode</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Choose how you want to monitor your job execution
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMonitoringMode('simple')
                  setShowPayloadValidation(false)
                  setPayloadFields([])
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-smooth ${
                  monitoringMode === 'simple'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-medium text-sm mb-1">Simple Ping</div>
                <div className="text-xs text-muted-foreground">
                  Just verify that your job executed. No payload validation or duration tracking.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitoringMode('payload')
                  setShowPayloadValidation(true)
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-smooth ${
                  monitoringMode === 'payload'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-medium text-sm mb-1">Ping with Payload</div>
                <div className="text-xs text-muted-foreground">
                  Verify execution and validate payload data to ensure correctness.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitoringMode('start-stop')
                  setShowPayloadValidation(false)
                  setPayloadFields([])
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-smooth ${
                  monitoringMode === 'start-stop'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-medium text-sm mb-1">Start/Stop Tracking</div>
                <div className="text-xs text-muted-foreground">
                  Track job duration by sending start and stop signals. No payload validation.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMonitoringMode('start-stop-payload')
                  setShowPayloadValidation(true)
                }}
                className={`p-3 sm:p-4 rounded-lg border-2 text-left transition-smooth ${
                  monitoringMode === 'start-stop-payload'
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="font-medium text-sm mb-1">Start/Stop with Payload</div>
                <div className="text-xs text-muted-foreground">
                  Track duration and validate payload data for complete monitoring.
                </div>
              </button>
            </div>

            {(monitoringMode === 'start-stop' || monitoringMode === 'start-stop-payload') && (
              <div className="mt-4 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-xs font-medium mb-2">Start/Stop Tracking Instructions</div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Send a POST request to <code className="bg-background px-1 py-0.5 rounded">/api/ping/your-slug/start</code> when your job starts</p>
                  <p>• Send a POST request to <code className="bg-background px-1 py-0.5 rounded">/api/ping/your-slug?run_id=your-run-id</code> when your job completes</p>
                  <p>• The system will track duration and alert if the job doesn't complete within the max execution time</p>
                  <p className="mt-2 text-xs italic">Note: In the next step, you'll receive the exact URLs for start and stop endpoints.</p>
                </div>
              </div>
            )}
          </div>

          {/* Payload Validation Section */}
          {(monitoringMode === 'payload' || monitoringMode === 'start-stop-payload') && (
            <div className="border-t border-border pt-4 sm:pt-6">
              <button
                type="button"
                onClick={() => setShowPayloadValidation(!showPayloadValidation)}
                className="flex items-center justify-between w-full text-left group py-2 sm:py-0"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm font-medium group-hover:text-primary transition-smooth">Payload Validation</h3>
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
                      className="text-xs px-3 py-2 sm:py-1 border border-border rounded hover:bg-accent transition-smooth disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 whitespace-nowrap"
                    >
                      + Add Field {payloadFields.length >= 5 ? '(max 5)' : ''}
                    </button>
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
                        <div key={index} className="bg-card border border-border rounded-lg p-4 sm:p-5 space-y-4 animate-slide-up card-hover" style={{ animationDelay: `${index * 50}ms` }}>
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
                                className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth"
                              />
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
                                className="w-full px-3 py-2 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22rgb(161%2C%20161%2C%20170)%22%20d%3D%22M6%209L1%204h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_0.75rem_center] bg-no-repeat pr-10"
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
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium mb-2 text-foreground">Value</label>
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
                  
                  <p className="mt-3 text-xs text-muted-foreground">
                    Example: Validate that <code className="px-1 py-0.5 bg-muted rounded">count</code> field is greater than 100.
                    Your cron job should send: <code className="px-1 py-0.5 bg-muted rounded">{"{ \"count\": 120 }"}</code>
                  </p>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Alert Channels Override Section */}
          <div className="border-t border-border pt-4 sm:pt-6">
            <button
              type="button"
              onClick={() => setShowAlertChannels(!showAlertChannels)}
              className="flex items-center justify-between w-full text-left group py-2 sm:py-0"
            >
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-sm font-medium group-hover:text-primary transition-smooth">Alert Channels (Optional Override)</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Override global alert settings for this monitor. Leave empty to use workspace defaults.
                </p>
              </div>
              <span className="text-muted-foreground text-lg transition-transform group-hover:text-primary flex-shrink-0">
                {showAlertChannels ? '▼' : '▶'}
              </span>
            </button>

            {showAlertChannels && (
              <div className="mt-4 space-y-3 sm:space-y-4 pl-3 sm:pl-4 border-l-2 border-border animate-slide-up">
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
                    className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base min-h-[44px] sm:min-h-0"
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
                        className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base min-h-[44px] sm:min-h-0"
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
                        className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base min-h-[44px] sm:min-h-0"
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
                      className="w-full px-3 py-2.5 sm:py-2 bg-background border border-input rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-smooth text-sm sm:text-base min-h-[44px] sm:min-h-0"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Override custom webhook for this monitor (Team plan only)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-smooth active:scale-95 hover:border-primary/20 hover:shadow-sm hover-lift-smooth min-h-[44px] sm:min-h-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-smooth hover-lift-smooth hover-scale active:scale-95 min-h-[44px] sm:min-h-0"
            >
              {loading ? 'Creating...' : 'Create Monitor'}
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  )
}

