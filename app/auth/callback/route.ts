/**
 * OAuth and email verification callback handler.
 * 
 * Handles callbacks from Google OAuth, email verification, and account linking.
 * Processes OAuth codes, verifies email tokens, creates/updates user profiles,
 * and manages workspace invitations. Redirects users to appropriate pages
 * (dashboard, invitation acceptance, account linking confirmation).
 * 
 * Does not initiate OAuth - see /api/auth/google for that.
 */

import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { captureSignupCompleted } from '@/lib/posthog/server'

/**
 * Handles email verification token processing.
 * 
 * Verifies OTP token, creates/updates user profile, and sets session cookies.
 * Side effects: Supabase Auth API calls, DB writes (profiles), cookie setting.
 * 
 * @param request - HTTP request
 * @param requestUrl - Request URL object
 * @param token - Email verification token
 * @param redirect - Redirect URL after verification
 * @returns Redirect response with session cookies
 */
async function handleEmailVerification(
  request: NextRequest,
  requestUrl: URL,
  token: string,
  redirect: string
) {
  // Get redirect URL from query params or use default
  const redirectParam = requestUrl.searchParams.get('redirect') || redirect || '/dashboard'
  const finalRedirectUrl = new URL(redirectParam, requestUrl.origin)
  const response = NextResponse.redirect(finalRedirectUrl)

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: 'lax',
              secure: requestUrl.protocol === 'https:',
              path: '/',
            })
          })
        },
      },
    }
  )

  // Verify the email token
  // Supabase email verification links use token_hash parameter
  // We need to verify the OTP token
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'signup',
  })

  // If verifyOtp doesn't work with token_hash, try alternative approach
  // Some Supabase setups use a different verification method
  if (verifyError && verifyError.message?.includes('token')) {
    // Try using the token directly as a code (some Supabase versions use this)
    const { data: codeData, error: codeError } = await supabase.auth.exchangeCodeForSession(token)
    
    if (!codeError && codeData?.session) {
      // Successfully exchanged token for session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Ensure profile exists and is verified
        const serviceClient = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        )

        const { data: existingProfile } = await serviceClient
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle()

        if (!existingProfile) {
          await serviceClient.from('profiles').insert({
            id: user.id,
            email: user.email!.toLowerCase().trim(),
            email_verified: true,
            subscription_tier: 'free',
            subscription_status: 'trialing',
          })
        } else {
          await serviceClient
            .from('profiles')
            .update({ email_verified: true })
            .eq('id', user.id)
        }
        
        // Return response with session cookies already set
        return response
      }
    }
  }

  if (verifyError || !verifyData.user) {
    console.error('Email verification error:', verifyError)
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    
    // Check if token expired
    const isExpired = verifyError?.message?.toLowerCase().includes('expired') || 
                     verifyError?.message?.toLowerCase().includes('invalid') ||
                     verifyError?.message?.toLowerCase().includes('token')
    
    if (isExpired) {
      // Extract email from token if possible, or use a generic message
      loginUrl.searchParams.set('error', 'verification_link_expired')
      loginUrl.searchParams.set('action', 'resend_verification')
    } else {
      loginUrl.searchParams.set('error', verifyError?.message || 'Email verification failed')
    }
    
    return NextResponse.redirect(loginUrl)
  }

  console.log('Email verified successfully, user:', verifyData.user?.email || 'no user')

  // After verification, we should have a session
  // Get the session to ensure it's set in cookies
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.warn('No session after email verification - user may need to sign in')
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'Email verified, but session not created. Please sign in.')
    return NextResponse.redirect(loginUrl)
  }

  // Ensure profile exists
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id, email')
      .eq('id', verifyData.user.id)
      .maybeSingle()

    if (!existingProfile) {
      const { error: profileError } = await serviceClient
        .from('profiles')
        .insert({
          id: verifyData.user.id,
          email: verifyData.user.email!.toLowerCase().trim(),
          email_verified: true,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

      if (profileError) {
        console.error('Profile creation error after email verification:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        })
        // Don't block the flow - user is authenticated
      }
    } else {
      // Update email_verified status
      await serviceClient
        .from('profiles')
        .update({ email_verified: true })
        .eq('id', verifyData.user.id)
    }
  }

  // Return response with session cookies already set by Supabase
  return response
}

/**
 * Handles OAuth and email verification callbacks.
 * 
 * Processes Google OAuth callbacks, email verification links, and account
 * linking. Creates/updates profiles, handles workspace invitations, and
 * tracks signup completion. Side effects: Supabase Auth API calls, DB writes,
 * cookie setting, PostHog tracking, redirects.
 * 
 * @param request - HTTP request with OAuth code or verification token
 * @returns Redirect response to dashboard or invitation page
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const errorParam = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'

  // Check for OAuth errors from provider
  if (errorParam) {
    console.error('OAuth error from provider:', {
      error: errorParam,
      description: errorDescription
    })
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', errorDescription || errorParam || 'Authentication failed')
    return NextResponse.redirect(loginUrl)
  }

  // Handle email verification token (from email confirmation link)
  if (token && type === 'signup') {
    return handleEmailVerification(request, requestUrl, token, redirect)
  }

  // Handle invitation token (from workspace invitation)
  // Redirect to set password page instead of auto-accepting
  if (token && type === 'invite') {
    const workspaceId = requestUrl.searchParams.get('workspace')
    const setPasswordUrl = new URL('/auth/invite/set-password', requestUrl.origin)
    if (workspaceId) {
      setPasswordUrl.searchParams.set('workspace', workspaceId)
    }
    setPasswordUrl.searchParams.set('token', token)
    setPasswordUrl.searchParams.set('type', 'invite')
    return NextResponse.redirect(setPasswordUrl)
  }

  // Check if this is an invitation flow (redirect contains /auth/invite/set-password)
  const redirectParam = requestUrl.searchParams.get('redirect')
  const isInvitationFlow = redirectParam?.includes('/auth/invite/set-password')
  
  // For invitation flow, if we have a code, exchange it and redirect to set-password
  if (isInvitationFlow && code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, {
                ...options,
                httpOnly: true,
                sameSite: 'lax',
                secure: requestUrl.protocol === 'https:',
                path: '/',
              })
            })
          },
        },
      }
    )

    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session in invitation flow:', exchangeError)
      const loginUrl = new URL('/auth/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'Invalid or expired invitation code')
      return NextResponse.redirect(loginUrl)
    }

    // Redirect to set-password page with session already set
    if (redirectParam) {
      return NextResponse.redirect(new URL(redirectParam, requestUrl.origin))
    }
  }

  if (!code && !isInvitationFlow) {
    console.error('No OAuth code in callback URL')
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'No authentication code received')
    return NextResponse.redirect(loginUrl)
  }

  // Create response object for setting cookies - will be used for redirect
  // We'll update the redirect URL later if needed (e.g., for account linking)
  let finalRedirectUrl = new URL(redirect, requestUrl.origin)
  const response = NextResponse.redirect(finalRedirectUrl)

  // Create Supabase client with proper cookie handling for route handlers
  // @supabase/ssr v0.5.2 automatically handles PKCE code verifier when cookies are provided
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return all cookies including PKCE code verifier
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // Set cookies in both request and response
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, {
              ...options,
              // Ensure cookies are accessible for PKCE
              httpOnly: false, // PKCE code verifier needs to be accessible
              sameSite: 'lax',
              secure: requestUrl.protocol === 'https:',
              path: '/',
            })
          })
        },
      },
    }
  )

  if (code) {
    console.log('OAuth callback received, exchanging code for session...')
    const { data: sessionData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', {
        message: exchangeError.message,
        status: exchangeError.status,
        error: exchangeError
      })
      // Redirect to login with error
      const loginUrl = new URL('/auth/login', requestUrl.origin)
      loginUrl.searchParams.set('error', exchangeError.message || 'Failed to complete authentication')
      return NextResponse.redirect(loginUrl)
    }

    console.log('Code exchanged successfully, user:', sessionData?.user?.email || 'no user')

    // Get user after session exchange
    // Try to get user from session first, then fallback to getUser
    let user = sessionData?.user || null
    
    if (!user) {
      const {
        data: { user: fetchedUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error('Error getting user:', {
          message: userError.message,
          status: userError.status,
          error: userError
        })
        const loginUrl = new URL('/auth/login', requestUrl.origin)
        loginUrl.searchParams.set('error', userError.message || 'Failed to get user information')
        return NextResponse.redirect(loginUrl)
      }

      if (fetchedUser) {
        user = fetchedUser
      }
    }

    if (!user) {
      console.error('No user found after session exchange')
      const loginUrl = new URL('/auth/login', requestUrl.origin)
      loginUrl.searchParams.set('error', 'Failed to get user information')
      return NextResponse.redirect(loginUrl)
    }

    // Supabase Auth automatically creates and manages the session via cookies
    // No need for custom JWT session - middleware uses Supabase auth directly

    // Create profile if it doesn't exist (for OAuth users)
    // Use service role to bypass RLS for profile creation
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { data: existingProfile } = await serviceClient
        .from('profiles')
        .select('id, email')
        .eq('id', user.id)
        .single()

      // Check if this is FIRST TIME account linking (user signed up with email/password, now FIRST TIME logging in with Google)
      // Account linking happens when:
      // 1. Profile exists (user was created with email/password)
      // 2. User has 'email' provider in identities (meaning they have a password)
      // 3. User is now logging in with Google (has 'google' provider)
      // 4. This is the FIRST TIME - Google identity was just created (within last 30 seconds)
      const hasEmailProvider = user.identities?.some((identity: any) => identity.provider === 'email') || false
      const hasGoogleProvider = user.identities?.some((identity: any) => identity.provider === 'google') || false
      
      // Check if this is first-time account linking
      // If user already has both providers but Google identity was created a while ago, 
      // accounts are already linked (don't show banner)
      let isFirstTimeAccountLinking = false
      if (existingProfile && hasEmailProvider && hasGoogleProvider) {
        // User has both providers now - check if Google identity was just created
        const googleIdentity = user.identities?.find((identity: any) => identity.provider === 'google')
        
        // If Google identity was created very recently (within last 30 seconds), it's first-time linking
        if (googleIdentity?.created_at) {
          const googleCreatedAt = new Date(googleIdentity.created_at)
          const now = new Date()
          const secondsSinceGoogleCreated = (now.getTime() - googleCreatedAt.getTime()) / 1000
          
          // If Google identity was created within last 30 seconds, it's first-time linking
          if (secondsSinceGoogleCreated < 30) {
            isFirstTimeAccountLinking = true
          }
        } else {
          // If created_at is not available, assume it's first-time linking if user has exactly 2 identities
          // (email + google) and profile exists - this is a fallback
          const identityCount = user.identities?.length || 0
          if (identityCount === 2) {
            isFirstTimeAccountLinking = true
          }
        }
      }

      if (!existingProfile) {
        const { error: profileError } = await serviceClient
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email!,
            subscription_tier: 'free',
            subscription_status: 'trialing',
          })

        if (profileError) {
          console.error('Profile creation error:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          })
          // Don't block the flow - user is authenticated, profile might be created later
        } else {
          // Track signup completed for OAuth (new user)
          await captureSignupCompleted(user.id, {
            method: 'google',
          })
        }
      } else if (isFirstTimeAccountLinking) {
        // Add account linked parameter to redirect URL only for first-time linking
        finalRedirectUrl.searchParams.set('accountLinked', 'true')
        // Update response URL (preserving cookies from Supabase Auth)
        response.headers.set('Location', finalRedirectUrl.toString())
        return response
      }
    } else {
      // Fallback: try with regular client (might fail due to RLS)
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email!,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

        if (profileError) {
          console.error('Profile creation error (fallback):', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          })
        } else {
          // Track signup completed for OAuth (new user, fallback path)
          await captureSignupCompleted(user.id, {
            method: 'google',
          })
        }
      }
    }
  }

  // Return response with cookies already set (Supabase Auth manages session cookies automatically)
  // Update response URL if it was changed (e.g., for account linking)
  if (finalRedirectUrl.toString() !== new URL(redirect, requestUrl.origin).toString()) {
    response.headers.set('Location', finalRedirectUrl.toString())
  }
  return response
}

