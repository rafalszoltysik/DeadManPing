import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/auth/google-oauth'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirect = searchParams.get('redirect') || '/dashboard'

  // Store redirect URL in state for later use
  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64')
  
  const authUrl = getGoogleAuthUrl(state)

  return NextResponse.redirect(authUrl)
}

