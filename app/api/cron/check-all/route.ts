/**
 * Combined cron job endpoint for Vercel Hobby plan (single cron job limit).
 * 
 * Executes two maintenance tasks: always checks monitor timeouts (every minute),
 * and checks trial expiry once per day at midnight. Designed to work within
 * Vercel Hobby plan's single cron job constraint.
 * Integrates with Supabase for data updates and internal alert API for notifications.
 * 
 * Does not handle ping processing - only status updates and trial management.
 */

import { NextRequest } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/api/auth'
import { shouldMarkAsLate, shouldMarkAsFailed } from '@/lib/monitor-utils'
import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api/response'
import { compareSecrets } from '@/lib/security'
/**
 * Executes combined cron maintenance tasks for monitor timeouts and trial expiry.
 * 
 * Always checks for late/failed monitors and updates their status. At midnight,
 * also expires trials, sets grace periods, and blocks excess monitors.
 * Side effects: DB writes (monitors, profiles, workspaces, pings), async alert triggers.
 * 
 * @param request - HTTP request with Authorization header containing CRON_SECRET
 * @returns Response with execution results for both tasks
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  
  if (!verifyCronSecret(authHeader)) {
    return unauthorizedResponse()
  }

  const now = new Date()
  const nowISO = now.toISOString()
  const supabaseAdmin = getSupabaseAdmin()

  // Check if it's midnight (00:00) - run trial expiry check
  const isMidnight = now.getHours() === 0 && now.getMinutes() === 0

  const results: any = {
    timeouts: null,
    trialExpiry: null,
  }

  // ==========================================
  // PART 1: Always check monitor timeouts (critical)
  // ==========================================
  try {
    // Get all active monitors (exclude paused, but include late to check if they should become failed)
    const { data: allMonitors, error: fetchError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .neq('status', 'paused') as { data: any[] | null; error: any }

    if (fetchError) {
      console.error('Error fetching monitors:', fetchError)
      results.timeouts = { error: 'Failed to fetch monitors' }
    } else if (!allMonitors || allMonitors.length === 0) {
      results.timeouts = { checked: 0, updated: 0 }
    } else {
      // Check each monitor to see if it's overdue
      const lateMonitors = allMonitors.filter((monitor) => shouldMarkAsLate(monitor, now))
      const failedMonitors = allMonitors.filter((monitor) => shouldMarkAsFailed(monitor, now))

      let updatedCount = 0

      // Update monitors to 'late' status
      for (const monitor of lateMonitors) {
        const { error: updateError } = await (supabaseAdmin
          .from('monitors') as any)
          .update({ status: 'late', updated_at: nowISO })
          .eq('id', monitor.id)

        if (updateError) {
          console.error(`Error updating monitor ${monitor.id}:`, updateError)
          continue
        }

        updatedCount++

        // Insert ping record for late status
        const { error: pingError } = await supabaseAdmin.from('pings').insert({
          monitor_id: monitor.id,
          status: 'fail',
          message: 'Monitor is late - ping not received within expected interval',
          duration_ms: null,
          metadata: null,
          received_at: nowISO,
        } as any)

        if (pingError) {
          console.error(`Error inserting ping for monitor ${monitor.id}:`, pingError)
        }

        // Trigger alert (warn for late status)
        try {
          await fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
            },
            body: JSON.stringify({
              monitor_id: monitor.id,
              alert_type: 'warn',
            }),
          })
        } catch (alertError) {
          console.error(`Error triggering alert for monitor ${monitor.id}:`, alertError)
        }
      }

      // Update monitors to 'failed' status
      for (const monitor of failedMonitors) {
        const { error: updateError } = await (supabaseAdmin
          .from('monitors') as any)
          .update({ status: 'failed', updated_at: nowISO })
          .eq('id', monitor.id)

        if (updateError) {
          console.error(`Error updating monitor ${monitor.id}:`, updateError)
          continue
        }

        updatedCount++

        // Insert ping record for failed status
        const { error: pingError } = await supabaseAdmin.from('pings').insert({
          monitor_id: monitor.id,
          status: 'fail',
          message: 'Monitor failed - ping not received within grace period',
          duration_ms: null,
          metadata: null,
          received_at: nowISO,
        } as any)

        if (pingError) {
          console.error(`Error inserting ping for monitor ${monitor.id}:`, pingError)
        }

        // Trigger alert
        try {
          await fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
            },
            body: JSON.stringify({
              monitor_id: monitor.id,
              alert_type: 'missing',
            }),
          })
        } catch (alertError) {
          console.error(`Error triggering alert for monitor ${monitor.id}:`, alertError)
        }
      }

      results.timeouts = {
        checked: allMonitors.length,
        updated: updatedCount,
        late: lateMonitors.length,
        failed: failedMonitors.length,
      }
    }
  } catch (error: any) {
    console.error('Error in check-timeouts:', error)
    results.timeouts = { error: error.message }
  }

  // ==========================================
  // PART 2: Check trial expiry only at midnight (once per day)
  // ==========================================
  if (isMidnight) {
    try {
      const fourteenDaysAgo = new Date(now)
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      
      // Grace period is 7 days
      const gracePeriodEndsAt = new Date(now)
      gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7)

      // PART 2.1: Expire trials and set grace period
      const { data: expiredTrials, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, created_at, stripe_customer_id, grace_period_ends_at')
        .eq('subscription_status', 'trialing')
        .eq('subscription_tier', 'free')
        .lt('created_at', fourteenDaysAgo.toISOString()) as { 
          data: Array<{
            id: string
            created_at: string
            stripe_customer_id: string | null
            grace_period_ends_at: string | null
          }> | null
          error: any
        }

      if (fetchError) {
        console.error('Error fetching expired trials:', fetchError)
        results.trialExpiry = { error: 'Failed to fetch expired trials' }
      } else {
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
            const { error: updateError } = await (supabaseAdmin
              .from('profiles') as any)
              .update({
                subscription_status: 'free',
                grace_period_ends_at: gracePeriodEndsAt.toISOString(),
                updated_at: nowISO,
              })
              .in('id', userIdsToExpire)

            if (updateError) {
              console.error('Error updating expired trials:', updateError)
              results.trialExpiry = { error: 'Failed to update expired trials', details: updateError }
            } else {
              expiredCount = userIdsToExpire.length

              // Also update workspaces
              await (supabaseAdmin
                .from('workspaces') as any)
                .update({
                  subscription_status: 'free',
                  grace_period_ends_at: gracePeriodEndsAt.toISOString(),
                  updated_at: nowISO,
                })
                .in('owner_id', userIdsToExpire)

              // Clean up webhooks for expired trials (Slack/Discord are not available on free tier)
              await (supabaseAdmin
                .from('profiles') as any)
                .update({
                  slack_webhook_url: null,
                  discord_webhook_url: null,
                  custom_webhook_url: null,
                  updated_at: nowISO,
                })
                .in('id', userIdsToExpire)

              // Update monitor intervals if they're below free tier minimum (5 minutes = 300s)
              const { data: workspaces } = await supabaseAdmin
                .from('workspaces')
                .select('id')
                .in('owner_id', userIdsToExpire) as { data: Array<{ id: string }> | null }

              if (workspaces && workspaces.length > 0) {
                const workspaceIds = workspaces.map(w => w.id)
                const freeMinInterval = 300 // 5 minutes

                // Find monitors with intervals below free tier minimum
                const { data: monitorsToUpdate } = await supabaseAdmin
                  .from('monitors')
                  .select('id, grace_period_seconds')
                  .in('workspace_id', workspaceIds)
                  .lt('expected_interval_seconds', freeMinInterval) as {
                    data: Array<{ id: string; grace_period_seconds: number | null }> | null
                  }

                if (monitorsToUpdate && monitorsToUpdate.length > 0) {
                  const currentTime = new Date()
                  
                  for (const monitor of monitorsToUpdate) {
                    const gracePeriod = monitor.grace_period_seconds || 3600
                    const nextExpectedPing = new Date(
                      currentTime.getTime() + freeMinInterval * 1000 + gracePeriod * 1000
                    )

                    await (supabaseAdmin
                      .from('monitors') as any)
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
        }

        // PART 2.2: Check grace period expiry and block monitors
        const { data: expiredGracePeriods, error: gracePeriodError } = await supabaseAdmin
          .from('workspaces')
          .select('id, owner_id, subscription_tier, grace_period_ends_at')
          .not('grace_period_ends_at', 'is', null)
          .lte('grace_period_ends_at', nowISO)
          .eq('subscription_status', 'free')
          .eq('subscription_tier', 'free') as {
            data: Array<{
              id: string
              owner_id: string
              subscription_tier: string
              grace_period_ends_at: string
            }> | null
            error: any
          }

        if (gracePeriodError) {
          console.error('Error fetching expired grace periods:', gracePeriodError)
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
              .order('created_at', { ascending: true }) as {
                data: Array<{ id: string; created_at: string }> | null
                error: any
              }

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
              const { error: blockError } = await (supabaseAdmin
                .from('monitors') as any)
                .update({
                  status: 'paused',
                  updated_at: nowISO,
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

        results.trialExpiry = {
          checked: expiredTrials?.length || 0,
          expired: expiredCount,
          gracePeriodsChecked: expiredGracePeriods?.length || 0,
          monitorsBlocked: blockedMonitorsCount,
          message: `Expired ${expiredCount} trial(s), blocked ${blockedMonitorsCount} monitor(s)`,
        }
      }
    } catch (error: any) {
      console.error('Error in check-trial-expiry:', error)
      results.trialExpiry = { error: error.message }
    }
  } else {
    results.trialExpiry = { skipped: 'Not midnight, will run at 00:00' }
  }

  return successResponse(results)
}

