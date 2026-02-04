/**
 * Authentication and authorization utilities for API routes.
 * 
 * Provides functions for verifying user sessions, cron secrets, internal API secrets,
 * and CSRF protection via origin verification. Used across protected API endpoints.
 * 
 * Does not handle password validation or OAuth - see auth routes for those.
 */

import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

/**
 * Verifies user session and returns authenticated user or error response.
 * 
 * Used in API routes that require authentication. Returns user object on success
 * or error response on failure.
 * 
 * @returns User object on success, error response on failure
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
 * Verifies cron job secret using timing-safe comparison.
 * 
 * Used to protect cron job endpoints from unauthorized access.
 * 
 * @param authHeader - Authorization header value (Bearer token)
 * @returns True if secret matches, false otherwise
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
 * Verify CSRF protection by checking Origin header
 * This prevents cross-origin requests from executing state-changing operations
 * 
 * @param request - NextRequest object
 * @returns true if request is safe (same-origin or valid origin)
 */
export function verifyOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  const referer = request.headers.get('referer')
  
  // Allow requests without origin (same-origin requests, e.g., fetch from same domain)
  if (!origin) {
    // For same-origin requests, check referer as fallback
    if (referer && host) {
      try {
        const refererUrl = new URL(referer)
        return refererUrl.hostname === host.split(':')[0] // Remove port if present
      } catch {
        return false
      }
    }
    // If no origin and no referer, allow (could be same-origin fetch)
    return true
  }
  
  // In production, only allow same-origin requests
  if (host) {
    const hostname = host.split(':')[0] // Remove port if present
    try {
      const originUrl = new URL(origin)
      // Allow exact match or subdomain match
      return originUrl.hostname === hostname || 
             originUrl.hostname.endsWith('.' + hostname)
    } catch {
      return false
    }
  }
  
  return false
}

