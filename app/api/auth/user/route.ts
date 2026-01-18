import { NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

export async function GET() {
  const user = await getSupabaseUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    emailVerified: !!user.email_confirmed_at,
  })
}

