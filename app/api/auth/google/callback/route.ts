import { NextRequest, NextResponse } from 'next/server'
import { getGoogleUserInfo } from '@/lib/auth/google-oauth'
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

    // Check if email already exists in profiles (from email/password signup)
    // Normalize email to lowercase for comparison
    const normalizedEmail = googleUser.email.toLowerCase().trim()
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, email_verified')
      .eq('email', normalizedEmail) // After migration 014, emails are normalized to lowercase
      .maybeSingle()

    let userId: string
    let emailVerified = googleUser.emailVerified
    let accountLinked = false

    if (existingProfile) {
      // Email exists - check if it's from email/password signup (has auth.users entry)
      // Check if this profile ID exists in auth.users (meaning it's an email/password account)
      const { data: authUser } = await supabase.auth.admin.getUserById(existingProfile.id)
      
      // If auth user exists, this means the account was created with email/password
      // Check if this is FIRST TIME linking (user had only email provider before)
      if (authUser?.user) {
        // Check if user already has Google identity provider
        // If user already has Google identity, accounts are already linked (don't show banner)
        const hasGoogleIdentity = authUser.user.identities?.some(
          (identity: any) => identity.provider === 'google'
        ) || false
        
        // Only set accountLinked if user doesn't have Google identity yet (first-time linking)
        if (!hasGoogleIdentity) {
          accountLinked = true
        }
      }
      
      // We'll use the existing profile ID and link the accounts
      userId = existingProfile.id
      
      // Update email verification status if needed
      if (googleUser.emailVerified && !existingProfile.email_verified) {
        await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', userId)
        emailVerified = true
      }
      
      // Note: Accounts are automatically linked by using the same profile ID
      // If user signed up with email/password, they can now also login with Google
    } else {
      // Create new user profile
      userId = randomUUID()
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: normalizedEmail,
          email_verified: googleUser.emailVerified,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

      if (insertError) {
        // Check if it's a unique constraint violation (email already exists)
        if (insertError.code === '23505' || insertError.message?.includes('unique')) {
          // Email exists but we didn't find it (race condition) - try to find it again
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('id, email, email_verified')
            .eq('email', normalizedEmail)
            .maybeSingle()
          
          if (retryProfile) {
            userId = retryProfile.id
            emailVerified = googleUser.emailVerified || retryProfile.email_verified
          } else {
            console.error('Error creating user - email conflict:', insertError)
            const loginUrl = new URL('/auth/login', requestUrl.origin)
            loginUrl.searchParams.set('error', 'An account with this email already exists. Please sign in with your password.')
            return NextResponse.redirect(loginUrl)
          }
        } else {
          console.error('Error creating user:', insertError)
          const loginUrl = new URL('/auth/login', requestUrl.origin)
          loginUrl.searchParams.set('error', 'Failed to create account')
          return NextResponse.redirect(loginUrl)
        }
      }
    }

    // Supabase Auth automatically creates and manages the session via cookies
    // No need for custom JWT session - middleware uses Supabase auth directly

    // Redirect to dashboard or specified redirect
    const redirectUrl = new URL(redirect, requestUrl.origin)
    
    // Add account linked parameter if accounts were linked
    if (accountLinked) {
      redirectUrl.searchParams.set('accountLinked', 'true')
    }
    
    return NextResponse.redirect(redirectUrl)
  } catch (error: any) {
    console.error('Google OAuth callback error:', error)
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', error.message || 'Authentication failed')
    return NextResponse.redirect(loginUrl)
  }
}

