import { NextRequest } from 'next/server'
import { validatePayloadRules } from '@/lib/payload-validator'
import { checkIntervalLimitByWorkspace } from '@/lib/limits'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { requireAuth, verifyOrigin } from '@/lib/api/auth'
import { verifyMonitorAccessBySlug, checkOptimisticLock } from '@/lib/api/monitors'
import { errorResponse, successResponse, conflictResponse, badRequestResponse } from '@/lib/api/response'
import { validateWebhookUrl, validateCustomWebhookUrl } from '@/lib/webhooks-validator'
import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { slug } = await params

    // Verify monitor access
    const accessResult = await verifyMonitorAccessBySlug(slug, authResult.user.id)
    if (!accessResult.success) {
      return accessResult.response
    }

    const monitor = accessResult.monitor
    const supabaseAdmin = getSupabaseAdmin()

    // Get pings
    const { data: pings } = await supabaseAdmin
      .from('pings')
      .select('*')
      .eq('monitor_id', monitor.id)
      .order('received_at', { ascending: false })
      .limit(50)

    return successResponse({ monitor, pings: pings || [] })
  } catch (error) {
    console.error('Error in get monitor API:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // CSRF protection: verify origin
    if (!verifyOrigin(request)) {
      return errorResponse('Invalid origin', 403)
    }

    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { slug } = await params
    
    // Rate limiting: 30 updates per minute per user
    const rateLimitKey = `monitor:update:${authResult.user.id}`
    const rateLimit = await checkRateLimit(rateLimitKey, 60000) // 1 minute
    if (!rateLimit.allowed) {
      return errorResponse(
        'Too many update attempts. Please wait a moment before updating again.',
        429
      )
    }

    const body = await request.json()
    const { name, expectedIntervalSeconds, gracePeriodSeconds, payloadValidationRules, alertChannels, status, expectedUpdatedAt } = body

    // Verify monitor access
    const accessResult = await verifyMonitorAccessBySlug(slug, authResult.user.id)
    if (!accessResult.success) {
      return accessResult.response
    }

    const monitor = accessResult.monitor
    const supabaseAdmin = getSupabaseAdmin()

    // Build update object
    const updateData: any = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return badRequestResponse('Monitor name cannot be empty')
      }
      if (name.trim().length > 100) {
        return badRequestResponse('Monitor name must be 100 characters or less')
      }
      updateData.name = name.trim()
    }

    if (expectedIntervalSeconds !== undefined) {
      if (typeof expectedIntervalSeconds !== 'number' || expectedIntervalSeconds < 60) {
        return badRequestResponse('Expected interval must be at least 60 seconds (1 minute)')
      }

      // Check interval limit by workspace
      if (monitor.workspace_id) {
        const intervalLimit = await checkIntervalLimitByWorkspace(monitor.workspace_id, expectedIntervalSeconds)
        if (!intervalLimit.allowed) {
          const minMinutes = intervalLimit.minInterval / 60
          const minSeconds = intervalLimit.minInterval
          const errorMsg = minMinutes >= 1
            ? `Minimum interval for ${intervalLimit.tier} plan is ${minMinutes} minute${minMinutes > 1 ? 's' : ''}. Upgrade to Pro or Team plan for 1-minute intervals.`
            : `Minimum interval for ${intervalLimit.tier} plan is ${minSeconds} seconds. Upgrade to Pro or Team plan for 1-minute intervals.`
          
          return errorResponse(errorMsg, 403, { type: 'interval' })
        }
      }

      updateData.expected_interval_seconds = expectedIntervalSeconds
    }

    if (gracePeriodSeconds !== undefined) {
      if (typeof gracePeriodSeconds !== 'number' || gracePeriodSeconds < 0) {
        return badRequestResponse('Grace period cannot be negative')
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
          return badRequestResponse(`Invalid payload validation rules: ${validationResult.error}`)
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
          const slackUrl = alertChannels.slackWebhookUrl || null
          if (slackUrl) {
            const slackValidation = validateWebhookUrl(slackUrl, 'slack')
            if (!slackValidation.valid) {
              return badRequestResponse(`Invalid Slack webhook URL: ${slackValidation.error}`)
            }
          }
          updateData.slack_webhook_url = slackUrl
        }
        if (alertChannels.discordWebhookUrl !== undefined) {
          const discordUrl = alertChannels.discordWebhookUrl || null
          if (discordUrl) {
            const discordValidation = validateWebhookUrl(discordUrl, 'discord')
            if (!discordValidation.valid) {
              return badRequestResponse(`Invalid Discord webhook URL: ${discordValidation.error}`)
            }
          }
          updateData.discord_webhook_url = discordUrl
        }
        if (alertChannels.customWebhookUrl !== undefined) {
          const customUrl = alertChannels.customWebhookUrl || null
          if (customUrl) {
            const customValidation = validateCustomWebhookUrl(customUrl)
            if (!customValidation.valid) {
              return badRequestResponse(`Invalid custom webhook URL: ${customValidation.error}`)
            }
          }
          updateData.custom_webhook_url = customUrl
        }
      }
    }

    // Optimistic locking: check if monitor was modified since we fetched it
    const lockResult = await checkOptimisticLock(monitor.id, expectedUpdatedAt)
    if (lockResult.conflict) {
      return conflictResponse(
        'Monitor was modified by another process. Please refresh and try again.',
        lockResult.latestMonitor
      )
    }

    // Update monitor with new updated_at timestamp
    updateData.updated_at = new Date().toISOString()
    
    const { data: updatedMonitor, error: updateError } = await (supabaseAdmin
      .from('monitors') as any)
      .update(updateData)
      .eq('id', monitor.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating monitor:', updateError)
      return errorResponse(updateError.message || 'Failed to update monitor', 500)
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
      } as any)

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

    return successResponse({ monitor: updatedMonitor })
  } catch (error) {
    console.error('Error in update monitor API:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // CSRF protection: verify origin
    if (!verifyOrigin(request)) {
      return errorResponse('Invalid origin', 403)
    }

    const authResult = await requireAuth()
    if (!authResult.success) {
      return authResult.response
    }

    const { slug } = await params

    // Verify monitor access
    const accessResult = await verifyMonitorAccessBySlug(slug, authResult.user.id)
    if (!accessResult.success) {
      return accessResult.response
    }

    const monitor = accessResult.monitor
    const supabaseAdmin = getSupabaseAdmin()

    // Delete monitor (cascade will delete pings and alerts)
    const { error: deleteError } = await supabaseAdmin
      .from('monitors')
      .delete()
      .eq('id', monitor.id)

    if (deleteError) {
      console.error('Error deleting monitor:', deleteError)
      return errorResponse(deleteError.message || 'Failed to delete monitor', 500)
    }

    return successResponse({ success: true })
  } catch (error) {
    console.error('Error in delete monitor API:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

