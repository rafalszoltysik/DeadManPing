import { NextRequest } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { successResponse, errorResponse } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getSupabaseUser()
    
    if (!user || !user.email) {
      return successResponse({ email: null })
    }

    return successResponse({ email: user.email })
  } catch (error) {
    console.error('Error fetching user email:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
}

