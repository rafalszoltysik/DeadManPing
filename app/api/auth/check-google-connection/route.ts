/**
 * Google OAuth connection check API endpoint.
 * 
 * Checks if authenticated user has Google OAuth linked to their account.
 * Used by settings page to show/hide Google connection options. Uses admin
 * client to access full user identity information.
 * 
 * Does not initiate OAuth - only checks existing connection status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Checks if user has Google OAuth connected.
 * 
 * Side effects: DB read (user identities via admin client).
 * 
 * @param request - HTTP request (unused, but required by Next.js)
 * @returns Google connection status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to get full user info with identities
    const supabaseAdmin = getSupabaseAdmin()
    const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(user.id)

    if (userError || !authUser?.user) {
      console.error('[Check Google Connection] Error fetching user:', userError)
      // Fallback to checking identities from regular user object
      const hasGoogleConnection = user.identities?.some(
        (identity: any) => identity.provider === 'google'
      ) || false
      return NextResponse.json({ hasGoogleConnection })
    }

    // Check if user has Google identity
    const hasGoogleConnection = authUser.user.identities?.some(
      (identity: any) => identity.provider === 'google'
    ) || false

    return NextResponse.json({ hasGoogleConnection })
  } catch (error: any) {
    console.error('[Check Google Connection] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

