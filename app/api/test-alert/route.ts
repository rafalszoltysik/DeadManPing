import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sendEmailAlert, sendSlackAlert, sendDiscordAlert, sendCustomWebhookAlert } from '@/lib/alerts'
import { validateCustomWebhookUrl, validateWebhookUrl } from '@/lib/webhooks-validator'

export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body to get form values (if provided)
    let body: {
      alert_email?: string
      slack_webhook_url?: string
      discord_webhook_url?: string
      custom_webhook_url?: string
      disable_email_alerts?: boolean
    } = {}
    
    try {
      body = await request.json()
    } catch (e) {
      // Body is optional, continue with profile values
    }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Fetch user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: any; error: any }

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get subscription tier and status (from workspace or profile)
    let subscriptionTier = profile.subscription_tier || 'free'
    let subscriptionStatus = profile.subscription_status || 'free'
    if (profile.workspace_id) {
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('subscription_tier, subscription_status')
        .eq('id', profile.workspace_id)
        .single() as { data: { subscription_tier?: string; subscription_status?: string } | null }
      if (workspace) {
        subscriptionTier = workspace.subscription_tier || subscriptionTier
        subscriptionStatus = workspace.subscription_status || subscriptionStatus
      }
    }

    // Check if user owns a workspace
    const { data: ownedWorkspace } = await supabaseAdmin
      .from('workspaces')
      .select('id, subscription_tier, subscription_status')
      .eq('owner_id', user.id)
      .limit(1)
      .single() as { data: { id: string; subscription_tier?: string; subscription_status?: string } | null }

    if (ownedWorkspace) {
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('subscription_tier, subscription_status')
        .eq('id', ownedWorkspace.id)
        .single() as { data: { subscription_tier?: string; subscription_status?: string } | null }
      if (workspace) {
        if (workspace.subscription_tier) {
          subscriptionTier = workspace.subscription_tier
        }
        if (workspace.subscription_status) {
          subscriptionStatus = workspace.subscription_status
        }
      }
    }

    // During trial (trialing status with free tier), allow Slack/Discord webhooks
    const isTrial = subscriptionStatus === 'trialing' && subscriptionTier === 'free'
    const hasSlackDiscord = ['starter', 'pro', 'team'].includes(subscriptionTier) || isTrial
    const hasCustomWebhook = subscriptionTier === 'team'

    // Use form values if provided, otherwise fall back to profile values
    const emailToUse = body.alert_email?.trim() || profile.alert_email || profile.email
    const slackWebhook = body.slack_webhook_url?.trim() || (hasSlackDiscord ? profile.slack_webhook_url : null)
    const discordWebhook = body.discord_webhook_url?.trim() || (hasSlackDiscord ? profile.discord_webhook_url : null)
    const customWebhook = body.custom_webhook_url?.trim() || (hasCustomWebhook ? profile.custom_webhook_url : null)
    
    // Check if email alerts should be disabled (from form or profile)
    const disableEmailAlerts = body.disable_email_alerts ?? profile.disable_email_alerts ?? false
    const hasAnyWebhook = !!(slackWebhook || discordWebhook || customWebhook)
    
    // Only disable email if explicitly disabled AND at least one webhook is configured
    const shouldSendEmail = emailToUse && (!disableEmailAlerts || !hasAnyWebhook)

    // Create a test monitor object for the alert
    const testMonitor = {
      id: 'test',
      slug: 'test-monitor',
      name: 'Test Monitor',
      url: 'https://example.com',
      status: 'healthy',
      interval_seconds: 60,
      expected_interval_seconds: 60,
      last_ping_at: new Date().toISOString(),
      workspace_id: ownedWorkspace?.id || null,
    }

    const channels: string[] = []
    const results: any[] = []

    // Send email alert
    if (shouldSendEmail) {
      try {
        const emailResult = await sendEmailAlert(emailToUse, testMonitor, 'recovered')
        if (emailResult.success) {
          channels.push('email')
          results.push({ channel: 'email', success: true })
        } else {
          results.push({ channel: 'email', success: false, error: emailResult.error })
        }
      } catch (error: any) {
        console.error('Error sending test email alert:', error)
        results.push({ channel: 'email', success: false, error: error.message })
      }
    }

    // Send Slack alert
    if (slackWebhook) {
      // Validate Slack webhook URL before sending
      const validation = validateWebhookUrl(slackWebhook, 'slack')
      if (!validation.valid) {
        results.push({ channel: 'slack', success: false, error: validation.error || 'Invalid Slack webhook URL' })
      } else {
        try {
          const slackResult = await sendSlackAlert(slackWebhook, testMonitor, 'recovered')
          if (slackResult.success) {
            channels.push('slack')
            results.push({ channel: 'slack', success: true })
          } else {
            results.push({ channel: 'slack', success: false, error: slackResult.error })
          }
        } catch (error: any) {
          console.error('Error sending test Slack alert:', error)
          results.push({ channel: 'slack', success: false, error: error.message })
        }
      }
    }

    // Send Discord alert
    if (discordWebhook) {
      // Validate Discord webhook URL before sending
      const validation = validateWebhookUrl(discordWebhook, 'discord')
      if (!validation.valid) {
        results.push({ channel: 'discord', success: false, error: validation.error || 'Invalid Discord webhook URL' })
      } else {
        try {
          const discordResult = await sendDiscordAlert(discordWebhook, testMonitor, 'recovered')
          if (discordResult.success) {
            channels.push('discord')
            results.push({ channel: 'discord', success: true })
          } else {
            results.push({ channel: 'discord', success: false, error: discordResult.error })
          }
        } catch (error: any) {
          console.error('Error sending test Discord alert:', error)
          results.push({ channel: 'discord', success: false, error: error.message })
        }
      }
    }

    // Send custom webhook alert (Team plan only)
    if (customWebhook) {
      // Validate custom webhook URL before sending (SSRF protection)
      const validation = validateCustomWebhookUrl(customWebhook)
      if (!validation.valid) {
        console.error('Invalid custom webhook URL:', validation.error)
        results.push({ channel: 'custom_webhook', success: false, error: validation.error })
      } else {
        try {
          const customResult = await sendCustomWebhookAlert(customWebhook, testMonitor, 'recovered')
          if (customResult.success) {
            channels.push('custom_webhook')
            results.push({ channel: 'custom_webhook', success: true })
          } else {
            results.push({ channel: 'custom_webhook', success: false, error: customResult.error })
          }
        } catch (error: any) {
          console.error('Error sending test custom webhook alert:', error)
          results.push({ channel: 'custom_webhook', success: false, error: error.message })
        }
      }
    }

    if (channels.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No alert integrations configured. Please configure at least one alert integration (email, Slack, Discord, or custom webhook) before testing.',
        channels: [],
        results,
      })
    }

    return NextResponse.json({
      success: true,
      channels,
      results,
      message: `Test alert sent successfully to ${channels.join(', ')}`,
    })
  } catch (error: any) {
    console.error('Error sending test alert:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

