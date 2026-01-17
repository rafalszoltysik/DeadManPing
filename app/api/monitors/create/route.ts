import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { verifySession } from '@/lib/auth/session'
import { checkMonitorLimitByWorkspace, checkIntervalLimitByWorkspace } from '@/lib/limits'
import { validatePayloadRules } from '@/lib/payload-validator'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set')
  }

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function generateSlug(): string {
  return randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, expectedIntervalSeconds, gracePeriodSeconds, payloadValidationRules, alertChannels } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Monitor name is required' }, { status: 400 })
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Monitor name must be 100 characters or less' }, { status: 400 })
    }

    if (!expectedIntervalSeconds || typeof expectedIntervalSeconds !== 'number' || expectedIntervalSeconds < 30) {
      return NextResponse.json({ error: 'Expected interval must be at least 30 seconds' }, { status: 400 })
    }

    const gracePeriod = gracePeriodSeconds || 3600
    if (gracePeriod < 0) {
      return NextResponse.json({ error: 'Grace period cannot be negative' }, { status: 400 })
    }

    // Validate and sanitize payload validation rules
    let validatedRules = null
    if (payloadValidationRules) {
      const validationResult = validatePayloadRules(payloadValidationRules)
      if (!validationResult.valid) {
        return NextResponse.json(
          { error: `Invalid payload validation rules: ${validationResult.error}` },
          { status: 400 }
        )
      }
      validatedRules = validationResult.sanitized || null
    }

    // Get Supabase admin client
    const supabaseAdmin = getSupabaseAdmin()

    // Get user's workspace
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.userId)
      .limit(1)
      .single()

    // If no workspace exists, create one
    let workspaceId: string
    if (!workspace) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', session.userId)
        .single()

      const { data: newWorkspace, error: workspaceError } = await supabaseAdmin
        .from('workspaces')
        .insert({
          name: `${profile?.email || 'User'}'s Workspace`,
          slug: 'workspace-' + session.userId,
          owner_id: session.userId,
          subscription_tier: 'free',
        })
        .select()
        .single()

      if (workspaceError || !newWorkspace) {
        return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
      }

      // Create workspace member
      await supabaseAdmin
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspace.id,
          user_id: session.userId,
          role: 'owner',
          joined_at: new Date().toISOString(),
        })

      workspaceId = newWorkspace.id
    } else {
      workspaceId = workspace.id
    }

    // Check limits by workspace
    const monitorLimit = await checkMonitorLimitByWorkspace(workspaceId)
    if (!monitorLimit.allowed) {
      return NextResponse.json(
        {
          error: `Monitor limit reached (${monitorLimit.current}/${monitorLimit.limit}). Upgrade your plan to create more monitors.`,
          type: 'monitors',
        },
        { status: 403 }
      )
    }

    const intervalLimit = await checkIntervalLimitByWorkspace(workspaceId, expectedIntervalSeconds)
    if (!intervalLimit.allowed) {
      const minMinutes = intervalLimit.minInterval / 60
      const minSeconds = intervalLimit.minInterval
      const errorMsg = minMinutes >= 1
        ? `Minimum interval for ${intervalLimit.tier} plan is ${minMinutes} minute${minMinutes > 1 ? 's' : ''}. Upgrade to Pro plan for 1-minute intervals or Team plan for 30-second intervals.`
        : `Minimum interval for ${intervalLimit.tier} plan is ${minSeconds} seconds. Upgrade to Team plan for 30-second intervals.`
      
      return NextResponse.json(
        {
          error: errorMsg,
          type: 'interval',
        },
        { status: 403 }
      )
    }

    // Generate unique slug
    let slug = generateSlug()
    let attempts = 0
    const maxAttempts = 10

    // Ensure slug is unique
    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from('monitors')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      // If no row found, slug is available
      if (!existing) {
        break
      }

      slug = generateSlug()
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Failed to generate unique slug. Please try again.' }, { status: 500 })
    }

    // Calculate next expected ping time
    const currentTime = new Date()
    const nextExpectedPing = new Date(
      currentTime.getTime() + expectedIntervalSeconds * 1000 + gracePeriod * 1000
    )

    // Prepare monitor data
    const monitorData: any = {
      user_id: session.userId, // Keep for backward compatibility
      workspace_id: workspaceId,
      name: name.trim(),
      slug,
      expected_interval_seconds: expectedIntervalSeconds,
      grace_period_seconds: gracePeriod,
      payload_validation_rules: validatedRules,
      status: 'pending',
      next_expected_ping_at: nextExpectedPing.toISOString(),
    }

    // Add alert channel overrides if provided
    if (alertChannels) {
      if (alertChannels.alertEmail) {
        monitorData.alert_email = alertChannels.alertEmail
      }
      if (alertChannels.slackWebhookUrl) {
        monitorData.slack_webhook_url = alertChannels.slackWebhookUrl
      }
      if (alertChannels.discordWebhookUrl) {
        monitorData.discord_webhook_url = alertChannels.discordWebhookUrl
      }
      if (alertChannels.customWebhookUrl) {
        monitorData.custom_webhook_url = alertChannels.customWebhookUrl
      }
    }

    // Create monitor using admin client (bypasses RLS)
    const { data: monitor, error: insertError } = await supabaseAdmin
      .from('monitors')
      .insert(monitorData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating monitor:', insertError)
      return NextResponse.json({ error: insertError.message || 'Failed to create monitor' }, { status: 500 })
    }

    return NextResponse.json({ monitor }, { status: 201 })
  } catch (error) {
    console.error('Error in create monitor API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

