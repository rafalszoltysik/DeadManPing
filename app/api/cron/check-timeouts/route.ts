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
    const now = new Date()
    const nowISO = now.toISOString()

    // Get all active monitors (exclude paused, but include late to check if they should become failed)
    const { data: allMonitors, error: fetchError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .neq('status', 'paused')

    if (fetchError) {
      console.error('Error fetching monitors:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch monitors' }, { status: 500 })
    }

    if (!allMonitors || allMonitors.length === 0) {
      return NextResponse.json({ checked: 0, updated: 0 })
    }

    // Check each monitor to see if it's overdue
    const lateMonitors: typeof allMonitors = []
    const failedMonitors: typeof allMonitors = []
    
    for (const monitor of allMonitors) {
      let referenceTime: Date | null = null
      
      // Determine reference time (when the ping was expected)
      if (monitor.last_ping_at) {
        referenceTime = new Date(monitor.last_ping_at)
      } else if (monitor.status === 'pending' || (monitor.status === 'healthy' && !monitor.last_ping_at)) {
        referenceTime = new Date(monitor.created_at)
      }
      
      if (!referenceTime) {
        continue
      }
      
      const expectedIntervalEnd = new Date(
        referenceTime.getTime() + monitor.expected_interval_seconds * 1000
      )
      const gracePeriodEnd = new Date(
        referenceTime.getTime() + 
        monitor.expected_interval_seconds * 1000 + 
        monitor.grace_period_seconds * 1000
      )
      
      // If grace period is 0, mark as failed immediately after expected interval
      if (monitor.grace_period_seconds === 0) {
        if (now > expectedIntervalEnd) {
          // Mark as failed if not already failed
          if (monitor.status !== 'failed') {
            failedMonitors.push(monitor)
          }
        }
      } else {
        // Check if monitor is in grace period (late)
        if (now > expectedIntervalEnd && now <= gracePeriodEnd) {
          // Only mark as late if not already late or failed
          if (monitor.status !== 'late' && monitor.status !== 'failed') {
            lateMonitors.push(monitor)
          }
        }
        // Check if monitor is past grace period (failed)
        else if (now > gracePeriodEnd) {
          // Mark as failed (can transition from late to failed)
          if (monitor.status !== 'failed') {
            failedMonitors.push(monitor)
          }
        }
      }
    }

    let updatedCount = 0

    // Update monitors to 'late' status
    for (const monitor of lateMonitors) {
      const { error: updateError } = await supabaseAdmin
        .from('monitors')
        .update({ status: 'late', updated_at: nowISO })
        .eq('id', monitor.id)

      if (updateError) {
        console.error(`Error updating monitor ${monitor.id}:`, updateError)
        continue
      }

      updatedCount++

      // Insert ping record for late status
      const { error: pingError } = await supabaseAdmin.from('pings').insert({
        monitor_id: monitor.id,
        status: 'fail',
        message: 'Monitor is late - ping not received within expected interval',
        duration_ms: null,
        metadata: null,
        received_at: nowISO,
      })

      if (pingError) {
        console.error(`Error inserting ping for monitor ${monitor.id}:`, pingError)
      }

      // Trigger alert (warn for late status)
      try {
        await fetch(`${request.nextUrl.origin}/api/internal/send-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
          },
          body: JSON.stringify({
            monitor_id: monitor.id,
            alert_type: 'warn',
          }),
        })
      } catch (alertError) {
        console.error(`Error triggering alert for monitor ${monitor.id}:`, alertError)
      }
    }

    // Update monitors to 'failed' status
    for (const monitor of failedMonitors) {
      const { error: updateError } = await supabaseAdmin
        .from('monitors')
        .update({ status: 'failed', updated_at: nowISO })
        .eq('id', monitor.id)

      if (updateError) {
        console.error(`Error updating monitor ${monitor.id}:`, updateError)
        continue
      }

      updatedCount++

      // Insert ping record for failed status
      const { error: pingError } = await supabaseAdmin.from('pings').insert({
        monitor_id: monitor.id,
        status: 'fail',
        message: 'Monitor failed - ping not received within grace period',
        duration_ms: null,
        metadata: null,
        received_at: nowISO,
      })

      if (pingError) {
        console.error(`Error inserting ping for monitor ${monitor.id}:`, pingError)
      }

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

    if (lateMonitors.length === 0 && failedMonitors.length === 0) {
      return NextResponse.json({ checked: allMonitors.length, updated: 0 })
    }

    return NextResponse.json({ 
      checked: allMonitors.length, 
      updated: updatedCount,
      late: lateMonitors.length,
      failed: failedMonitors.length
    })
  } catch (error: any) {
    console.error('Error in check-timeouts:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

