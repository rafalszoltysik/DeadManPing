/**
 * API route for fetching current authenticated user information.
 * 
 * Returns user ID, email, and email verification status. Used by frontend
 * to display user info and check authentication state.
 * 
 * Does not handle authentication - only returns current user data.
 */

import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

/**
 * Returns current authenticated user information.
 * 
 * Side effects: Session read (Supabase cookies).
 * 
 * @returns User data (id, email, emailVerified) or 401 if not authenticated
 */
export async function GET() {
  const user = await getSupabaseUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at,
  })
}

