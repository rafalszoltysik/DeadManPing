/**
 * Admin authentication and authorization utilities.
 * 
 * Provides functions to check admin status and require admin access in API routes.
 * Used to protect admin-only endpoints and features.
 * 
 * Does not handle admin creation - admins must be set manually in database.
 */

import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Checks if user has admin privileges.
 * 
 * Queries database for user's is_admin flag. Returns false on error or if user not found.
 * Side effects: DB read (profiles table).
 * 
 * @param userId - User ID to check
 * @returns True if user is admin, false otherwise
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle()

    if (error || !profile) {
      return false
    }

    return profile.is_admin === true
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

/**
 * Requires admin access for API route execution.
 * 
 * Validates user authentication and admin status. Returns user data if authorized,
 * or error response (401/403) if not. Used as guard in admin API routes.
 * Side effects: Session read, DB read (profiles).
 * 
 * @returns Success result with user data, or error response
 */
export async function requireAdmin(): Promise<
  | { success: true; user: { id: string; email?: string }; isAdmin: boolean }
  | { success: false; response: NextResponse }
> {
  const user = await getSupabaseUser()

  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const userIsAdmin = await isAdmin(user.id)

  if (!userIsAdmin) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
    }
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
    isAdmin: true,
  }
}


