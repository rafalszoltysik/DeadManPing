/**
 * Utility functions for consistent error handling across the application
 */

/**
 * Extracts a human-readable error message from various error types
 * @param error - The error to extract message from
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return 'An error occurred'
}

/**
 * Handles API errors consistently
 * Sets error state and optionally logs to Sentry
 * @param error - The error to handle
 * @param setError - Function to set error state
 * @param options - Additional options for error handling
 */
export function handleApiError(
  error: unknown,
  setError: (message: string) => void,
  options?: {
    logToSentry?: boolean
    sentryContext?: Record<string, unknown>
  }
): void {
  const message = getErrorMessage(error)
  setError(message)
  
  // Log to Sentry if enabled and error is an Error instance
  if (options?.logToSentry && error instanceof Error) {
    // Import dynamically to avoid circular dependencies
    import('@/lib/sentry/client').then(({ captureFrontendError }) => {
      captureFrontendError(error, options.sentryContext)
    }).catch(() => {
      // Silently fail if Sentry is not available
    })
  }
}

/**
 * Handles form submission errors
 * Extracts error message and handles conflict responses (409)
 * @param error - The error to handle
 * @param setError - Function to set error state
 * @param setSuccess - Function to set success state
 * @param onError - Optional callback for error handling
 * @returns The error message
 */
export function handleFormError(
  error: unknown,
  setError: (message: string) => void,
  setSuccess: (success: boolean) => void,
  onError?: (message: string) => void
): string {
  const message = getErrorMessage(error)
  setError(message)
  setSuccess(false)
  onError?.(message)
  return message
}

/**
 * Checks if an error is a network error (no response from server)
 * @param error - The error to check
 * @returns True if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  if (error instanceof Error && error.name === 'NetworkError') {
    return true
  }
  return false
}

/**
 * Checks if an error is an authentication error (401)
 * @param response - The response object
 * @returns True if it's a 401 error
 */
export function isAuthError(response: Response | null): boolean {
  return response?.status === 401
}

