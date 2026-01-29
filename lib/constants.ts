/**
 * Application-wide constants
 */

// Payload validation limits
export const MAX_PAYLOAD_FIELDS = 5
export const MAX_FIELD_NAME_LENGTH = 100

// Monitor limits
export const MAX_MONITOR_NAME_LENGTH = 100

// Common intervals (in seconds)
export const INTERVALS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
} as const

// Common grace periods (in seconds)
export const GRACE_PERIODS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
} as const

