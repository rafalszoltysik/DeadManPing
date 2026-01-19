'use client'

import { useActivityTimeout } from '@/hooks/useActivityTimeout'

interface ActivityMonitorProps {
  /**
   * Timeout in minutes after which user will be logged out
   * Default: 30 minutes
   */
  timeoutMinutes?: number
  /**
   * Whether the monitor is enabled
   * Default: true
   */
  enabled?: boolean
}

/**
 * Component that monitors user activity and automatically logs out after inactivity
 * Should be placed in dashboard layout
 */
export function ActivityMonitor({ timeoutMinutes = 30, enabled = true }: ActivityMonitorProps) {
  useActivityTimeout({
    timeoutMs: timeoutMinutes * 60 * 1000,
    enabled,
  })

  // This component doesn't render anything
  return null
}

