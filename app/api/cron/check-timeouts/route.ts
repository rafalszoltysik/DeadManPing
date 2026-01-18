import { NextRequest } from 'next/server'
import { compareSecrets } from '@/lib/security'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/api/auth'
import { shouldMarkAsLate, shouldMarkAsFailed } from '@/lib/monitor-utils'
import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/api/response'

// Force dynamic rendering - cron jobs should never be cached
export const dynamic = 'force-dynamic'

// This endpoint can be called by Vercel Cron Jobs
export async function GET(request: NextRequest) {
  // Verify cron secret (set in Vercel environment variables)
  const authHeader = request.headers.get('authorization')
  
  if (!verifyCronSecret(authHeader)) {
    console.error('[Cron] Unauthorized - missing or invalid CRON_SECRET', {
      hasAuthHeader: !!authHeader,
      hasCronSecret: !!process.env.CRON_SECRET,
      authHeaderPrefix: authHeader?.substring(0, 20) || 'none',
    })
    return unauthorizedResponse('Invalid or missing CRON_SECRET')
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const now = new Date()
    const nowISO = now.toISOString()

    // Get all active monitors (exclude paused, but include late to check if they should become failed)
    const { data: allMonitors, error: fetchError } = await supabaseAdmin
      .from('monitors')
      .select('*')
      .neq('status', 'paused') as { data: any[] | null; error: any }

    if (fetchError) {
      console.error('Error fetching monitors:', fetchError)
      return errorResponse('Failed to fetch monitors', 500)
    }

    if (!allMonitors || allMonitors.length === 0) {
      return successResponse({ checked: 0, updated: 0 })
    }

    // Check each monitor to see if it's overdue
    const lateMonitors = allMonitors.filter((monitor) => shouldMarkAsLate(monitor, now))
    const failedMonitors = allMonitors.filter((monitor) => shouldMarkAsFailed(monitor, now))

    let updatedCount = 0

    // Update monitors to 'late' status
    for (const monitor of lateMonitors) {
      const { error: updateError } = await (supabaseAdmin
        .from('monitors') as any)
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
      } as any)

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
      const { error: updateError } = await (supabaseAdmin
        .from('monitors') as any)
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
      } as any)

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
      return successResponse({ checked: allMonitors.length, updated: 0 })
    }

    return successResponse({ 
      checked: allMonitors.length, 
      updated: updatedCount,
      late: lateMonitors.length,
      failed: failedMonitors.length
    })
  } catch (error: any) {
    console.error('Error in check-timeouts:', error)
    return errorResponse(error.message, 500)
  }
}

