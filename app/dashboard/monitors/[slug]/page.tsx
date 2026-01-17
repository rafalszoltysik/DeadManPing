import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { MonitorDetail } from '@/components/MonitorDetail'

// Use admin client to bypass RLS, but we'll verify ownership via our session
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

  // Use admin client to fetch monitor (bypasses RLS)
  // We verify ownership by checking user_id matches session
  const { data: monitor, error } = await supabaseAdmin
    .from('monitors')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching monitor:', error)
    redirect('/dashboard')
  }

  if (!monitor) {
    console.error('Monitor not found for slug:', slug)
    redirect('/dashboard')
  }

  // Verify ownership - check workspace membership
  if (monitor.workspace_id) {
    const { data: member } = await supabaseAdmin
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', monitor.workspace_id)
      .eq('user_id', session.userId)
      .single()

    if (!member) {
      // Check if user is workspace owner
      const { data: workspace } = await supabaseAdmin
        .from('workspaces')
        .select('owner_id')
        .eq('id', monitor.workspace_id)
        .single()

      if (!workspace || workspace.owner_id !== session.userId) {
        console.error('Access denied: User is not a member of this workspace')
        redirect('/dashboard')
      }
    }
  } else {
    // Legacy: check user_id directly
    if (monitor.user_id !== session.userId) {
      console.error('Access denied: Monitor belongs to different user')
      redirect('/dashboard')
    }
  }

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

