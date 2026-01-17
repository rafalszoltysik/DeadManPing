import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { compareSecrets } from '@/lib/security'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// This endpoint can be called by Vercel Cron Jobs
export async function GET(request: NextRequest) {
  // Verify cron secret (set in Vercel environment variables)
  // Use timing-safe comparison to prevent timing attacks
  const authHeader = request.headers.get('authorization')
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
  
  if (!authHeader || !compareSecrets(authHeader, expectedAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date().toISOString()

    // Find monitors that are overdue (exclude paused monitors)
    const { data: overdueMonitors, error } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .lt('next_expected_ping_at', now)
      .neq('status', 'late')
      .neq('status', 'failed')
      .neq('status', 'paused')

    if (error) {
      console.error('Error fetching overdue monitors:', error)
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 })
    }

    if (!overdueMonitors || overdueMonitors.length === 0) {
      return NextResponse.json({ checked: 0, updated: 0 })
    }

    // Update status to 'late' and trigger alerts
    let updatedCount = 0
    for (const monitor of overdueMonitors) {
      const { error: updateError } = await supabaseAdmin
        .from('monitors')
        .update({ status: 'late', updated_at: now })
        .eq('id', monitor.id)

      if (updateError) {
        console.error(`Error updating monitor ${monitor.id}:`, updateError)
        continue
      }

      updatedCount++

      // Trigger alert
      try {
        await fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({
            monitor_id: monitor.id,
            alert_type: 'missing',
          }),
        })
      } catch (alertError) {
        console.error(`Error triggering alert for monitor ${monitor.id}:`, alertError)
      }
    }

    return NextResponse.json({ checked: overdueMonitors.length, updated: updatedCount })
  } catch (error: any) {
    console.error('Error in check-timeouts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

