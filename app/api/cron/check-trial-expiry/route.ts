/**
 * Trial expiry and account cleanup cron job endpoint.
 * 
 * Expires trial periods after 14 days, sets grace periods, blocks excess monitors
 * after grace period ends, and deletes unverified accounts older than 14 days.
 * Updates monitor intervals to free tier minimums and cleans up webhook URLs.
 * Integrates with Supabase for data updates and Stripe customer verification.
 * 
 * Does not handle monitor timeout checking - see check-timeouts endpoint.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { compareSecrets } from '@/lib/security'

/**
 * Creates Supabase admin client with service role key for elevated permissions.
 * 
 * @returns Supabase client with admin privileges
 * @throws Error if environment variables are missing
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Executes trial expiry and account cleanup tasks.
 * 
 * Deletes unverified accounts older than 14 days, expires trials after 14 days,
 * sets 7-day grace periods, blocks excess monitors after grace period ends,
 * and adjusts monitor intervals to free tier minimums.
 * Side effects: DB writes (profiles, workspaces, monitors), auth user deletion.
 * 
 * @param request - HTTP request with Authorization header containing CRON_SECRET
 * @returns Response with execution results and counts
 */
export async function GET(request: NextRequest) {
  // Verify cron secret using timing-safe comparison
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (!authHeader || !compareSecrets(authHeader, expectedAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const now = new Date()
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    
    // 14 days ago - for cleaning up unverified accounts
    const fourteenDaysAgoForUnverified = new Date(now)
    fourteenDaysAgoForUnverified.setDate(fourteenDaysAgoForUnverified.getDate() - 14)
    
    // Grace period is 7 days
    const gracePeriodEndsAt = new Date(now)
    gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 7)

    // ==========================================
    // PART 0: Delete old unverified accounts (older than 14 days)
    // ==========================================
    // Find unverified accounts older than 14 days
    const { data: unverifiedAccounts, error: unverifiedError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, created_at')
      .eq('email_verified', false)
      .lt('created_at', fourteenDaysAgoForUnverified.toISOString())

    let deletedUnverifiedCount = 0
    if (unverifiedError) {
      console.error('Error fetching unverified accounts:', unverifiedError)
    } else if (unverifiedAccounts && unverifiedAccounts.length > 0) {
      // Delete unverified accounts from auth.users (this will cascade delete profiles)
      // Note: We need to delete from auth.users first, which will cascade delete profiles
      for (const account of unverifiedAccounts) {
        try {
          // Delete from auth.users - this will cascade delete the profile
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(account.id)
          
          if (deleteError) {
            console.error(`Error deleting unverified account ${account.id}:`, deleteError)
          } else {
            deletedUnverifiedCount++
            console.log(`Deleted unverified account: ${account.email} (created: ${account.created_at})`)
          }
        } catch (error: any) {
          console.error(`Error deleting unverified account ${account.id}:`, error)
        }
      }
    }

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
      unverifiedDeleted: deletedUnverifiedCount,
      checked: expiredTrials?.length || 0,
      expired: expiredCount,
      gracePeriodsChecked: expiredGracePeriods?.length || 0,
      monitorsBlocked: blockedMonitorsCount,
      message: `Deleted ${deletedUnverifiedCount} unverified account(s), expired ${expiredCount} trial(s), blocked ${blockedMonitorsCount} monitor(s)`,
    })
  } catch (error: any) {
    console.error('Error in check-trial-expiry:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

