/**
 * User email retrieval API endpoint.
 * 
 * Returns authenticated user's email address. Used by client components to
 * display user email without exposing full user object. Returns null if user
 * not authenticated or email not available.
 * 
 * Does not update email - only retrieves current email.
 */

import { NextRequest } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { successResponse, errorResponse } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

/**
 * Retrieves authenticated user's email address.
 * 
 * @param request - HTTP request (unused, but required by Next.js)
 * @returns User email or null if not authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    
    if (!user || !user.email) {
      return successResponse({ email: null })
    }

    return successResponse({ email: user.email })
  } catch (error) {
    console.error('Error fetching user email:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

