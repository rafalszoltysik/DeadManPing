/**
 * Admin users management API endpoint.
 * 
 * Provides paginated list of all users with search functionality. Requires admin
 * privileges. Used by admin dashboard for user management. Supports pagination
 * and search by email or user ID.
 * 
 * Does not handle user creation or deletion - only listing and search.
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Retrieves paginated list of users with optional search.
 * 
 * Requires admin privileges. Supports pagination (page, limit) and search by
 * email or user ID. Side effects: DB read (profiles table).
 * 
 * @param request - HTTP request with search params (page, limit, search)
 * @returns Paginated user list or error response
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) {
      return authResult.response
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('profiles')
      .select('id, email, is_admin, subscription_tier, subscription_status, created_at, email_verified', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in admin users API:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


