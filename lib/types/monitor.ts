/**
 * TypeScript type definitions for monitor-related entities.
 * 
 * Defines interfaces and types for monitors, pings, job runs, and related
 * data structures used throughout the application. Ensures type safety
 * across API routes, components, and utilities.
 * 
 * Does not contain business logic - only type definitions.
 */

import { PayloadValidationRules } from '@/lib/payload-validator'

export type MonitorStatus = 'pending' | 'healthy' | 'late' | 'failed' | 'paused'
export type PingStatus = 'ok' | 'fail'
export type AlertType = 'missing' | 'failed' | 'recovered' | 'warn'

export interface Monitor {
  id: string
  name: string
  slug: string
  status: MonitorStatus
  user_id: string
  workspace_id: string | null
  last_ping_at: string | null
  next_expected_ping_at: string | null
  expected_interval_seconds: number
  grace_period_seconds: number
  max_execution_time_seconds: number | null
  payload_validation_rules: PayloadValidationRules | null
  alert_email: string | null
  slack_webhook_url: string | null
  discord_webhook_url: string | null
  custom_webhook_url: string | null
  created_at: string
  updated_at: string
}

export interface Ping {
  id: string
  monitor_id: string
  status: PingStatus | string // Allow string for database compatibility
  message: string | null
  duration_ms: number | null
  metadata: Record<string, any> | null
  received_at: string // Always set in conversion from database
}

export interface JobRun {
  id: string
  monitor_id: string
  run_id: string
  started_at: string
  completed_at: string | null
  status: 'running' | 'completed' | 'timeout' | 'failed'
  duration_ms: number | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface MonitorDetailProps {
  monitor: Monitor
  pings: Ping[]
  jobRuns?: JobRun[]
  pingUrl: string
  isOnboarding?: boolean
  userTier?: string
}

export interface MonitorListProps {
  monitors: Monitor[]
}

export interface AlertChannels {
  alertEmail?: string
  slackWebhookUrl?: string
  discordWebhookUrl?: string
  customWebhookUrl?: string
}

export interface MonitorUpdateRequest {
  name?: string
  expectedIntervalSeconds?: number
  gracePeriodSeconds?: number
  maxExecutionTimeSeconds?: number | null
  payloadValidationRules?: PayloadValidationRules | null
  alertChannels?: AlertChannels | null
  status?: MonitorStatus
  expectedUpdatedAt?: string
}

