/**
 * Application-wide constants and configuration limits.
 * 
 * Defines maximum values for payload validation fields and field names.
 * Used throughout the application for input validation and data constraints.
 * 
 * Does not define tier limits - see limits.ts for subscription tier limits.
 * Does not define interval/grace period constants - those are configured per monitor.
 */

// Payload validation limits
export const MAX_PAYLOAD_FIELDS = 5
export const MAX_FIELD_NAME_LENGTH = 100

