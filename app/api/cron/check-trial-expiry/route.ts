import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { compareSecrets } from '@/lib/security'

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

/**
 * Cron job to check and expire trial periods and grace periods
 * 
 * This endpoint should be called daily (e.g., via Vercel Cron Jobs)
 * to automatically:
 * 1. Expire trial periods after 14 days (set grace_period_ends_at to 7 days from now)
 * 2. Block oldest monitors after grace period ends
 * 
 * Usage:
 * GET /api/cron/check-trial-expiry
 * Headers: Authorization: Bearer {CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  // Verify cron secret using timing-safe comparison
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (!authHeader || !compareSecrets(authHeader, expectedAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    
    // Grace period is 7 days
    const gracePeriodEndsAt = new Date(now)
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7)

    // ==========================================
    // PART 1: Expire trials and set grace period
    // ==========================================
    const { data: expiredTrials, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, created_at, stripe_customer_id, grace_period_ends_at')
      .eq('subscription_status', 'trialing')
      .eq('subscription_tier', 'free')
      .lt('created_at', fourteenDaysAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching expired trials:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch expired trials' }, { status: 500 })
    }

    let expiredCount = 0
    const userIdsToExpire: string[] = []

    if (expiredTrials && expiredTrials.length > 0) {
      for (const profile of expiredTrials) {
        // Skip if grace period already set (already processed)
        if (profile.grace_period_ends_at) {
          continue
        }
        
        // If user has stripe_customer_id, check if they have active subscription
        if (profile.stripe_customer_id) {
          // We'll assume if they have customer_id but still trialing, they haven't paid
          // The webhook should have updated this, but we'll expire it anyway
          userIdsToExpire.push(profile.id)
        } else {
          // No Stripe customer = definitely expired trial
          userIdsToExpire.push(profile.id)
        }
      }

      // Update expired trials to 'free' status and set grace period
      if (userIdsToExpire.length > 0) {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'free',
            grace_period_ends_at: gracePeriodEndsAt.toISOString(),
            updated_at: now.toISOString(),
          })
          .in('id', userIdsToExpire)

        if (updateError) {
          console.error('Error updating expired trials:', updateError)
          return NextResponse.json(
            { error: 'Failed to update expired trials', details: updateError },
            { status: 500 }
          )
        }

        expiredCount = userIdsToExpire.length

        // Also update workspaces
        await supabaseAdmin
          .from('workspaces')
          .update({
            subscription_status: 'free',
            grace_period_ends_at: gracePeriodEndsAt.toISOString(),
            updated_at: now.toISOString(),
          })
          .in('owner_id', userIdsToExpire)

        // Clean up webhooks for expired trials (Slack/Discord are not available on free tier)
        await supabaseAdmin
          .from('profiles')
          .update({
            slack_webhook_url: null,
            discord_webhook_url: null,
            custom_webhook_url: null,
            updated_at: now.toISOString(),
          })
          .in('id', userIdsToExpire)

        // Update monitor intervals if they're below free tier minimum (5 minutes = 300s)
        const { data: workspaces } = await supabaseAdmin
          .from('workspaces')
          .select('id')
          .in('owner_id', userIdsToExpire)

        if (workspaces && workspaces.length > 0) {
          const workspaceIds = workspaces.map(w => w.id)
          const freeMinInterval = 300 // 5 minutes

          // Find monitors with intervals below free tier minimum
          const { data: monitorsToUpdate } = await supabaseAdmin
            .from('monitors')
            .select('id, grace_period_seconds')
            .in('workspace_id', workspaceIds)
            .lt('expected_interval_seconds', freeMinInterval)

          if (monitorsToUpdate && monitorsToUpdate.length > 0) {
            const currentTime = new Date()
            
            for (const monitor of monitorsToUpdate) {
              const gracePeriod = monitor.grace_period_seconds || 3600
              const nextExpectedPing = new Date(
                currentTime.getTime() + freeMinInterval * 1000 + gracePeriod * 1000
              )

              await supabaseAdmin
                .from('monitors')
                .update({
                  expected_interval_seconds: freeMinInterval,
                  next_expected_ping_at: nextExpectedPing.toISOString(),
                  updated_at: currentTime.toISOString(),
                })
                .eq('id', monitor.id)
            }
          }
        }
      }
    }

    // ==========================================
    // PART 2: Check grace period expiry and block monitors
    // ==========================================
    // Find workspaces where grace period has ended
    const { data: expiredGracePeriods, error: gracePeriodError } = await supabaseAdmin
      .from('workspaces')
      .select('id, owner_id, subscription_tier, grace_period_ends_at')
      .not('grace_period_ends_at', 'is', null)
      .lte('grace_period_ends_at', now.toISOString())
      .eq('subscription_status', 'free')
      .eq('subscription_tier', 'free')

    if (gracePeriodError) {
      console.error('Error fetching expired grace periods:', gracePeriodError)
      // Don't fail the whole request, just log the error
    }

    let blockedMonitorsCount = 0
    const { TIER_LIMITS } = await import('@/lib/limits')
    const freeLimit = TIER_LIMITS.free.monitors

    if (expiredGracePeriods && expiredGracePeriods.length > 0) {
      for (const workspace of expiredGracePeriods) {
        // Get all monitors for this workspace (excluding already paused ones)
        const { data: monitors, error: monitorsError } = await supabaseAdmin
          .from('monitors')
          .select('id, created_at')
          .eq('workspace_id', workspace.id)
          .neq('status', 'paused')
          .order('created_at', { ascending: true }) // Oldest first

        if (monitorsError) {
          console.error(`Error fetching monitors for workspace ${workspace.id}:`, monitorsError)
          continue
        }

        if (!monitors || monitors.length <= freeLimit) {
          // Within limit, no need to block
          continue
        }

        // Block oldest monitors that exceed the limit
        const monitorsToBlock = monitors.slice(0, monitors.length - freeLimit)
        const monitorIdsToBlock = monitorsToBlock.map(m => m.id)

        if (monitorIdsToBlock.length > 0) {
          const { error: blockError } = await supabaseAdmin
            .from('monitors')
            .update({
              status: 'paused',
              updated_at: now.toISOString(),
            })
            .in('id', monitorIdsToBlock)

          if (blockError) {
            console.error(`Error blocking monitors for workspace ${workspace.id}:`, blockError)
          } else {
            blockedMonitorsCount += monitorIdsToBlock.length
            console.log(`Blocked ${monitorIdsToBlock.length} monitors for workspace ${workspace.id}`)
          }
        }
      }
    }

    return NextResponse.json({
      checked: expiredTrials?.length || 0,
      expired: expiredCount,
      gracePeriodsChecked: expiredGracePeriods?.length || 0,
      monitorsBlocked: blockedMonitorsCount,
      message: `Expired ${expiredCount} trial(s), blocked ${blockedMonitorsCount} monitor(s)`,
    })
  } catch (error: any) {
    console.error('Error in check-trial-expiry:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

