import { NextRequest, NextResponse } from 'next/server'
import { getGoogleUserInfo } from '@/lib/auth/google-oauth'
import { createSession } from '@/lib/auth/session'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const state = requestUrl.searchParams.get('state')
  const error = requestUrl.searchParams.get('error')

  if (error) {
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', error)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'No authorization code received')
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Get user info from Google
    const googleUser = await getGoogleUserInfo(code)

    // Parse redirect from state
    let redirect = '/dashboard'
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        redirect = stateData.redirect || '/dashboard'
      } catch {
        // Invalid state, use default
      }
    }

    // Check if user exists in Supabase
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email, email_verified')
      .eq('email', googleUser.email)
      .maybeSingle()

    let userId: string
    let emailVerified = googleUser.emailVerified

    if (existingUser) {
      // User exists, use existing ID
      userId = existingUser.id
      
      // Update email verification status if needed
      if (googleUser.emailVerified && !existingUser.email_verified) {
        await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', userId)
        emailVerified = true
      }
    } else {
      // Create new user
      userId = randomUUID()
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: googleUser.email,
          email_verified: googleUser.emailVerified,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

      if (insertError) {
        console.error('Error creating user:', insertError)
        const loginUrl = new URL('/auth/login', requestUrl.origin)
        loginUrl.searchParams.set('error', 'Failed to create account')
        return NextResponse.redirect(loginUrl)
      }
    }

    // Create session
    await createSession(userId, googleUser.email, emailVerified)

    // Redirect to dashboard or specified redirect
    return NextResponse.redirect(new URL(redirect, requestUrl.origin))
  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', error.message || 'Authentication failed')
    return NextResponse.redirect(loginUrl)
  }
}

