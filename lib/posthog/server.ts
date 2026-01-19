import { PostHog } from 'posthog-node'
import type {
  SignupCompletedEvent,
  SignupFailedEvent,
  HeartbeatCreatedEvent,
  HeartbeatCreateFailedEvent,
  HeartbeatDeletedEvent,
  FirstSuccessPingEvent,
  HeartbeatMissedEvent,
  HeartbeatRecoveredEvent,
} from './events'

// Singleton PostHog client instance
let posthogClient: PostHog | null = null

/**
 * Get or create PostHog server client instance
 */
export function getPostHogClient(): PostHog | null {
  // Disable PostHog in development to avoid sending test data
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || !host) {
    // PostHog not configured, return null (events will be silently ignored)
    return null
  }

  if (!posthogClient) {
    posthogClient = new PostHog(apiKey, {
      host,
      flushAt: 1, // Flush immediately for server-side events
      flushInterval: 0, // No batching
      // For serverless, we'll shutdown after each event to ensure delivery
    })
  }

  return posthogClient
}

/**
 * Capture an event on the server side
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
): Promise<void> {
  const client = getPostHogClient()
  if (!client) return

  try {
    client.capture({
      distinctId,
      event,
      properties,
    })
    
    // For serverless (Next.js API routes), shutdown ensures events are sent
    // The client will be recreated on next request if needed
    await client.shutdown()
    
    // Reset singleton so it's recreated on next request
    posthogClient = null
  } catch (error) {
    // Silently fail - don't break the application if analytics fails
    console.error('PostHog capture error:', error)
  }
}

/**
 * Capture signup completed event
 */
export async function captureSignupCompleted(
  distinctId: string,
  event: SignupCompletedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'signup_completed', {
    method: event.method,
  })
}

/**
 * Capture signup failed event
 */
export async function captureSignupFailed(
  distinctId: string,
  event: SignupFailedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'signup_failed', {
    method: event.method,
    reason: event.reason,
  })
}

/**
 * Capture heartbeat created event
 */
export async function captureHeartbeatCreated(
  distinctId: string,
  event: HeartbeatCreatedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'heartbeat_created', {
    type: event.type,
    timeout_minutes: event.timeout_minutes,
  })
}

/**
 * Capture heartbeat create failed event
 */
export async function captureHeartbeatCreateFailed(
  distinctId: string,
  event: HeartbeatCreateFailedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'heartbeat_create_failed', {
    reason: event.reason,
  })
}

/**
 * Capture heartbeat deleted event
 */
export async function captureHeartbeatDeleted(
  distinctId: string,
  event: HeartbeatDeletedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'heartbeat_deleted', {
    heartbeat_id: event.heartbeat_id,
  })
}

/**
 * Capture first success ping event
 */
export async function captureFirstSuccessPing(
  distinctId: string,
  event: FirstSuccessPingEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'first_success_ping', {
    heartbeat_id: event.heartbeat_id,
    seconds_from_signup: event.seconds_from_signup,
  })
}

/**
 * Capture heartbeat missed event
 */
export async function captureHeartbeatMissed(
  distinctId: string,
  event: HeartbeatMissedEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'heartbeat_missed', {
    heartbeat_id: event.heartbeat_id,
    expected_at: event.expected_at,
    last_ping_at: event.last_ping_at,
  })
}

/**
 * Capture heartbeat recovered event
 */
export async function captureHeartbeatRecovered(
  distinctId: string,
  event: HeartbeatRecoveredEvent
): Promise<void> {
  await captureServerEvent(distinctId, 'heartbeat_recovered', {
    heartbeat_id: event.heartbeat_id,
    downtime_seconds: event.downtime_seconds,
  })
}

