/**
 * Error handling utilities for consistent error processing.
 * 
 * Provides functions to extract error messages from various error types.
 * Used throughout client and server code for error management.
 * 
 * Does not throw errors - only processes and formats them.
 */

/**
 * Extracts human-readable error message from various error types.
 * 
 * Handles Error objects, strings, and objects with message property.
 * 
 * @param error - Error to extract message from
 * @returns Error message string
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


