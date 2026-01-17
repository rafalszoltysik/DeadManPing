import { Monitor, MonitorStatus } from '@/lib/types/monitor'

/**
 * Get CSS classes for monitor status display
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
 * Get human-readable label for monitor status
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
 * Get icon component name for monitor status
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
 * Check if monitor should be marked as late or failed based on timing
 * This function calculates the current status based on last_ping_at and expected intervals
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
 * Determine if a monitor should be marked as late based on timing
 * Used by cron jobs to check multiple monitors
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
 * Determine if a monitor should be marked as failed based on timing
 * Used by cron jobs to check multiple monitors
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

