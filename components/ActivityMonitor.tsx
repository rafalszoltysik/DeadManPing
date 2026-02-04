/**
 * User activity monitoring component for automatic logout.
 * 
 * Monitors user activity (mouse, keyboard, scroll) and automatically logs out
 * after specified inactivity period. Uses useActivityTimeout hook for activity
 * detection. Renders nothing - only provides side effects. Used in dashboard
 * layout for security.
 * 
 * Does not handle session management - only triggers logout redirect.
 */

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
 * Monitors user activity and triggers logout on inactivity.
 * 
 * Side effects: Event listeners (mouse, keyboard, scroll), redirect on timeout.
 * 
 * @param timeoutMinutes - Inactivity timeout in minutes
 * @param enabled - Whether monitoring is enabled
 */
export function ActivityMonitor({ timeoutMinutes = 30, enabled = true }: ActivityMonitorProps) {
  useActivityTimeout({
    timeoutMs: timeoutMinutes * 60 * 1000,
    enabled,
  })

  // This component doesn't render anything
  return null
}

