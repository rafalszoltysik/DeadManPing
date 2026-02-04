/**
 * Admin status toggle API endpoint.
 * 
 * Allows administrators to grant or revoke admin privileges for other users.
 * Prevents admins from modifying their own admin status. Updates user profile
 * with admin flag. Requires admin authentication.
 * 
 * Does not handle workspace admin roles - only application admin status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Toggles admin status for specified user.
 * 
 * Updates user profile with admin flag. Side effects: DB write (profiles table).
 * 
 * @param request - HTTP request with is_admin boolean in JSON body
 * @param params - Route parameters with user ID
 * @returns Update result
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Prevent admin from removing their own admin status
    if (id === authResult.user.id) {
      return NextResponse.json(
        { error: 'Cannot modify your own admin status' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get current admin status
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', id)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Toggle admin status
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_admin: !profile.is_admin })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating admin status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update admin status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: updatedProfile,
    })
  } catch (error: any) {
    console.error('Error in toggle admin API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


