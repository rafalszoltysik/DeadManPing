import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { generateEmailTemplate, generateEmailText } from '@/lib/email-templates'

const resend = new Resend(process.env.RESEND_API_KEY)

interface AlertData {
  monitor_id: string
  alert_type: 'missing' | 'failed' | 'recovered' | 'warn'
}

export async function sendAlert({ monitor_id, alert_type }: AlertData) {
  const supabaseAdmin = getSupabaseAdmin()
  
  // Fetch monitor with profile
  const { data: monitor, error: monitorError } = await supabaseAdmin
    .from('monitors')
    .select('*, profiles(*)')
    .eq('id', monitor_id)
    .single() as { data: any; error: any }

  if (monitorError || !monitor) {
    console.error('Monitor not found:', monitorError)
    return { success: false, error: 'Monitor not found' }
  }

  const monitorWithProfile = monitor as any
  const profile = monitorWithProfile.profiles as any
  if (!profile) {
    console.error('Profile not found for monitor')
    return { success: false, error: 'Profile not found' }
  }

  // Get subscription tier (from workspace or profile)
  let subscriptionTier = profile.subscription_tier || 'free'
  if (monitorWithProfile.workspace_id) {
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('subscription_tier')
      .eq('id', monitorWithProfile.workspace_id)
      .single() as { data: { subscription_tier?: string } | null }
    if (workspace) {
      subscriptionTier = workspace.subscription_tier || subscriptionTier
    }
  }
  
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(subscriptionTier)
  const hasCustomWebhook = subscriptionTier === 'team'

  // Check if we should send alert (anti-spam: max 1 reminder per 24h for same alert type)
  const { data: recentAlerts } = await supabaseAdmin
    .from('alerts')
    .select('sent_at')
    .eq('monitor_id', monitor_id)
    .eq('alert_type', alert_type)
    .gte('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1)

  // For missing/failed/warn alerts, only send if no recent alert of same type
  if ((alert_type === 'missing' || alert_type === 'failed' || alert_type === 'warn') && recentAlerts && recentAlerts.length > 0) {
    console.log('Skipping alert due to recent alert (anti-spam)')
    return { success: false, error: 'Recent alert exists, skipping' }
  }

  // Always send recovery alerts
  const channels: string[] = []
  const results: any[] = []

  // Determine which channels to use: monitor override first, then profile/workspace default
  const emailToUse = monitorWithProfile.alert_email || profile.alert_email || profile.email
  const slackWebhook = monitorWithProfile.slack_webhook_url || (hasSlackDiscord ? profile.slack_webhook_url : null)
  const discordWebhook = monitorWithProfile.discord_webhook_url || (hasSlackDiscord ? profile.discord_webhook_url : null)
  const customWebhook = monitorWithProfile.custom_webhook_url || (hasCustomWebhook ? profile.custom_webhook_url : null)

  // Send email alert
  if (emailToUse) {
    try {
      const emailResult = await sendEmailAlert(emailToUse, monitorWithProfile, alert_type)
      if (emailResult.success) {
        channels.push('email')
        results.push({ channel: 'email', success: true })
      } else {
        results.push({ channel: 'email', success: false, error: emailResult.error })
      }
    } catch (error: any) {
      console.error('Error sending email alert:', error)
      results.push({ channel: 'email', success: false, error: error.message })
    }
  }

  // Send Slack alert
  if (slackWebhook) {
    try {
      const slackResult = await sendSlackAlert(slackWebhook, monitorWithProfile, alert_type)
      if (slackResult.success) {
        channels.push('slack')
        results.push({ channel: 'slack', success: true })
      } else {
        results.push({ channel: 'slack', success: false, error: slackResult.error })
      }
    } catch (error: any) {
      console.error('Error sending Slack alert:', error)
      results.push({ channel: 'slack', success: false, error: error.message })
    }
  }

  // Send Discord alert
  if (discordWebhook) {
    try {
      const discordResult = await sendDiscordAlert(discordWebhook, monitorWithProfile, alert_type)
      if (discordResult.success) {
        channels.push('discord')
        results.push({ channel: 'discord', success: true })
      } else {
        results.push({ channel: 'discord', success: false, error: discordResult.error })
      }
    } catch (error: any) {
      console.error('Error sending Discord alert:', error)
      results.push({ channel: 'discord', success: false, error: error.message })
    }
  }

  // Send custom webhook alert (Team plan only)
  if (customWebhook) {
    try {
      const customResult = await sendCustomWebhookAlert(customWebhook, monitorWithProfile, alert_type)
      if (customResult.success) {
        channels.push('custom_webhook')
        results.push({ channel: 'custom_webhook', success: true })
      } else {
        results.push({ channel: 'custom_webhook', success: false, error: customResult.error })
      }
    } catch (error: any) {
      console.error('Error sending custom webhook alert:', error)
      results.push({ channel: 'custom_webhook', success: false, error: error.message })
    }
  }

  // Log alert to database
  if (channels.length > 0) {
    await (supabaseAdmin.from('alerts') as any).insert({
      monitor_id,
      alert_type,
      channels,
      sent_at: new Date().toISOString(),
    })
  }

  return {
    success: channels.length > 0,
    channels,
    results,
  }
}

async function sendEmailAlert(email: string, monitor: any, alertType: string) {
  const subject = getEmailSubject(monitor.name, alertType)
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/monitors/${monitor.slug}`

  // Use environment variable for from email, or fallback to Resend's default domain for development
  // For production, set RESEND_FROM_EMAIL in environment variables
  // For development, Resend allows using onboarding@resend.dev
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'DeadManPing <onboarding@resend.dev>'

  // Generate professional email template
  const templateData = {
    monitorName: monitor.name,
    monitorStatus: monitor.status,
    lastPingAt: monitor.last_ping_at,
    dashboardUrl,
    alertType: alertType as 'missing' | 'failed' | 'recovered' | 'warn',
  }

  const html = generateEmailTemplate(templateData)
  const text = generateEmailText(templateData)

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject,
      html,
      text,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function sendSlackAlert(webhookUrl: string, monitor: any, alertType: string) {
  const message = getAlertMessage(monitor, alertType)
  const color = getAlertColorHex(alertType)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: message,
        attachments: [
          {
            color,
            fields: [
              { title: 'Monitor', value: monitor.name, short: true },
              { title: 'Status', value: monitor.status, short: true },
              ...(monitor.last_ping_at
                ? [{ title: 'Last Ping', value: new Date(monitor.last_ping_at).toLocaleString(), short: true }]
                : []),
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function sendDiscordAlert(webhookUrl: string, monitor: any, alertType: string) {
  const message = getAlertMessage(monitor, alertType)
  const color = parseInt(getAlertColorHex(alertType).replace('#', ''), 16)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: message,
            color,
            fields: [
              { name: 'Monitor', value: monitor.name, inline: true },
              { name: 'Status', value: monitor.status, inline: true },
              ...(monitor.last_ping_at
                ? [{ name: 'Last Ping', value: new Date(monitor.last_ping_at).toLocaleString(), inline: true }]
                : []),
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

async function sendCustomWebhookAlert(webhookUrl: string, monitor: any, alertType: string) {
  const message = getAlertMessage(monitor, alertType)
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/monitors/${monitor.slug}`

  try {
    // Send a generic JSON payload that works with most webhook endpoints (PagerDuty, OpsGenie, etc.)
    const payload = {
      event_type: alertType,
      monitor: {
        id: monitor.id,
        name: monitor.name,
        slug: monitor.slug,
        status: monitor.status,
        last_ping_at: monitor.last_ping_at,
        expected_interval_seconds: monitor.expected_interval_seconds,
      },
      message,
      timestamp: new Date().toISOString(),
      dashboard_url: dashboardUrl,
      severity: alertType === 'recovered' ? 'info' : alertType === 'warn' ? 'warning' : 'critical',
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return { success: true }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' }
    }
    return { success: false, error: error.message }
  }
}

function getAlertEmoji(alertType: string): string {
  switch (alertType) {
    case 'missing':
      return '🔴'
    case 'failed':
      return '🔴'
    case 'warn':
      return '⚠️'
    case 'recovered':
      return '🟢'
    default:
      return '⚠️'
  }
}

function getEmailSubject(monitorName: string, alertType: string): string {
  switch (alertType) {
    case 'missing':
      return `🔴 MISSING: ${monitorName} didn't ping`
    case 'failed':
      return `🔴 FAILED: ${monitorName} reported failure`
    case 'warn':
      return `⚠️ WARNING: ${monitorName} is late`
    case 'recovered':
      return `🟢 RECOVERED: ${monitorName} is back online`
    default:
      return `Alert: ${monitorName}`
  }
}

function getEmailBody(monitor: any, alertType: string): string {
  switch (alertType) {
    case 'missing':
      return `Your monitor "${monitor.name}" hasn't sent a ping in the expected time window. This could indicate that your cron job or scheduled task didn't run.`
    case 'failed':
      return `Your monitor "${monitor.name}" reported a failure status. Please check your job logs.`
    case 'warn':
      return `Your monitor "${monitor.name}" is late - ping not received within expected interval. It's still within grace period, but please check your cron job.`
    case 'recovered':
      return `Good news! Your monitor "${monitor.name}" is back online and working correctly.`
    default:
      return `Alert for monitor "${monitor.name}"`
  }
}

function getAlertMessage(monitor: any, alertType: string): string {
  switch (alertType) {
    case 'missing':
      return `🔴 MISSING: ${monitor.name} didn't ping`
    case 'failed':
      return `🔴 FAILED: ${monitor.name} reported failure`
    case 'warn':
      return `⚠️ WARNING: ${monitor.name} is late`
    case 'recovered':
      return `🟢 RECOVERED: ${monitor.name} is back online`
    default:
      return `Alert: ${monitor.name}`
  }
}

function getAlertColor(alertType: string): string {
  switch (alertType) {
    case 'missing':
    case 'failed':
      return '#dc2626'
    case 'warn':
      return '#f59e0b'
    case 'recovered':
      return '#16a34a'
    default:
      return '#f59e0b'
  }
}

function getAlertColorHex(alertType: string): string {
  return getAlertColor(alertType)
}

