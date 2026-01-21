import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's workspace tier
    const { data: workspace } = await supabaseAdmin
      .from('workspaces')
      .select('subscription_tier')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    if (workspace) {
      return NextResponse.json({ tier: workspace.subscription_tier })
    }

    // Fallback to profile tier
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ tier: profile?.subscription_tier || 'free' })
  } catch (error: any) {
    console.error('Error fetching user tier:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

