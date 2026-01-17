import { NextRequest, NextResponse } from 'next/server'
import { sendAlert } from '@/lib/alerts'
import { compareSecrets } from '@/lib/security'

export async function POST(request: NextRequest) {
  // Verify internal secret using timing-safe comparison
  const secret = request.headers.get('x-internal-secret')
  const expectedSecret = process.env.INTERNAL_API_SECRET || ''
  
  if (!secret || !compareSecrets(secret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { monitor_id, alert_type } = body

    if (!monitor_id || !alert_type) {
      return NextResponse.json(
        { error: 'Missing monitor_id or alert_type' },
        { status: 400 }
      )
    }

    if (!['missing', 'failed', 'recovered'].includes(alert_type)) {
      return NextResponse.json(
        { error: 'Invalid alert_type' },
        { status: 400 }
      )
    }

    const result = await sendAlert({ monitor_id, alert_type })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error sending alert:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

