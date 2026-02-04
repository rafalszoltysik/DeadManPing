/**
 * Sentry error tracking for server-side (API routes, server components).
 * 
 * Captures backend errors, API errors, timeouts, and integration failures
 * with context. Separate from PostHog analytics. Disabled in development.
 * 
 * Does not track user behavior - see PostHog for analytics.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Captures backend error with context for Sentry.
 * 
 * Adds endpoint, status code, user ID, and additional data. Logs to console
 * in development. Side effects: Sentry API call (production only).
 * 
 * @param error - Error object or unknown error
 * @param context - Error context (endpoint, statusCode, userId, action, additionalData)
 */
export function captureBackendError(
  error: Error | unknown,
  context: {
    endpoint?: string
    statusCode?: number
    userId?: string
    action?: string
    additionalData?: Record<string, any>
  } = {}
): void {
  if (process.env.NODE_ENV !== 'production') {
    // In development, log to console
    console.error('Backend error:', error, context)
    return
  }

  Sentry.withScope((scope) => {
    // Set error type tag
    scope.setTag('error_type', 'backend')
    
    // Set context
    if (context.endpoint) {
      scope.setTag('endpoint', context.endpoint)
    }
    
    if (context.statusCode) {
      scope.setTag('status_code', String(context.statusCode))
      scope.setLevel(context.statusCode >= 500 ? 'error' : 'warning')
    }
    
    if (context.action) {
      scope.setTag('action', context.action)
    }
    
    // Set user context
    if (context.userId) {
      scope.setUser({
        id: context.userId,
      })
    }
    
    // Add additional context
    if (context.additionalData) {
      scope.setContext('additional', context.additionalData)
    }
    
    // Capture the error
    if (error instanceof Error) {
      Sentry.captureException(error)
    } else {
      Sentry.captureMessage(String(error), {
        level: 'error',
      })
    }
  })
}

/**
 * Captures soft error (product issue, not a bug) as warning.
 * 
 * Tracks business logic issues that aren't code bugs. Logs to console in development.
 * 
 * @param eventName - Soft error event name
 * @param properties - Event properties (userId, heartbeatId, monitorId, etc.)
 */
export function captureSoftError(
  eventName: string,
  properties: {
    userId?: string
    heartbeatId?: string
    monitorId?: string
    [key: string]: any
  } = {}
): void {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Soft error:', eventName, properties)
    return
  }

  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'soft_error')
    scope.setTag('event_name', eventName)
    
    if (properties.userId) {
      scope.setUser({
        id: properties.userId,
      })
    }
    
    // Capture as event (not exception)
    Sentry.captureMessage(eventName, {
      level: 'warning',
      tags: {
        soft_error: true,
      },
      contexts: {
        soft_error: properties,
      },
    })
  })
}

/**
 * Captures API route error with filtering.
 * 
 * Filters out 404, 401, 403. Only tracks 5xx and critical 4xx errors.
 * 
 * @param endpoint - API endpoint that failed
 * @param statusCode - HTTP status code
 * @param error - Error object or message
 * @param context - Additional context (userId, requestBody, queryParams)
 */
export function captureApiError(
  endpoint: string,
  statusCode: number,
  error: Error | string,
  context?: {
    userId?: string
    requestBody?: any
    queryParams?: any
  }
): void {
  // Only track 5xx and critical 4xx errors
  if (statusCode < 400) return
  
  // Don't track 404s (too noisy)
  if (statusCode === 404) return
  
  // Don't track 401/403 (auth issues, not bugs)
  if (statusCode === 401 || statusCode === 403) return

  const errorMessage = error instanceof Error ? error.message : String(error)
  
  captureBackendError(
    error instanceof Error ? error : new Error(errorMessage),
    {
      endpoint,
      statusCode,
      userId: context?.userId,
      additionalData: {
        requestBody: context?.requestBody,
        queryParams: context?.queryParams,
      },
    }
  )
}

/**
 * Captures external service integration error.
 * 
 * Used for email, webhook, and other third-party service failures.
 * 
 * @param service - Service name (e.g., 'email', 'slack', 'discord')
 * @param error - Error object or unknown error
 * @param context - Additional context (userId, action, additionalData)
 */
export function captureIntegrationError(
  service: string,
  error: Error | unknown,
  context?: {
    userId?: string
    action?: string
    additionalData?: Record<string, any>
  }
): void {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  captureBackendError(
    error instanceof Error ? error : new Error(`Integration error: ${errorMessage}`),
    {
      endpoint: `integration:${service}`,
      statusCode: 502,
      userId: context?.userId,
      action: context?.action,
      additionalData: {
        service,
        ...context?.additionalData,
      },
    }
  )
}

