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

export async function GET(
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

    // Get pings
    const { data: pings } = await supabaseAdmin
      .from('pings')
      .select('*')
      .eq('monitor_id', monitor.id)
      .order('received_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ monitor, pings: pings || [] }, { status: 200 })
  } catch (error) {
    console.error('Error in get monitor API:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { name, expectedIntervalSeconds, gracePeriodSeconds, payloadValidationRules, alertChannels, status } = body

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

    // Handle status update (only allow setting to 'late' or 'failed' for timeout checks)
    let shouldInsertPing = false
    let pingMessage = ''
    if (status !== undefined) {
      if ((status === 'late' || status === 'failed') && 
          (monitor.status === 'healthy' || monitor.status === 'pending' || 
           (status === 'failed' && monitor.status === 'late'))) {
        updateData.status = status
        // Track if we need to insert a ping record and send alert
        if (monitor.status !== status) {
          shouldInsertPing = true
          if (status === 'late') {
            pingMessage = 'Monitor is late - ping not received within expected interval'
          } else if (status === 'failed') {
            pingMessage = 'Monitor failed - ping not received within grace period'
          }
        }
      }
      // Don't allow other status changes through this endpoint
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

    // Optimistic locking: check if monitor was modified since we fetched it
    // This prevents overwriting concurrent changes
    const { data: currentMonitor } = await supabaseAdmin
      .from('monitors')
      .select('updated_at')
      .eq('id', monitor.id)
      .single()

    if (currentMonitor && body.expectedUpdatedAt) {
      // Client sent expected updated_at timestamp
      const expectedTime = new Date(body.expectedUpdatedAt).getTime()
      const currentTime = new Date(currentMonitor.updated_at).getTime()
      
      if (Math.abs(currentTime - expectedTime) > 1000) {
        // Monitor was updated by someone else (more than 1 second difference)
        // Fetch latest version and return conflict
        const { data: latestMonitor } = await supabaseAdmin
          .from('monitors')
          .select('*')
          .eq('id', monitor.id)
          .single()
        
        return NextResponse.json(
          { 
            error: 'Monitor was modified by another process. Please refresh and try again.',
            conflict: true,
            latestMonitor 
          },
          { status: 409 }
        )
      }
    }

    // Update monitor with new updated_at timestamp
    updateData.updated_at = new Date().toISOString()
    
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

    // Insert ping record and trigger alert if status changed to late or failed
    if (shouldInsertPing && updatedMonitor) {
      const nowISO = new Date().toISOString()
      const { error: pingError } = await supabaseAdmin.from('pings').insert({
        monitor_id: updatedMonitor.id,
        status: 'fail',
        message: pingMessage,
        duration_ms: null,
        metadata: null,
        received_at: nowISO,
      })

      if (pingError) {
        console.error(`Error inserting ping for monitor ${updatedMonitor.id}:`, pingError)
        // Don't fail the request if ping insert fails
      }

      // Trigger alert asynchronously (don't await to avoid blocking the response)
      try {
        const internalSecret = process.env.INTERNAL_API_SECRET || ''
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || 'http://localhost:3000'
        if (internalSecret && updatedMonitor.status) {
          // Determine alert type based on status
          let alertType: 'warn' | 'missing' = 'missing'
          if (updatedMonitor.status === 'late') {
            alertType = 'warn'
          } else if (updatedMonitor.status === 'failed') {
            alertType = 'missing'
          }

          fetch(`${appUrl}/api/internal/send-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': internalSecret,
            },
            body: JSON.stringify({
              monitor_id: updatedMonitor.id,
              alert_type: alertType,
            }),
          }).catch(alertError => {
            console.error(`Error triggering alert for monitor ${updatedMonitor.id}:`, alertError)
          })
        }
      } catch (alertError) {
        console.error(`Error triggering alert for monitor ${updatedMonitor.id}:`, alertError)
      }
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

