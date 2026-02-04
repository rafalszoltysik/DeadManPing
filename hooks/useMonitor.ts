/**
 * React hook for fetching and polling monitor data with real-time status updates.
 * 
 * Provides monitor and ping history with automatic polling, client-side status
 * calculation, and server synchronization when status changes. Used in monitor
 * detail pages for live status display.
 * 
 * Does not handle monitor creation or updates - only data fetching and polling.
 */

import { useState, useEffect, useCallback } from 'react'
import { Monitor, Ping } from '@/lib/types/monitor'
import { checkMonitorStatus } from '@/lib/monitor-utils'

export interface UseMonitorOptions {
  slug: string
  initialMonitor?: Monitor
  initialPings?: Ping[]
  pollInterval?: number
  enabled?: boolean
  onStatusChange?: (monitor: Monitor) => void
}

export interface UseMonitorResult {
  monitor: Monitor | null
  pings: Ping[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Fetches and polls monitor data with automatic status checking.
 * 
 * Polls monitor endpoint at specified interval, calculates client-side status
 * (late/failed), and syncs status changes to server. Handles authentication
 * redirects and error states.
 * 
 * @param options - Configuration including slug, polling interval, and callbacks
 * @returns Monitor data, pings, loading state, error, and refresh function
 */
export function useMonitor(options: UseMonitorOptions): UseMonitorResult {
  const {
    slug,
    initialMonitor,
    initialPings = [],
    pollInterval = 10000,
    enabled = true,
    onStatusChange,
  } = options

  const [monitor, setMonitor] = useState<Monitor | null>(initialMonitor || null)
  const [pings, setPings] = useState<Ping[]>(initialPings)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMonitorData = useCallback(async () => {
    if (!slug) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/monitors/${slug}/update`)
      
      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch monitor data')
      }

      const data = await response.json()
      
      if (data.monitor) {
        // Check if monitor should be marked as late or failed
        const checkedMonitor = checkMonitorStatus(data.monitor)
        
        // Update local state
        setMonitor(checkedMonitor)
        
        // If status changed, notify parent and update server if needed
        if (initialMonitor && checkedMonitor.status !== initialMonitor.status) {
          onStatusChange?.(checkedMonitor)
          
          // If status changed to late or failed, update it on the server
          if (
            (checkedMonitor.status === 'late' || checkedMonitor.status === 'failed') &&
            data.monitor.status !== checkedMonitor.status
          ) {
            // Silently update status on server (don't await to avoid blocking)
            fetch(`/api/monitors/${slug}/update`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                status: checkedMonitor.status,
                expectedUpdatedAt: data.monitor.updated_at,
              }),
            }).catch((err) => console.error('Error updating monitor status:', err))
          }
        } else if (!initialMonitor) {
          // First load
          setMonitor(checkedMonitor)
        }
      }
      
      if (data.pings) {
        setPings(data.pings)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch monitor data'
      setError(errorMessage)
      console.error('Error fetching monitor data:', err)
    } finally {
      setLoading(false)
    }
  }, [slug, initialMonitor, onStatusChange])

  // Poll for updates
  useEffect(() => {
    if (!enabled || !slug) return

    // Initial fetch
    fetchMonitorData()

    // Set up polling interval
    const interval = setInterval(() => {
      fetchMonitorData()
    }, pollInterval)

    return () => clearInterval(interval)
  }, [enabled, slug, pollInterval, fetchMonitorData])

  return {
    monitor,
    pings,
    loading,
    error,
    refresh: fetchMonitorData,
  }
}

