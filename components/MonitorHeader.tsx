/**
 * Monitor header component with status display and actions.
 * 
 * Displays monitor name, status badge, and delete button. Used in monitor
 * detail page to show monitor information and provide quick actions. Renders
 * status icon and color-coded badge.
 * 
 * Does not handle monitor updates - only displays information and triggers delete.
 */

'use client'

import Link from 'next/link'
import { Monitor } from '@/lib/types/monitor'
import { StatusHealthyIcon, StatusLateIcon, StatusFailedIcon, StatusPendingIcon } from './Icons'

interface MonitorHeaderProps {
  monitor: Monitor
  onDeleteClick: () => void
}

/**
 * Returns status icon component for monitor status.
 * 
 * @param status - Monitor status value
 * @returns React icon component
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon className="w-5 h-5" />
    case 'late':
      return <StatusLateIcon className="w-5 h-5" />
    case 'failed':
      return <StatusFailedIcon className="w-5 h-5" />
    case 'paused':
      return <StatusPendingIcon className="w-5 h-5" />
    default:
      return <StatusPendingIcon className="w-5 h-5" />
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
    case 'paused':
      return 'bg-muted text-muted-foreground border-border'
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
    case 'paused':
      return 'Paused'
    default:
      return 'Pending'
  }
}

export function MonitorHeader({ monitor, onDeleteClick }: MonitorHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <Link href="/dashboard" className="text-primary hover:text-primary/80 text-xs sm:text-sm mb-3 sm:mb-4 inline-block transition-smooth">
        ← Back to monitors
      </Link>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className={`p-2 sm:p-3 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
            {getStatusIcon(monitor.status)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{monitor.name}</h1>
            <span className={`mt-1 sm:mt-2 inline-block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-full border ${getStatusColor(monitor.status)}`}>
              {getStatusLabel(monitor.status)}
            </span>
          </div>
        </div>
        <button
          onClick={onDeleteClick}
          className="px-3 py-1.5 text-sm text-error border border-error/20 rounded-lg hover:bg-error/10 transition-smooth flex-shrink-0"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

