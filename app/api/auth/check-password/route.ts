/**
 * Password existence check API endpoint.
 * 
 * Checks if authenticated user has a password set (email provider) or only
 * OAuth authentication. Used by settings page to show/hide password change
 * options. Returns list of authentication providers.
 * 
 * Does not validate password - only checks if password exists.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

export const dynamic = 'force-dynamic'

/**
 * Checks if user has password authentication configured.
 * 
 * @param request - HTTP request (unused, but required by Next.js)
 * @returns Password existence status and authentication providers
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has a password
    // In Supabase, if user was created via OAuth, they might not have encrypted_password
    // We can check by looking at the user's identities
    // If user has email provider in identities, they have password
    // If only oauth provider, they don't have password yet
    
    const hasPassword = user.identities?.some((identity: any) => identity.provider === 'email') || false

    return NextResponse.json({ 
      hasPassword,
      providers: user.identities?.map((i: any) => i.provider) || []
    })
  } catch (error: any) {
    console.error('Check password error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check password' },
      { status: 500 }
    )
  }
}

