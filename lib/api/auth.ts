import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

/**
 * Verify session and return user or error response
 * Use this in API routes that require authentication
 */
export async function requireAuth(): Promise<
  | { success: true; user: { id: string; email?: string; email_confirmed_at?: string | null } }
  | { success: false; response: NextResponse }
> {
  const user = await getSupabaseUser()
  
  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
    },
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

