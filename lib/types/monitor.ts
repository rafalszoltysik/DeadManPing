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
  status: PingStatus
  message: string | null
  duration_ms: number | null
  metadata: Record<string, any> | null
  received_at: string
}

export interface MonitorDetailProps {
  monitor: Monitor
  pings: Ping[]
  pingUrl: string
  isOnboarding?: boolean
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
  payloadValidationRules?: PayloadValidationRules | null
  alertChannels?: AlertChannels | null
  status?: MonitorStatus
  expectedUpdatedAt?: string
}

