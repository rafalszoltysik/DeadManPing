/**
 * React hook for fetching and managing user subscription tier information.
 * 
 * Polls tier endpoint, calculates tier-based limits and feature flags, and
 * refreshes on window focus. Used throughout UI to conditionally show/hide
 * features based on subscription tier.
 * 
 * Does not handle subscription upgrades - see billing routes for that.
 */

import { useState, useEffect, useCallback } from 'react'
import { TIER_LIMITS } from '@/lib/limits'

export type Tier = keyof typeof TIER_LIMITS

export interface UseTierResult {
  tier: Tier
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  minIntervalMinutes: number
  hasSlackDiscord: boolean
  hasCustomWebhook: boolean
}

/**
 * Fetches and manages user subscription tier with automatic polling.
 * 
 * Polls tier endpoint at specified interval and on window focus. Calculates
 * tier-based values (min interval, feature flags) from TIER_LIMITS.
 * 
 * @param options - Configuration including polling interval and enabled flag
 * @returns Tier data, loading state, error, and calculated tier-based values
 */
export function useTier(
  options: {
    pollInterval?: number
    enabled?: boolean
  } = {}
): UseTierResult {
  const { pollInterval = 30000, enabled = true } = options

  const [tier, setTier] = useState<Tier>('free')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTier = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/tier')
      
      if (response.status === 401) {
        window.location.href = '/auth/login'
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user tier')
      }

      const data = await response.json()
      const userTier = (data.tier || 'free') as Tier
      setTier(userTier)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch user tier'
      setError(errorMessage)
      console.error('Error fetching user tier:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    if (!enabled) return

    fetchTier()

    // Poll for tier changes (e.g., after subscription upgrade/downgrade)
    const interval = setInterval(() => {
      fetchTier()
    }, pollInterval)

    // Also check when user returns to tab/window
    const handleFocus = () => fetchTier()
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [enabled, pollInterval, fetchTier])

  // Calculate tier-based values
  const limit = TIER_LIMITS[tier] || TIER_LIMITS.free
  const minIntervalMinutes = limit.minInterval / 60
  const hasSlackDiscord = ['starter', 'pro', 'team'].includes(tier)
  const hasCustomWebhook = tier === 'team'

  return {
    tier,
    loading,
    error,
    refresh: fetchTier,
    minIntervalMinutes,
    hasSlackDiscord,
    hasCustomWebhook,
  }
}

