import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth/session'
import { checkMonitorLimit, checkIntervalLimit } from '@/lib/limits'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { intervalSeconds } = body

    // Check monitor limit
    const monitorLimit = await checkMonitorLimit(session.userId)
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
      const intervalLimit = await checkIntervalLimit(session.userId, intervalSeconds)
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

