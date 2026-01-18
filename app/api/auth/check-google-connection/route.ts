import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

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

