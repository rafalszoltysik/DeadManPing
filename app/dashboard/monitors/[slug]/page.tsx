import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { MonitorDetail } from '@/components/MonitorDetail'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyMonitorAccessBySlug } from '@/lib/api/monitors'

export default async function MonitorDetailPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ onboarding?: string }>
}) {
  // Unwrap params immediately to avoid React serialization issues
  const params = await props.params
  const searchParams = await props.searchParams
  const { slug } = params
  const resolvedSearchParams = searchParams
  const session = await verifySession()

  if (!session) {
    redirect('/auth/login')
  }

  // Verify monitor access (checks workspace membership)
  const accessResult = await verifyMonitorAccessBySlug(slug, session.userId)
  
  if (!accessResult.success) {
    redirect('/dashboard')
  }

  const monitor = accessResult.monitor

  const supabaseAdmin = getSupabaseAdmin()
  const { data: pings } = await supabaseAdmin
    .from('pings')
    .select('*')
    .eq('monitor_id', monitor.id)
    .order('received_at', { ascending: false })
    .limit(50)

  const isOnboarding = resolvedSearchParams.onboarding === 'true'
  const pingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ping/${monitor.slug}`

  return (
    <MonitorDetail
      monitor={monitor}
      pings={pings || []}
      pingUrl={pingUrl}
      isOnboarding={isOnboarding}
    />
  )
}

