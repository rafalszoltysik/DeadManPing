/// <reference path="../deno.d.ts" />
// @ts-ignore - Deno URL imports are valid in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const internalApiSecret = Deno.env.get('INTERNAL_API_SECRET')!
    const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find monitors that are overdue (next_expected_ping_at < NOW() AND status != 'late')
    const now = new Date().toISOString()
    const { data: overdueMonitors, error } = await supabase
      .from('monitors')
      .select('*')
      .lt('next_expected_ping_at', now)
      .neq('status', 'late')
      .neq('status', 'failed')

    if (error) {
      console.error('Error fetching overdue monitors:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch monitors' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!overdueMonitors || overdueMonitors.length === 0) {
      return new Response(
        JSON.stringify({ checked: 0, updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update status to 'late' and trigger alerts
    let updatedCount = 0
    for (const monitor of overdueMonitors) {
      const { error: updateError } = await supabase
        .from('monitors')
        .update({ status: 'late', updated_at: now })
        .eq('id', monitor.id)

      if (updateError) {
        console.error(`Error updating monitor ${monitor.id}:`, updateError)
        continue
      }

      updatedCount++

      // Trigger alert asynchronously
      try {
        const alertResponse = await fetch(`${appUrl}/api/internal/send-alert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Secret': internalApiSecret,
          },
          body: JSON.stringify({
            monitor_id: monitor.id,
            alert_type: 'missing',
          }),
        })

        if (!alertResponse.ok) {
          console.error(`Failed to trigger alert for monitor ${monitor.id}`)
        }
      } catch (alertError) {
        console.error(`Error triggering alert for monitor ${monitor.id}:`, alertError)
      }
    }

    return new Response(
      JSON.stringify({ checked: overdueMonitors.length, updated: updatedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in check-timeouts:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

