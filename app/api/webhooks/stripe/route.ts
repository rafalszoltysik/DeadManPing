import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_PLANS, LEGACY_PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { TIER_LIMITS } from '@/lib/limits'
import Stripe from 'stripe'

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

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  try {
    console.log(`[Webhook] Received event: ${event.type}`)
    
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const workspaceId = session.metadata?.workspaceId
        const userId = session.metadata?.userId // Legacy support

        console.log(`[Webhook] Checkout session completed:`, {
          sessionId: session.id,
          workspaceId,
          userId,
          customerId: session.customer,
          subscriptionId: session.subscription,
        })

        // Get subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Determine tier from price
        const priceId = subscription.items.data[0]?.price.id
        let tier = 'free'
        
        console.log(`[Webhook] Price ID from subscription: ${priceId}`)
        console.log(`[Webhook] Environment Price IDs:`, {
          STARTER: process.env.STRIPE_PRICE_ID_STARTER,
          PRO: process.env.STRIPE_PRICE_ID_PRO,
          TEAM: process.env.STRIPE_PRICE_ID_TEAM,
          SOLO: process.env.STRIPE_PRICE_ID_SOLO,
          AGENCY: process.env.STRIPE_PRICE_ID_AGENCY,
        })
        
        // New pricing plans
        if (priceId === process.env.STRIPE_PRICE_ID_STARTER) {
          tier = 'starter'
        } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          tier = 'pro'
        } else if (priceId === process.env.STRIPE_PRICE_ID_TEAM) {
          tier = 'team'
        }
        // Legacy support
        else if (priceId === process.env.STRIPE_PRICE_ID_SOLO) {
          tier = 'starter'
        } else if (priceId === process.env.STRIPE_PRICE_ID_AGENCY) {
          tier = 'pro'
        }

        console.log(`[Webhook] Determined tier: ${tier}`)

        // Update workspace if workspaceId provided
        if (workspaceId) {
          console.log(`[Webhook] Updating workspace: ${workspaceId}`)
          
          // Get old tier before update
          const { data: oldWorkspace } = await supabaseAdmin
            .from('workspaces')
            .select('subscription_tier')
            .eq('id', workspaceId)
            .single()

          const oldTier = oldWorkspace?.subscription_tier || 'free'
          console.log(`[Webhook] Old tier: ${oldTier}, New tier: ${tier}`)

          const { data: updatedWorkspace, error: updateError } = await supabaseAdmin
            .from('workspaces')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_tier: tier,
              subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
              max_members: tier === 'team' ? 10 : tier === 'pro' ? 3 : 1,
              updated_at: new Date().toISOString(),
            })
            .eq('id', workspaceId)
            .select()
            .single()

          if (updateError) {
            console.error(`[Webhook] Error updating workspace:`, updateError)
          } else {
            console.log(`[Webhook] Workspace updated successfully:`, updatedWorkspace)
          }

            // Auto-update monitor intervals if tier changed and new minimum is higher
            if (oldTier !== tier) {
              const newLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
              const oldLimit = TIER_LIMITS[oldTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free

              // If new minimum is higher, update monitors below minimum
              if (newLimit.minInterval > oldLimit.minInterval) {
                // Get monitors that need updating
                const { data: monitorsToUpdate } = await supabaseAdmin
                  .from('monitors')
                  .select('id, grace_period_seconds')
                  .eq('workspace_id', workspaceId)
                  .lt('expected_interval_seconds', newLimit.minInterval)

                if (monitorsToUpdate && monitorsToUpdate.length > 0) {
                  const currentTime = new Date()
                  
                  // Update each monitor with new interval and recalculate next_expected_ping_at
                  for (const monitor of monitorsToUpdate) {
                    const gracePeriod = monitor.grace_period_seconds || 3600
                    const nextExpectedPing = new Date(
                      currentTime.getTime() + newLimit.minInterval * 1000 + gracePeriod * 1000
                    )

                    await supabaseAdmin
                      .from('monitors')
                      .update({
                        expected_interval_seconds: newLimit.minInterval,
                        next_expected_ping_at: nextExpectedPing.toISOString(),
                        updated_at: currentTime.toISOString(),
                      })
                      .eq('id', monitor.id)
                  }
                }
              }
            }

          // Also update owner's profile for backward compatibility
          const { data: workspace } = await supabaseAdmin
            .from('workspaces')
            .select('owner_id')
            .eq('id', workspaceId)
            .single()

          if (workspace) {
            await supabaseAdmin
              .from('profiles')
              .update({
                stripe_customer_id: session.customer as string,
                subscription_tier: tier,
                subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.owner_id)
          }
        }
        // Legacy: update profile directly if only userId provided
        else if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              stripe_customer_id: session.customer as string,
              subscription_tier: tier,
              subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)

          // Create or update workspace for this user
          const { data: existingWorkspace } = await supabaseAdmin
            .from('workspaces')
            .select('id, subscription_tier')
            .eq('owner_id', userId)
            .limit(1)
            .single()

          if (existingWorkspace) {
            const oldTier = existingWorkspace.subscription_tier || 'free'

            await supabaseAdmin
              .from('workspaces')
              .update({
                stripe_customer_id: session.customer as string,
                subscription_tier: tier,
                subscription_status: subscription.status === 'active' ? 'active' : 'trialing',
                max_members: tier === 'team' ? 10 : tier === 'pro' ? 3 : 1,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingWorkspace.id)

            // Auto-update monitor intervals if tier changed and new minimum is higher
            if (oldTier !== tier) {
              const newLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
              const oldLimit = TIER_LIMITS[oldTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free

              // If new minimum is higher, update monitors below minimum
              if (newLimit.minInterval > oldLimit.minInterval) {
                // Get monitors that need updating
                const { data: monitorsToUpdate } = await supabaseAdmin
                  .from('monitors')
                  .select('id, grace_period_seconds')
                  .eq('workspace_id', existingWorkspace.id)
                  .lt('expected_interval_seconds', newLimit.minInterval)

                if (monitorsToUpdate && monitorsToUpdate.length > 0) {
                  const currentTime = new Date()
                  
                  // Update each monitor with new interval and recalculate next_expected_ping_at
                  for (const monitor of monitorsToUpdate) {
                    const gracePeriod = monitor.grace_period_seconds || 3600
                    const nextExpectedPing = new Date(
                      currentTime.getTime() + newLimit.minInterval * 1000 + gracePeriod * 1000
                    )

                    await supabaseAdmin
                      .from('monitors')
                      .update({
                        expected_interval_seconds: newLimit.minInterval,
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

        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`[Webhook] Subscription ${event.type}:`, {
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
        })

        // Determine tier from price
        const priceId = subscription.items.data[0]?.price.id
        let tier = 'free'
        
        console.log(`[Webhook] Price ID from updated subscription: ${priceId}`)
        
        // New pricing plans
        if (priceId === process.env.STRIPE_PRICE_ID_STARTER) {
          tier = 'starter'
        } else if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
          tier = 'pro'
        } else if (priceId === process.env.STRIPE_PRICE_ID_TEAM) {
          tier = 'team'
        }
        // Legacy support
        else if (priceId === process.env.STRIPE_PRICE_ID_SOLO) {
          tier = 'starter'
        } else if (priceId === process.env.STRIPE_PRICE_ID_AGENCY) {
          tier = 'pro'
        }

        console.log(`[Webhook] Determined tier from subscription update: ${tier}`)

        // Find workspace by customer ID
        const { data: workspace } = await supabaseAdmin
          .from('workspaces')
          .select('id, owner_id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single()

        if (workspace) {
          if (event.type === 'customer.subscription.deleted') {
            console.log(`[Webhook] Subscription deleted for workspace: ${workspace.id}`)
            // Get old tier before downgrade
            const { data: oldWorkspace } = await supabaseAdmin
              .from('workspaces')
              .select('subscription_tier, subscription_status')
              .eq('id', workspace.id)
              .single()

            const oldTier = oldWorkspace?.subscription_tier || 'free'
            const wasPastDue = oldWorkspace?.subscription_status === 'past_due'

            // Calculate grace period: 7 days from now if subscription was past_due (payment failed)
            // Otherwise, no grace period (user canceled manually)
            const gracePeriodEndsAt = wasPastDue 
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : null

            console.log(`[Webhook] Subscription deleted - wasPastDue: ${wasPastDue}, gracePeriodEndsAt: ${gracePeriodEndsAt}`)

            // Downgrade to free
            await supabaseAdmin
              .from('workspaces')
              .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                max_members: 1,
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.id)

            // Auto-update monitor intervals to free tier minimum (5 minutes = 300s)
            const freeLimit = TIER_LIMITS.free
            const { data: monitorsToUpdate } = await supabaseAdmin
              .from('monitors')
              .select('id, grace_period_seconds')
              .eq('workspace_id', workspace.id)
              .lt('expected_interval_seconds', freeLimit.minInterval)

            if (monitorsToUpdate && monitorsToUpdate.length > 0) {
              const currentTime = new Date()
              
              // Update each monitor with new interval and recalculate next_expected_ping_at
              for (const monitor of monitorsToUpdate) {
                const gracePeriod = monitor.grace_period_seconds || 3600
                const nextExpectedPing = new Date(
                  currentTime.getTime() + freeLimit.minInterval * 1000 + gracePeriod * 1000
                )

                await supabaseAdmin
                  .from('monitors')
                  .update({
                    expected_interval_seconds: freeLimit.minInterval,
                    next_expected_ping_at: nextExpectedPing.toISOString(),
                    updated_at: currentTime.toISOString(),
                  })
                  .eq('id', monitor.id)
              }
            }

            // Also update owner's profile
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.owner_id)
          } else {
            // Update subscription (plan change or status update)
            const oldTier = workspace.subscription_tier || 'free'
            const status = subscription.status === 'active' ? 'active' : 'past_due'
            
            console.log(`[Webhook] Updating subscription: old tier ${oldTier} -> new tier ${tier}, status: ${status}`)
            
            // If subscription is past_due or unpaid, set grace period to end of subscription period + 7 days
            let gracePeriodEndsAt: string | null = null
            if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
              const periodEnd = subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000)
                : new Date()
              gracePeriodEndsAt = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
              console.log(`[Webhook] Subscription is ${subscription.status}, setting grace period to: ${gracePeriodEndsAt}`)
            } else if (subscription.status === 'active') {
              // Clear grace period if subscription is active again
              gracePeriodEndsAt = null
            }
            
            await supabaseAdmin
              .from('workspaces')
              .update({
                subscription_tier: tier,
                subscription_status: status,
                max_members: tier === 'team' ? 10 : tier === 'pro' ? 3 : 1,
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.id)

            // Auto-update monitor intervals if tier changed and new minimum is higher
            if (oldTier !== tier) {
              const newLimit = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free
              const oldLimit = TIER_LIMITS[oldTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free

              // If upgrading from free (or any tier), reactivate paused monitors
              if (oldTier === 'free' && tier !== 'free') {
                console.log(`[Webhook] Upgrading from free to ${tier}, reactivating paused monitors`)
                const { data: pausedMonitors } = await supabaseAdmin
                  .from('monitors')
                  .select('id')
                  .eq('workspace_id', workspace.id)
                  .eq('status', 'paused')

                if (pausedMonitors && pausedMonitors.length > 0) {
                  const currentTime = new Date()
                  // Reactivate paused monitors (set status to 'pending' so they can receive pings)
                  await supabaseAdmin
                    .from('monitors')
                    .update({
                      status: 'pending',
                      updated_at: currentTime.toISOString(),
                    })
                    .in('id', pausedMonitors.map(m => m.id))
                  
                  console.log(`[Webhook] Reactivated ${pausedMonitors.length} paused monitors`)
                }
              }

              // If new minimum is higher, update monitors below minimum
              if (newLimit.minInterval > oldLimit.minInterval) {
                const { data: monitorsToUpdate } = await supabaseAdmin
                  .from('monitors')
                  .select('id, grace_period_seconds')
                  .eq('workspace_id', workspace.id)
                  .lt('expected_interval_seconds', newLimit.minInterval)
                  .neq('status', 'paused') // Don't update paused monitors

                if (monitorsToUpdate && monitorsToUpdate.length > 0) {
                  const currentTime = new Date()
                  
                  for (const monitor of monitorsToUpdate) {
                    const gracePeriod = monitor.grace_period_seconds || 3600
                    const nextExpectedPing = new Date(
                      currentTime.getTime() + newLimit.minInterval * 1000 + gracePeriod * 1000
                    )

                    await supabaseAdmin
                      .from('monitors')
                      .update({
                        expected_interval_seconds: newLimit.minInterval,
                        next_expected_ping_at: nextExpectedPing.toISOString(),
                        updated_at: currentTime.toISOString(),
                      })
                      .eq('id', monitor.id)
                  }
                }
              }
            }

            // Also update owner's profile
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_tier: tier,
                subscription_status: status,
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.owner_id)
          }
        } else {
          // Legacy: find profile by customer ID
          const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            if (event.type === 'customer.subscription.deleted') {
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_tier: 'free',
                  subscription_status: 'canceled',
                  updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id)
            } else {
              const status = subscription.status === 'active' ? 'active' : 'past_due'
              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_status: status,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id)
            }
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        const subscriptionId = invoice.subscription as string | null

        console.log(`[Webhook] Invoice payment failed:`, {
          invoiceId: invoice.id,
          customerId,
          subscriptionId,
        })

        if (!subscriptionId) {
          console.log(`[Webhook] No subscription ID in invoice, skipping`)
          break
        }

        // Get subscription to find period end
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          // Find workspace by customer ID
          const { data: workspace } = await supabaseAdmin
            .from('workspaces')
            .select('id, owner_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (workspace) {
            // Set grace period to end of subscription period + 7 days
            const periodEnd = subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000)
              : new Date()
            const gracePeriodEndsAt = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

            console.log(`[Webhook] Payment failed, setting grace period to: ${gracePeriodEndsAt}`)

            await supabaseAdmin
              .from('workspaces')
              .update({
                subscription_status: 'past_due',
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.id)

            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'past_due',
                grace_period_ends_at: gracePeriodEndsAt,
                updated_at: new Date().toISOString(),
              })
              .eq('id', workspace.owner_id)
          } else {
            // Legacy: find profile by customer ID
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('id')
              .eq('stripe_customer_id', customerId)
              .single()

            if (profile) {
              const periodEnd = subscription.current_period_end 
                ? new Date(subscription.current_period_end * 1000)
                : new Date()
              const gracePeriodEndsAt = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

              await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_status: 'past_due',
                  grace_period_ends_at: gracePeriodEndsAt,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id)
            }
          }
        } catch (error: any) {
          console.error(`[Webhook] Error processing invoice.payment_failed:`, error)
        }

        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    console.log(`[Webhook] Event processed successfully: ${event.type}`)
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

