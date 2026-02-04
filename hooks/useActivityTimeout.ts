/**
 * React hook for monitoring user activity and automatic logout on inactivity.
 * 
 * Tracks user activity events (mouse, keyboard, scroll, touch) and automatically
 * logs out user after specified inactivity period. Includes debouncing to prevent
 * excessive timeout resets. Handles visibility changes (tab switching). Used
 * in ActivityMonitor component for security.
 * 
 * Does not handle session management - only triggers logout redirect.
 */

'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseActivityTimeoutOptions {
  /**
   * Timeout in milliseconds after which user will be logged out
   * Default: 30 minutes (30 * 60 * 1000)
   */
  timeoutMs?: number
  /**
   * Whether the timeout is enabled
   * Default: true
   */
  enabled?: boolean
  /**
   * Callback when timeout occurs (before logout)
   */
  onTimeout?: () => void
}

/**
 * Monitors user activity and triggers logout on inactivity.
 * 
 * Sets up event listeners for activity detection and manages timeout. Side effects:
 * Event listeners, timeout management, logout redirect.
 * 
 * @param options - Configuration (timeout, enabled, callback)
 * @returns Functions to reset timeout and get time since last activity
 */
export function useActivityTimeout(options: UseActivityTimeoutOptions = {}) {
  const {
    timeoutMs = 30 * 60 * 1000, // 30 minutes default
    enabled = true,
    onTimeout,
  } = options
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimeout = useCallback(() => {
    if (!enabled) return

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Update last activity time
    lastActivityRef.current = Date.now()

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      // Call optional callback
      if (onTimeout) {
        onTimeout()
      }

      // Logout user by calling logout endpoint
      try {
        const response = await fetch('/auth/logout', {
          method: 'POST',
          credentials: 'include',
        })

        // Redirect to login with inactivity reason
        window.location.href = '/auth/login?reason=inactivity'
      } catch (error) {
        // Even if logout fails, redirect to login
        console.error('Activity timeout logout error:', error)
        window.location.href = '/auth/login?reason=inactivity'
      }
    }, timeoutMs)
  }, [enabled, timeoutMs, onTimeout])

  const handleActivity = useCallback(() => {
    // Only reset if enough time has passed (debounce rapid events)
    const timeSinceLastActivity = Date.now() - lastActivityRef.current
    if (timeSinceLastActivity > 1000) {
      // Only reset if more than 1 second has passed since last activity
      resetTimeout()
    }
  }, [resetTimeout])

  useEffect(() => {
    if (!enabled) {
      // Clear timeout if disabled
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Initial timeout setup
    resetTimeout()

    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Also track visibility changes (tab becomes active)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible - check if we should reset timeout
        const timeSinceLastActivity = Date.now() - lastActivityRef.current
        if (timeSinceLastActivity < timeoutMs) {
          // Still within timeout window, reset it
          resetTimeout()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, handleActivity, resetTimeout, timeoutMs])

  // Return function to manually reset timeout (useful for API calls)
  return {
    resetTimeout,
    getTimeSinceLastActivity: () => Date.now() - lastActivityRef.current,
  }
}

