import { NextResponse } from 'next/server'
import { verifySession, SessionPayload } from '@/lib/auth/session'

/**
 * Verify session and return session payload or error response
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<
  | { success: true; session: SessionPayload }
  | { success: false; response: NextResponse }
> {
  const session = await verifySession()
  
  if (!session) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return {
    success: true,
    session,
  }
}

/**
 * Verify cron secret from Authorization header
 * Use this in cron job endpoints
 */
export function verifyCronSecret(authHeader: string | null): boolean {
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (!authHeader || !process.env.CRON_SECRET) {
    return false
  }

  // Use timing-safe comparison
  if (authHeader.length !== expectedAuth.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < authHeader.length; i++) {
    result |= authHeader.charCodeAt(i) ^ expectedAuth.charCodeAt(i)
  }

  return result === 0
}

/**
 * Verify internal API secret from X-Internal-Secret header
 * Use this in internal API endpoints
 */
export function verifyInternalSecret(secretHeader: string | null): boolean {
  const expectedSecret = process.env.INTERNAL_API_SECRET
  
  if (!secretHeader || !expectedSecret) {
    return false
  }

  // Use timing-safe comparison
  if (secretHeader.length !== expectedSecret.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < secretHeader.length; i++) {
    result |= secretHeader.charCodeAt(i) ^ expectedSecret.charCodeAt(i)
  }

  return result === 0
}

