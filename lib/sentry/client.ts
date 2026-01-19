/**
 * Sentry error tracking for client-side
 * 
 * IMPORTANT: This is SEPARATE from analytics (PostHog)
 * - Analytics = user behavior
 * - Error tracking = system failures
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Capture a frontend error with context
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
 * Capture API error from frontend (4xx/5xx)
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
 * Capture soft error from frontend (product issue, not a bug)
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

