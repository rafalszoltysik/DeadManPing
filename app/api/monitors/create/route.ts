import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { checkMonitorLimitByWorkspace, checkIntervalLimitByWorkspace } from '@/lib/limits'
import { validatePayloadRules } from '@/lib/payload-validator'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/api/auth'
import { errorResponse, successResponse, badRequestResponse } from '@/lib/api/response'

function generateSlug(): string {
  return randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const session = authResult.session

    const body = await request.json()
    const { name, expectedIntervalSeconds, gracePeriodSeconds, payloadValidationRules, alertChannels } = body

    // Validate input
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return badRequestResponse('Monitor name is required')
    }

    if (name.trim().length > 100) {
      return badRequestResponse('Monitor name must be 100 characters or less')
    }

    if (!expectedIntervalSeconds || typeof expectedIntervalSeconds !== 'number' || expectedIntervalSeconds < 60) {
      return badRequestResponse('Expected interval must be at least 60 seconds (1 minute)')
    }

    const gracePeriod = gracePeriodSeconds || 3600
    if (gracePeriod < 0) {
      return badRequestResponse('Grace period cannot be negative')
    }

    // Validate and sanitize payload validation rules
    let validatedRules = null
    if (payloadValidationRules) {
      const validationResult = validatePayloadRules(payloadValidationRules)
      if (!validationResult.valid) {
        return badRequestResponse(`Invalid payload validation rules: ${validationResult.error}`)
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
      .single() as { data: { id: string } | null }

    // If no workspace exists, create one
    let workspaceId: string
    if (!workspace) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', session.userId)
        .single() as { data: { email?: string } | null }

      const { data: newWorkspace, error: workspaceError } = await (supabaseAdmin
        .from('workspaces') as any)
        .insert({
          name: `${profile?.email || 'User'}'s Workspace`,
          slug: 'workspace-' + session.userId,
          owner_id: session.userId,
          subscription_tier: 'free',
        })
        .select()
        .single()

      if (workspaceError || !newWorkspace) {
        return errorResponse('Failed to create workspace', 500)
      }

      // Create workspace member
      await (supabaseAdmin
        .from('workspace_members') as any)
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
      return errorResponse(
        `Monitor limit reached (${monitorLimit.current}/${monitorLimit.limit}). Upgrade your plan to create more monitors.`,
        403,
        { type: 'monitors' }
      )
    }

    const intervalLimit = await checkIntervalLimitByWorkspace(workspaceId, expectedIntervalSeconds)
    if (!intervalLimit.allowed) {
      const minMinutes = intervalLimit.minInterval / 60
      const minSeconds = intervalLimit.minInterval
      const errorMsg = minMinutes >= 1
        ? `Minimum interval for ${intervalLimit.tier} plan is ${minMinutes} minute${minMinutes > 1 ? 's' : ''}. Upgrade to Pro or Team plan for 1-minute intervals.`
        : `Minimum interval for ${intervalLimit.tier} plan is ${minSeconds} seconds. Upgrade to Pro or Team plan for 1-minute intervals.`
      
      return errorResponse(errorMsg, 403, { type: 'interval' })
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
      return errorResponse('Failed to generate unique slug. Please try again.', 500)
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
      return errorResponse(insertError.message || 'Failed to create monitor', 500)
    }

    return successResponse({ monitor }, 201)
  } catch (error) {
    console.error('Error in create monitor API:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

