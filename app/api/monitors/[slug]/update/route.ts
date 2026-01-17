import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'
import { validatePayloadRules } from '@/lib/payload-validator'
import { checkIntervalLimitByWorkspace } from '@/lib/limits'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const body = await request.json()
    const { name, expectedIntervalSeconds, gracePeriodSeconds, payloadValidationRules, alertChannels } = body

    // Find monitor by slug and verify ownership
    const { data: monitor, error: monitorError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .eq('slug', slug)
      .single()

    if (monitorError || !monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    // Verify workspace membership
    if (monitor.workspace_id) {
      const { data: member } = await supabaseAdmin
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', monitor.workspace_id)
        .eq('user_id', session.userId)
        .single()

      if (!member) {
        // Check if user is workspace owner
        const { data: workspace } = await supabaseAdmin
          .from('workspaces')
          .select('owner_id')
          .eq('id', monitor.workspace_id)
          .single()

        if (!workspace || workspace.owner_id !== session.userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
      }
    } else {
      // Legacy: check user_id directly
      if (monitor.user_id !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Build update object
    const updateData: any = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'Monitor name cannot be empty' }, { status: 400 })
      }
      if (name.trim().length > 100) {
        return NextResponse.json({ error: 'Monitor name must be 100 characters or less' }, { status: 400 })
      }
      updateData.name = name.trim()
    }

    if (expectedIntervalSeconds !== undefined) {
      if (typeof expectedIntervalSeconds !== 'number' || expectedIntervalSeconds < 30) {
        return NextResponse.json({ error: 'Expected interval must be at least 30 seconds' }, { status: 400 })
      }

      // Check interval limit by workspace
      if (monitor.workspace_id) {
        const intervalLimit = await checkIntervalLimitByWorkspace(monitor.workspace_id, expectedIntervalSeconds)
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
      }

      updateData.expected_interval_seconds = expectedIntervalSeconds
    }

    if (gracePeriodSeconds !== undefined) {
      if (typeof gracePeriodSeconds !== 'number' || gracePeriodSeconds < 0) {
        return NextResponse.json({ error: 'Grace period cannot be negative' }, { status: 400 })
      }
      updateData.grace_period_seconds = gracePeriodSeconds
    }

    // Validate and sanitize payload validation rules
    if (payloadValidationRules !== undefined) {
      if (payloadValidationRules === null) {
        updateData.payload_validation_rules = null
      } else {
        const validationResult = validatePayloadRules(payloadValidationRules)
        if (!validationResult.valid) {
          return NextResponse.json(
            { error: `Invalid payload validation rules: ${validationResult.error}` },
            { status: 400 }
          )
        }
        updateData.payload_validation_rules = validationResult.sanitized || null
      }
    }

    // Handle alert channel overrides
    if (alertChannels !== undefined) {
      if (alertChannels === null) {
        // Clear all overrides
        updateData.alert_email = null
        updateData.slack_webhook_url = null
        updateData.discord_webhook_url = null
        updateData.custom_webhook_url = null
      } else {
        // Update only provided channels
        if (alertChannels.alertEmail !== undefined) {
          updateData.alert_email = alertChannels.alertEmail || null
        }
        if (alertChannels.slackWebhookUrl !== undefined) {
          updateData.slack_webhook_url = alertChannels.slackWebhookUrl || null
        }
        if (alertChannels.discordWebhookUrl !== undefined) {
          updateData.discord_webhook_url = alertChannels.discordWebhookUrl || null
        }
        if (alertChannels.customWebhookUrl !== undefined) {
          updateData.custom_webhook_url = alertChannels.customWebhookUrl || null
        }
      }
    }

    // Update monitor
    const { data: updatedMonitor, error: updateError } = await supabaseAdmin
      .from('monitors')
      .update(updateData)
      .eq('id', monitor.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating monitor:', updateError)
      return NextResponse.json({ error: updateError.message || 'Failed to update monitor' }, { status: 500 })
    }

    return NextResponse.json({ monitor: updatedMonitor }, { status: 200 })
  } catch (error) {
    console.error('Error in update monitor API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verify session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params

    // Find monitor by slug and verify ownership
    const { data: monitor, error: monitorError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .eq('slug', slug)
      .single()

    if (monitorError || !monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 })
    }

    // Verify workspace membership
    if (monitor.workspace_id) {
      const { data: member } = await supabaseAdmin
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', monitor.workspace_id)
        .eq('user_id', session.userId)
        .single()

      if (!member) {
        // Check if user is workspace owner
        const { data: workspace } = await supabaseAdmin
          .from('workspaces')
          .select('owner_id')
          .eq('id', monitor.workspace_id)
          .single()

        if (!workspace || workspace.owner_id !== session.userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
      }
    } else {
      // Legacy: check user_id directly
      if (monitor.user_id !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // Delete monitor (cascade will delete pings and alerts)
    const { error: deleteError } = await supabaseAdmin
      .from('monitors')
      .delete()
      .eq('id', monitor.id)

    if (deleteError) {
      console.error('Error deleting monitor:', deleteError)
      return NextResponse.json({ error: deleteError.message || 'Failed to delete monitor' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error in delete monitor API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

