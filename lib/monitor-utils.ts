/**
 * Monitor status utility functions for UI and status calculation.
 * 
 * Provides status display helpers (colors, labels, icons) and timing-based
 * status determination functions used by cron jobs to check monitor health.
 * Calculates late/failed status based on expected intervals and grace periods.
 * 
 * Does not update database - returns calculated status for callers to persist.
 */

import { Monitor, MonitorStatus } from '@/lib/types/monitor'

/**
 * Returns Tailwind CSS classes for monitor status badge display.
 * 
 * @param status - Monitor status value
 * @returns CSS class string for status styling
 */
export function getStatusColor(status: MonitorStatus): string {
  switch (status) {
    case 'healthy':
      return 'bg-success/10 text-success border-success/20'
    case 'late':
      return 'bg-warning/10 text-warning border-warning/20'
    case 'failed':
      return 'bg-error/10 text-error border-error/20'
    case 'paused':
      return 'bg-muted/50 text-muted-foreground border-muted'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

/**
 * Returns human-readable label for monitor status.
 * 
 * @param status - Monitor status value
 * @returns Display label string
 */
export function getStatusLabel(status: MonitorStatus): string {
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

/**
 * Returns icon name for monitor status display.
 * 
 * @param status - Monitor status value
 * @returns Icon component name
 */
export function getStatusIconName(status: MonitorStatus): 'healthy' | 'late' | 'failed' | 'pending' {
  switch (status) {
    case 'healthy':
      return 'healthy'
    case 'late':
      return 'late'
    case 'failed':
      return 'failed'
    case 'paused':
      return 'pending'
    default:
      return 'pending'
  }
}

/**
 * Calculates monitor status based on timing (client-side status check).
 * 
 * Determines if monitor should be late or failed based on last ping time,
 * expected interval, and grace period. Returns updated monitor object.
 * Used for real-time status display in UI.
 * 
 * @param monitor - Monitor object with timing data
 * @returns Monitor object with updated status
 */
export function checkMonitorStatus(monitor: Monitor): Monitor {
  // Check if monitor is healthy, pending, or late (late can transition to failed)
  if (monitor.status !== 'healthy' && monitor.status !== 'pending' && monitor.status !== 'late') {
    return monitor
  }

  const now = new Date()
  let referenceTime: Date | null = null

  // Determine reference time (when the ping was expected)
  if (monitor.last_ping_at) {
    referenceTime = new Date(monitor.last_ping_at)
  } else if (monitor.status === 'pending' || (monitor.status === 'healthy' && !monitor.last_ping_at)) {
    referenceTime = new Date(monitor.created_at)
  }

  if (!referenceTime) {
    return monitor
  }

  const expectedIntervalEnd = new Date(
    referenceTime.getTime() + monitor.expected_interval_seconds * 1000
  )
  const gracePeriodEnd = new Date(
    referenceTime.getTime() +
    monitor.expected_interval_seconds * 1000 +
    monitor.grace_period_seconds * 1000
  )

  // If grace period is 0, mark as failed immediately after expected interval
  if (monitor.grace_period_seconds === 0) {
    if (now > expectedIntervalEnd) {
      return { ...monitor, status: 'failed' }
    }
  } else {
    // Check if monitor is in grace period (late)
    if (now > expectedIntervalEnd && now <= gracePeriodEnd) {
      return { ...monitor, status: 'late' }
    }
    // Check if monitor is past grace period (failed)
    else if (now > gracePeriodEnd) {
      return { ...monitor, status: 'failed' }
    }
  }

  return monitor
}

/**
 * Determines if monitor should be marked as late (past expected interval, within grace period).
 * 
 * Used by cron jobs to efficiently check multiple monitors. Returns true if monitor
 * is past expected interval but still within grace period.
 * 
 * @param monitor - Monitor object with timing data
 * @param now - Current timestamp (defaults to now)
 * @returns True if monitor should be marked as late
 */
export function shouldMarkAsLate(monitor: Monitor, now: Date = new Date()): boolean {
  if (monitor.status === 'late' || monitor.status === 'failed' || monitor.status === 'paused') {
    return false
  }

  let referenceTime: Date | null = null

  if (monitor.last_ping_at) {
    referenceTime = new Date(monitor.last_ping_at)
  } else if (monitor.status === 'pending' || (monitor.status === 'healthy' && !monitor.last_ping_at)) {
    referenceTime = new Date(monitor.created_at)
  }

  if (!referenceTime) {
    return false
  }

  const expectedIntervalEnd = new Date(
    referenceTime.getTime() + monitor.expected_interval_seconds * 1000
  )
  const gracePeriodEnd = new Date(
    referenceTime.getTime() +
    monitor.expected_interval_seconds * 1000 +
    monitor.grace_period_seconds * 1000
  )

  // Check if monitor is in grace period (late)
  return now > expectedIntervalEnd && now <= gracePeriodEnd
}

/**
 * Determines if monitor should be marked as failed (past grace period).
 * 
 * Used by cron jobs to efficiently check multiple monitors. Returns true if monitor
 * is past grace period (or past expected interval if grace period is 0).
 * 
 * @param monitor - Monitor object with timing data
 * @param now - Current timestamp (defaults to now)
 * @returns True if monitor should be marked as failed
 */
export function shouldMarkAsFailed(monitor: Monitor, now: Date = new Date()): boolean {
  if (monitor.status === 'failed' || monitor.status === 'paused') {
    return false
  }

  let referenceTime: Date | null = null

  if (monitor.last_ping_at) {
    referenceTime = new Date(monitor.last_ping_at)
  } else if (monitor.status === 'pending' || (monitor.status === 'healthy' && !monitor.last_ping_at)) {
    referenceTime = new Date(monitor.created_at)
  }

  if (!referenceTime) {
    return false
  }

  const expectedIntervalEnd = new Date(
    referenceTime.getTime() + monitor.expected_interval_seconds * 1000
  )
  const gracePeriodEnd = new Date(
    referenceTime.getTime() +
    monitor.expected_interval_seconds * 1000 +
    monitor.grace_period_seconds * 1000
  )

  // If grace period is 0, mark as failed immediately after expected interval
  if (monitor.grace_period_seconds === 0) {
    return now > expectedIntervalEnd
  }

  // Check if monitor is past grace period (failed)
  return now > gracePeriodEnd
}

