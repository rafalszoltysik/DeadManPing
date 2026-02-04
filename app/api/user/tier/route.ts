/**
 * API route for fetching user's subscription tier.
 * 
 * Returns current subscription tier from workspace or profile fallback.
 * Used by frontend to determine feature availability and limits.
 * 
 * Does not handle tier changes - see billing routes for subscription management.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * Creates Supabase admin client for database operations.
 * 
 * @returns Supabase client with service role key
 */
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

/**
 * Returns user's subscription tier.
 * 
 * Checks workspace tier first, falls back to profile tier.
 * Side effects: DB read (workspaces, profiles).
 * 
 * @param request - HTTP request (unused)
 * @returns Subscription tier (free, starter, pro, team)
 */
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

