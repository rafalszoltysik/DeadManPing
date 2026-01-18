import { createClient } from '@/lib/supabase/server'

/**
 * Get authenticated user from Supabase session
 * Returns null if user is not authenticated
 * Use this instead of verifySession() for Supabase Auth
 */
export async function getSupabaseUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

