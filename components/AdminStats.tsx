/**
 * Admin statistics display component.
 * 
 * Displays admin dashboard statistics with stat cards showing key metrics
 * (users, monitors, workspaces, subscriptions). Includes StatCard component
 * for individual metric display with optional trends and icons.
 * 
 * Does not fetch data - receives statistics as props.
 */

'use client'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
  }
}

/**
 * Renders individual statistic card with optional trend indicator.
 * 
 * @param title - Statistic title/label
 * @param value - Statistic value (number or string)
 * @param subtitle - Optional subtitle text
 * @param icon - Optional icon component
 * @param trend - Optional trend data with value and label
 */
export function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-sm mt-2 ${
              trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend.value >= 0 ? '+' : ''}{trend.value} {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface AdminStatsProps {
  stats: {
    users: {
      total: number
      newToday: number
      newThisWeek: number
      newThisMonth: number
    }
    monitors: {
      total: number
      healthy: number
      late: number
      failed: number
      pending: number
    }
    workspaces: {
      total: number
    }
    subscriptions: {
      free: number
      starter: number
      pro: number
      team: number
      active: number
      trialing: number
      canceled: number
      past_due: number
    }
  }
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Monitors"
            value={stats.monitors.total}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            title="Workspaces"
            value={stats.workspaces.total}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.subscriptions.active}
            subtitle={`${stats.subscriptions.trialing} trialing`}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            }
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">User Growth</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="New Today"
            value={stats.users.newToday}
          />
          <StatCard
            title="New This Week"
            value={stats.users.newThisWeek}
          />
          <StatCard
            title="New This Month"
            value={stats.users.newThisMonth}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Monitor Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Healthy"
            value={stats.monitors.healthy}
            subtitle={`${stats.monitors.total > 0 ? Math.round((stats.monitors.healthy / stats.monitors.total) * 100) : 0}% of total`}
          />
          <StatCard
            title="Late"
            value={stats.monitors.late}
            subtitle={`${stats.monitors.total > 0 ? Math.round((stats.monitors.late / stats.monitors.total) * 100) : 0}% of total`}
          />
          <StatCard
            title="Failed"
            value={stats.monitors.failed}
            subtitle={`${stats.monitors.total > 0 ? Math.round((stats.monitors.failed / stats.monitors.total) * 100) : 0}% of total`}
          />
          <StatCard
            title="Pending"
            value={stats.monitors.pending}
            subtitle={`${stats.monitors.total > 0 ? Math.round((stats.monitors.pending / stats.monitors.total) * 100) : 0}% of total`}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Subscriptions by Tier</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Free"
            value={stats.subscriptions.free}
          />
          <StatCard
            title="Starter"
            value={stats.subscriptions.starter}
          />
          <StatCard
            title="Pro"
            value={stats.subscriptions.pro}
          />
          <StatCard
            title="Team"
            value={stats.subscriptions.team}
          />
        </div>
      </div>
    </div>
  )
}


