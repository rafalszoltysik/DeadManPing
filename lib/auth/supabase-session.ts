import { createClient } from '@/lib/supabase/server'

/**
 * Get authenticated user from Supabase session
 * Returns null if user is not authenticated
 * Use this instead of verifySession() for Supabase Auth
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

