'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon, ChevronRightIcon } from './Icons'

interface Monitor {
  id: string
  name: string
  slug: string
  status: 'pending' | 'healthy' | 'late' | 'failed'
  last_ping_at: string | null
  next_expected_ping_at: string | null
  expected_interval_seconds: number
  created_at: string
}

interface MonitorListProps {
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

function getStatusColor(status: string) {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 text-success border-success/20'
    case 'late':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'failed':
      return 'bg-error/10 text-error border-error/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'healthy':
      return 'Healthy'
    case 'late':
      return 'Late'
    case 'failed':
      return 'Failed'
    default:
      return 'Pending'
  }
}

export function MonitorList({ monitors }: MonitorListProps) {
  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-border">
        {monitors.map((monitor, index) => (
          <Link
            key={monitor.id}
            href={`/dashboard/monitors/${monitor.slug}`}
            className="block hover:bg-accent/50 transition-smooth animate-fade-in group"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                    {getStatusIcon(monitor.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium truncate">{monitor.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                        {getStatusLabel(monitor.status)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      Expected every {Math.floor(monitor.expected_interval_seconds / 60)} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    {monitor.last_ping_at ? (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground">Last ping</p>
                        <p className="text-xs sm:text-sm font-mono">
                          {formatDistanceToNow(new Date(monitor.last_ping_at), { addSuffix: true })}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">No pings yet</p>
                    )}
                  </div>
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-smooth" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
