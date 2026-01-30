'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'

interface Monitor {
  id: string
  name: string
  slug: string
  status: string
  expected_interval_seconds: number
  last_ping_at: string | null
  created_at: string
  workspace_id: string | null
  user_id: string
  workspace?: {
    name: string
    slug: string
  }
  user?: {
    email: string
  }
}

interface AdminMonitorsTableProps {
  monitors: Monitor[]
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-4 h-4" />
    case 'late':
      return <StatusLateIcon className="w-4 h-4" />
    case 'failed':
      return <StatusFailedIcon className="w-4 h-4" />
    default:
      return <StatusPendingIcon className="w-4 h-4" />
  }
}

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

export function AdminMonitorsTable({ monitors }: AdminMonitorsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">All Monitors</h2>
        <p className="text-sm text-muted-foreground">{monitors.length} total</p>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Interval</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Last Ping</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Workspace</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Owner</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Created</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {monitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No monitors found
                  </td>
                </tr>
              ) : (
                monitors.map((monitor) => (
                  <tr key={monitor.id} className="hover:bg-accent/50">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{monitor.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(monitor.status)}
                        <span className="capitalize">{monitor.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">{formatInterval(monitor.expected_interval_seconds)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {monitor.last_ping_at
                        ? formatDistanceToNow(new Date(monitor.last_ping_at), { addSuffix: true })
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {monitor.workspace ? (
                        <Link
                          href={`/admin/workspaces?workspace=${monitor.workspace.slug}`}
                          className="text-primary hover:underline"
                        >
                          {monitor.workspace.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {monitor.user?.email || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(monitor.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/dashboard/monitors/${monitor.slug}`}
                        className="px-3 py-1 text-xs rounded bg-accent hover:bg-accent/80 text-foreground"
                      >
                        View
                      </Link>
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


