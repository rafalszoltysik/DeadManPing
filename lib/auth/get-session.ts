import { getSupabaseUser } from './supabase-session'

/**
 * @deprecated Use getSupabaseUser() instead
 * This function is kept for backward compatibility but will be removed in the future
 */
export async function getSession() {
  const user = await getSupabaseUser()
  if (!user) {
    return null
  }
  // Return a compatible format for backward compatibility
  return {
    userId: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  }
}

