/**
 * Internal API route for sending monitor alerts.
 * 
 * Protected endpoint for internal use (cron jobs, webhooks) to trigger alerts.
 * Requires internal secret and origin validation. Used by cron jobs to send
 * alerts without exposing alert logic to public endpoints.
 * 
 * Does not validate monitor access - assumes caller has verified permissions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendAlert } from '@/lib/alerts'
import { compareSecrets } from '@/lib/security'

/**
 * Validates request origin for internal API security.
 * 
 * Allows same-origin requests and localhost in development.
 * Blocks cross-origin requests in production.
 * 
 * @param request - HTTP request to validate
 * @returns True if origin is allowed
 */
function isAllowedOrigin(request: NextRequest): boolean {
  // In production, only allow requests from same origin (internal calls)
  // In development, allow localhost
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  
  // Allow same-origin requests (no origin header = same origin)
  if (!origin) {
    return true
  }
  
  // Allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return true
    }
  }
  
  // In production, only allow same origin
  if (host && origin.includes(host)) {
    return true
  }
  
  return false
}

/**
 * Sends alert for monitor via internal API.
 * 
 * Validates internal secret and origin, then triggers alert sending.
 * Side effects: Email/Slack/Discord/webhook delivery.
 * 
 * @param request - HTTP request with monitor_id and alert_type in body
 * @returns Alert sending result
 */
export async function POST(request: NextRequest) {
  // Additional security: check origin (internal API should only be called from same origin)
  if (!isAllowedOrigin(request)) {
    // Don't reveal that this is an internal API endpoint
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Verify internal secret using timing-safe comparison
  const secret = request.headers.get('x-internal-secret')
  const expectedSecret = process.env.INTERNAL_API_SECRET || ''
  
  if (!secret || !compareSecrets(secret, expectedSecret)) {
    // Don't log the secret or reveal details about authentication
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { monitor_id, alert_type } = body

    if (!monitor_id || !alert_type) {
      return NextResponse.json(
        { error: 'Missing monitor_id or alert_type' },
        { status: 400 }
      )
    }

    if (!['missing', 'failed', 'recovered', 'warn'].includes(alert_type)) {
      return NextResponse.json(
        { error: 'Invalid alert_type' },
        { status: 400 }
      )
    }

    const result = await sendAlert({ monitor_id, alert_type })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error sending alert:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

