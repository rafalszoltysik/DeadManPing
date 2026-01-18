import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Use Supabase client with cookie-based session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Failed to get user information' },
        { status: 401 }
      )
    }

    // Verify that the user ID matches the session
    if (user.id !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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

