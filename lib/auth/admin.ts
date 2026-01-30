import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

/**
 * Check if a user is an admin
 * @param userId - User ID to check
 * @returns Promise<boolean> - true if user is admin, false otherwise
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
 * Require admin access in API routes
 * Returns user and admin status if authorized, or error response if not
 * @returns Promise with success status, user, and admin status, or error response
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


