/**
 * Sentry error tracking for server-side (API routes, server components)
 * 
 * IMPORTANT: This is SEPARATE from analytics (PostHog)
 * - Analytics = user behavior
 * - Error tracking = system failures
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Capture a backend error with context
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
 * Capture a soft error (product issue, not a bug)
 * These are tracked as events, not exceptions
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
 * Capture API error (4xx/5xx)
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
 * Capture timeout error
 */
export function captureTimeout(
  endpoint: string,
  timeoutMs: number,
  context?: {
    userId?: string
    action?: string
  }
): void {
  captureBackendError(
    new Error(`Request timeout after ${timeoutMs}ms`),
    {
      endpoint,
      statusCode: 504,
      userId: context?.userId,
      action: context?.action,
      additionalData: {
        timeoutMs,
      },
    }
  )
}

/**
 * Capture integration error (email, webhook, etc.)
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

