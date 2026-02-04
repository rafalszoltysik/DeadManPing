/**
 * Monitor list component for dashboard display.
 * 
 * Renders a list of monitors with status indicators, last ping times, and navigation links.
 * Uses memoization for performance optimization. Displays monitors sorted by status priority.
 * 
 * Does not handle monitor creation or updates - only displays existing monitors.
 */

'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { memo } from 'react'
import { ChevronRightIcon } from './Icons'
import { MonitorListProps } from '@/lib/types/monitor'
import { MonitorStatusIcon, MonitorStatus } from './MonitorStatus'
import { getStatusColor } from '@/lib/monitor-utils'

/**
 * Renders a list of monitors with status badges and metadata.
 * 
 * @param monitors - Array of monitor objects to display
 */
export const MonitorList = memo(function MonitorList({ monitors }: MonitorListProps) {
  // Render immediately visible - animation is handled by AnimatedSection wrapper
  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-border">
        {monitors.map((monitor) => (
          <Link
            key={monitor.id}
            href={`/dashboard/monitors/${monitor.slug}`}
            className="block hover:bg-accent/50 transition-smooth group"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                    <MonitorStatusIcon status={monitor.status} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium truncate">{monitor.name}</h3>
                      <MonitorStatus status={monitor.status} size="sm" />
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
})
