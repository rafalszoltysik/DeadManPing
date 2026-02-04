/**
 * Sentry error tracking for client-side components and hooks.
 * 
 * Captures frontend errors, API errors, and soft errors with context.
 * Separate from PostHog analytics (errors vs behavior). Disabled in development.
 * 
 * Does not track user behavior - see PostHog for analytics.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Captures frontend error with context for Sentry.
 * 
 * Adds route, action, and additional data as tags/context. Logs to console
 * in development. Side effects: Sentry API call (production only).
 * 
 * @param error - Error object or unknown error
 * @param context - Error context (route, action, additionalData)
 */
export function captureFrontendError(
  error: Error | unknown,
  context: {
    route?: string
    action?: string
    additionalData?: Record<string, any>
  } = {}
): void {
  if (process.env.NODE_ENV !== 'production') {
    // In development, log to console
    console.error('Frontend error:', error, context)
    return
  }

  Sentry.withScope((scope) => {
    // Set error type tag
    scope.setTag('error_type', 'frontend')
    
    // Set context
    if (context.route) {
      scope.setTag('route', context.route)
    }
    
    if (context.action) {
      scope.setTag('action', context.action)
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
 * Captures API error from frontend HTTP requests.
 * 
 * Filters out 404, 401, 403 (too noisy or expected). Only tracks 5xx and
 * critical 4xx errors. Side effects: Sentry API call (production only).
 * 
 * @param route - API route that failed
 * @param statusCode - HTTP status code
 * @param error - Error object or message
 * @param context - Additional context (action, requestBody)
 */
export function captureApiError(
  route: string,
  statusCode: number,
  error: Error | string,
  context?: {
    action?: string
    requestBody?: any
  }
): void {
  // Only track 5xx and critical 4xx errors
  if (statusCode < 400) return
  
  // Don't track 404s (too noisy)
  if (statusCode === 404) return
  
  // Don't track 401/403 (auth issues, not bugs)
  if (statusCode === 401 || statusCode === 403) return

  const errorMessage = error instanceof Error ? error.message : String(error)
  
  captureFrontendError(
    error instanceof Error ? error : new Error(errorMessage),
    {
      route,
      action: context?.action,
      additionalData: {
        statusCode,
        requestBody: context?.requestBody,
      },
    }
  )
}

/**
 * Captures soft error (product issue, not a bug) as warning.
 * 
 * Tracks user-facing issues that aren't code bugs (e.g., validation failures,
 * business logic errors). Logs to console in development.
 * 
 * @param eventName - Soft error event name
 * @param properties - Event properties (route, action, etc.)
 */
export function captureSoftError(
  eventName: string,
  properties: {
    route?: string
    action?: string
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
    
    if (properties.route) {
      scope.setTag('route', properties.route)
    }
    
    if (properties.action) {
      scope.setTag('action', properties.action)
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

