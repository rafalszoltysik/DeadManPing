import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

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

