/**
 * Wrapper component for global error handler.
 * 
 * Simple wrapper that renders ErrorHandler component. Used in root layout
 * to ensure error handling is available throughout the application.
 * 
 * Does not handle React error boundaries - only URL-based error detection.
 */

'use client'

import { ErrorHandler } from './ErrorHandler'

/**
 * Renders global error handler component.
 * 
 * @returns ErrorHandler component
 */
export function ErrorHandlerWrapper() {
  return <ErrorHandler />
}

