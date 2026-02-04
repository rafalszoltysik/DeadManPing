/**
 * PostHog analytics server-side client for API routes and server components.
 * 
 * Provides functions to capture server-side events (signups, monitor creation,
 * pings, failures) from API routes. Uses singleton pattern with immediate
 * flush for serverless environments. Disabled in development.
 * 
 * Does not track errors - see Sentry for error tracking.
 */

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
 * Gets or creates PostHog server client singleton.
 * 
 * Returns null in development or if PostHog not configured. Client is
 * shutdown after each event for serverless compatibility.
 * 
 * @returns PostHog client instance or null
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
 * Captures server-side event to PostHog.
 * 
 * Shuts down client after capture for serverless compatibility. Side effects:
 * PostHog API call, client shutdown.
 * 
 * @param distinctId - User identifier
 * @param event - Event name
 * @param properties - Event properties
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
 * Captures signup completion event.
 * 
 * @param distinctId - User identifier
 * @param event - Signup completed event data
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
 * Captures signup failure event.
 * 
 * @param distinctId - User identifier
 * @param event - Signup failed event data
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
 * Captures monitor creation event.
 * 
 * @param distinctId - User identifier
 * @param event - Heartbeat created event data
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
 * Captures monitor creation failure event.
 * 
 * @param distinctId - User identifier
 * @param event - Heartbeat create failed event data
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
 * Captures monitor deletion event.
 * 
 * @param distinctId - User identifier
 * @param event - Heartbeat deleted event data
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
 * Captures first successful ping event for new monitor.
 * 
 * @param distinctId - User identifier
 * @param event - First success ping event data
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
 * Captures monitor missed ping event.
 * 
 * @param distinctId - User identifier
 * @param event - Heartbeat missed event data
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
 * Captures monitor recovery event (ping received after failure).
 * 
 * @param distinctId - User identifier
 * @param event - Heartbeat recovered event data
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

