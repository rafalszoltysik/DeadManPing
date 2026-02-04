/**
 * API route for checking subscription tier limits.
 * 
 * Validates monitor count and interval limits before monitor creation/update.
 * Used by frontend to show limit warnings and prevent invalid submissions.
 * 
 * Does not enforce limits - only checks and reports current status.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { checkMonitorLimit, checkIntervalLimit } from '@/lib/limits'

export const dynamic = 'force-dynamic'

/**
 * Checks if user is within subscription tier limits.
 * 
 * Validates monitor count and optional interval limits. Returns limit status
 * with current usage. Side effects: DB read (monitor count, tier lookup).
 * 
 * @param request - HTTP request with optional intervalSeconds in body
 * @returns Limit check result with current usage and limits
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSupabaseUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { intervalSeconds } = body

    // Check monitor limit
    const monitorLimit = await checkMonitorLimit(user.id)
    if (!monitorLimit.allowed) {
      return NextResponse.json({
        allowed: false,
        type: 'monitors',
        current: monitorLimit.current,
        limit: monitorLimit.limit,
        tier: monitorLimit.tier,
      })
    }

    // Check interval limit if provided
    if (intervalSeconds !== undefined) {
      const intervalLimit = await checkIntervalLimit(user.id, intervalSeconds)
      if (!intervalLimit.allowed) {
        return NextResponse.json({
          allowed: false,
          type: 'interval',
          minInterval: intervalLimit.minInterval,
          tier: intervalLimit.tier,
        })
      }
    }

    return NextResponse.json({ allowed: true })
  } catch (error: any) {
    console.error('Error checking limits:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

