/**
 * Admin subscriptions overview page with subscription details.
 * 
 * Server component that fetches all workspace subscriptions with Stripe
 * customer IDs, grace periods, and status information. Requires admin
 * authentication. Displays subscription table for billing management.
 * 
 * Does not handle subscription updates - only displays information.
 */

import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { formatDistanceToNow } from 'date-fns'

/**
 * Fetches all workspace subscriptions with billing information.
 * 
 * Side effects: database queries (workspaces, profiles).
 * 
 * @returns Subscriptions list with Stripe customer IDs and grace periods
 */
async function getSubscriptions() {
  const supabaseAdmin = getSupabaseAdmin()

  const { data: workspaces, error } = await supabaseAdmin
    .from('workspaces')
    .select(`
      id,
      name,
      slug,
      subscription_tier,
      subscription_status,
      stripe_customer_id,
      grace_period_ends_at,
      created_at,
      owner_id,
      profiles:owner_id (
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch subscriptions')
  }

  return (workspaces || []).map((workspace: any) => ({
    ...workspace,
    owner: workspace.profiles ? (Array.isArray(workspace.profiles) ? workspace.profiles[0] : workspace.profiles) : null,
  }))
}

export default async function AdminSubscriptionsPage() {
  const user = await getSupabaseUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin/subscriptions')
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    redirect('/dashboard?error=admin_access_required')
  }

  let subscriptions
  try {
    subscriptions = await getSubscriptions()
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    subscriptions = []
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">View all workspace subscriptions and billing information</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Workspace</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tier</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Stripe Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Grace Period</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No subscriptions found
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription: any) => (
                  <tr key={subscription.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{subscription.name}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{subscription.owner?.email || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium capitalize">
                        {subscription.subscription_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                        subscription.subscription_status === 'active'
                          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                          : subscription.subscription_status === 'trialing'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : subscription.subscription_status === 'canceled'
                          ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {subscription.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono text-xs">
                      {subscription.stripe_customer_id || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {subscription.grace_period_ends_at
                        ? formatDistanceToNow(new Date(subscription.grace_period_ends_at), { addSuffix: true })
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(subscription.created_at), { addSuffix: true })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


