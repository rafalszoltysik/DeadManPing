/**
 * PostHog analytics event type definitions.
 * 
 * Defines TypeScript interfaces and types for all analytics events tracked
 * in the application. Events use snake_case naming convention per PostHog
 * best practices. Used by both client and server-side PostHog integrations.
 * 
 * Does not contain event tracking logic - only type definitions.
 */

export type CTAType = 'signup' | 'login' | 'create_heartbeat'
export type SignupMethod = 'google' | 'email'
export type SignupFailureReason = 'validation' | 'oauth_error' | 'unknown'
export type HeartbeatType = 'cron' | 'webhook'
export type HeartbeatCreateFailureReason = 'validation' | 'limit' | 'unknown'
export type HeartbeatUrlCopyMethod = 'curl' | 'webhook'

export interface PageViewEvent {
  path: string
  referrer: string | null
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_term?: string | null
  utm_content?: string | null
}

export interface CTAClickedEvent {
  cta: CTAType
}

export interface SignupStartedEvent {
  method: SignupMethod
}

export interface SignupCompletedEvent {
  method: SignupMethod
}

export interface SignupFailedEvent {
  method: SignupMethod
  reason: SignupFailureReason
}

export interface HeartbeatCreatedEvent {
  type: HeartbeatType
  timeout_minutes: number
}

export interface HeartbeatCreateFailedEvent {
  reason: HeartbeatCreateFailureReason
}

export interface HeartbeatDeletedEvent {
  heartbeat_id: string
}

export interface HeartbeatUrlCopiedEvent {
  method: HeartbeatUrlCopyMethod
}

export interface FirstSuccessPingEvent {
  heartbeat_id: string
  seconds_from_signup: number
}

export interface HeartbeatMissedEvent {
  heartbeat_id: string
  expected_at: string
  last_ping_at: string | null
}

export interface HeartbeatRecoveredEvent {
  heartbeat_id: string
  downtime_seconds: number
}

