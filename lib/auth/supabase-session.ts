/**
 * Supabase session management utilities for server-side authentication.
 * 
 * Provides function to retrieve authenticated user from Supabase session cookies.
 * Used in Server Components and API routes to check authentication status.
 * Handles expected "no session" errors gracefully without logging.
 * 
 * Does not handle login/logout - see auth routes for that.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Retrieves authenticated user from Supabase session.
 * 
 * Returns user object if authenticated, null otherwise. Silently handles
 * expected "no session" errors (normal for unauthenticated users).
 * 
 * @returns User object or null if not authenticated
 */
export async function getSupabaseUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // Ignore expected "no session" errors - they just mean user is not authenticated
  if (error) {
    const errorMessage = error.message?.toLowerCase() || ''
    const isExpectedNoSessionError = 
      error.code === 'refresh_token_not_found' ||
      error.name === 'AuthSessionMissingError' ||
      errorMessage.includes('refresh token not found') ||
      errorMessage.includes('invalid refresh token') ||
      errorMessage.includes('session missing') || 
      errorMessage.includes('auth session missing')
    
    // Only log unexpected errors
    if (!isExpectedNoSessionError && process.env.NODE_ENV === 'development') {
      console.warn('Unexpected auth error in getSupabaseUser:', error)
    }
  }
  
  if (error || !user) {
    return null
  }
  
  return user
}

