/**
 * Centralized logging utility
 * Provides consistent logging across the application
 * Automatically filters console.log in production while keeping errors
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Logger utility with environment-aware logging
 */
export const logger = {
  /**
   * Logs informational messages (only in development)
   * @param args - Arguments to log
   */
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Logs error messages (always logged, even in production)
   * @param args - Arguments to log
   */
  error: (...args: unknown[]): void => {
    console.error(...args)
  },

  /**
   * Logs warning messages (only in development)
   * @param args - Arguments to log
   */
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * Logs debug messages (only in development)
   * @param args - Arguments to log
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug(...args)
    }
  },

  /**
   * Logs info messages (only in development)
   * @param args - Arguments to log
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Groups related log messages (only in development)
   * @param label - Group label
   * @param fn - Function to execute within the group
   */
  group: (label: string, fn: () => void): void => {
    if (isDevelopment) {
      console.group(label)
      fn()
      console.groupEnd()
    } else {
      fn()
    }
  },
}

