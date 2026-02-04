/**
 * User registration endpoint for email/password signup.
 * 
 * Creates new user account with Supabase Auth, validates password strength,
 * checks for existing accounts, creates profile with trial status, and manages
 * email verification flow. Integrates with Supabase, PostHog analytics, and Sentry.
 * 
 * Does not handle OAuth signup - see google route for OAuth registration.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { validatePassword } from '@/lib/password-validator'
import { checkRateLimit } from '@/lib/rate-limit'
import { captureSignupCompleted, captureSignupFailed } from '@/lib/posthog/server'
import { getAppUrl } from '@/lib/get-app-url'
import { captureBackendError, captureApiError } from '@/lib/sentry/server'

/**
 * Creates a new user account with email and password.
 * 
 * Validates password strength, checks for existing accounts, creates Supabase Auth
 * user and profile record, and establishes session. Handles email confirmation flow.
 * Side effects: DB write (profiles), Supabase Auth user creation, analytics events.
 * 
 * @param request - HTTP request with email, password, and optional redirect in JSON body
 * @returns Response with success status, redirect URL, and email confirmation requirement
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect = '/dashboard' } = await request.json()
    
    // Create response object for setting cookies
    const response = NextResponse.json({ success: true, redirect })
    
    // Create Supabase client with proper cookie handling for route handlers
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
                httpOnly: options?.httpOnly ?? true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
              })
            })
          },
        },
      }
    )

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Rate limiting: per IP (5 seconds) and per email (1 minute)
    // IP limit is very short to allow legitimate users to try different emails quickly
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const ipKey = `signup:ip:${clientIp}`
    const emailKey = `signup:email:${email.toLowerCase().trim()}`
    
    const ipRateLimit = await checkRateLimit(ipKey, 5000) // 5 seconds - allows quick retries with different emails
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const emailRateLimit = await checkRateLimit(emailKey, 60000) // 1 minute per email
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts for this email. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join('. ') },
        { status: 400 }
      )
    }

    // Check if email already exists in profiles (from OAuth or previous signup)
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
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existingProfile) {
      // Email already exists - suggest linking accounts
      return NextResponse.json(
        { 
          error: 'An account with this email already exists. Please sign in or use "Link accounts" if you signed up with Google.',
          existingAccount: true,
          canLink: true
        },
        { status: 409 }
      )
    }

    // Create user with Supabase auth
    // Note: signUp() may not return a session if email confirmation is required
    // But it will still set cookies if auto-confirm is enabled
    const baseUrl = getAppUrl()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (authError || !authData.user) {
      // Track signup failed
      const userId = authData.user?.id || 'unknown'
      await captureSignupFailed(userId, {
        method: 'email',
        reason: authError?.message?.toLowerCase().includes('validation') ? 'validation' : 'unknown',
      })
      
      // Translate common Supabase error messages to English
      let errorMessage = authError?.message || 'Failed to create account'
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in.'
      } else if (errorMessage.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many signup attempts. Please try again later.'
      } else if (errorMessage.includes('Password')) {
        errorMessage = 'Invalid password. Please check your password requirements.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    // Check if we have a session (may be null if email confirmation is required)
    const { data: { session } } = await supabase.auth.getSession()
    const hasSession = !!(session || authData.session)
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Signup result:', {
        hasUser: !!authData.user,
        hasSession: !!authData.session,
        hasSessionFromGet: !!session,
        userId: authData.user?.id,
        requiresEmailConfirmation: !hasSession,
      })
    }

    const userId = authData.user.id
    const emailVerified = authData.user.email_confirmed_at ? true : false

    // Check if profile already exists (created by trigger or previous attempt)
    const { data: existingProfileById } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfileById) {
      // Create profile if it doesn't exist
      const { error: profileError } = await serviceClient
        .from('profiles')
        .insert({
          id: userId,
          email: authData.user.email!.toLowerCase().trim(),
          email_verified: emailVerified,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

      if (profileError) {
        console.error('Error creating profile:', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
          userId,
          email: authData.user.email,
        })
        
        // Track signup failed
        await captureSignupFailed(userId, {
          method: 'email',
          reason: 'unknown',
        })
        
        captureBackendError(profileError, {
          endpoint: '/api/auth/signup',
          statusCode: 500,
          userId: userId,
          action: 'create_profile',
          additionalData: {
            email: authData.user.email,
          },
        })
        
        // Return error - profile creation is critical
        return NextResponse.json(
          { error: 'Failed to create user profile. Please try again or contact support.' },
          { status: 500 }
        )
      }
    } else {
      // Profile exists, update email_verified if needed
      if (emailVerified) {
        await serviceClient
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', userId)
      }
    }

    // Track signup completed (after successful profile creation)
    await captureSignupCompleted(userId, {
      method: 'email',
    })

    // Supabase Auth automatically creates and manages the session via cookies
    // Supabase Auth automatically creates and manages the session via cookies
    // The response object already has cookies set from the signUp() call above
    // We need to return the response with the updated JSON body
    // Create a new response with JSON body and copy all cookies
    const finalResponse = NextResponse.json({ 
      success: true, 
      redirect: hasSession ? redirect : null, // Only redirect if we have a session
      requiresEmailConfirmation: !hasSession,
      email: authData.user?.email,
    })
    
    // Copy all cookies from the original response
    // This is critical - cookies contain the session and must be preserved
    const allCookies = response.cookies.getAll()
    allCookies.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    })
    
    // Debug: log cookies to verify they're being set
    if (process.env.NODE_ENV === 'development') {
      console.log('Signup cookies being set:', allCookies.map(c => c.name))
    }
    
    return finalResponse
  } catch (error: any) {
    console.error('Signup error:', error)
    
    // Track signup failed (try to get userId from request if available)
    try {
      const body = await request.json().catch(() => ({}))
      const email = body.email || 'unknown'
      // Use email as distinctId if we don't have userId
      await captureSignupFailed(email, {
        method: 'email',
        reason: 'unknown',
      })
      
      captureBackendError(error, {
        endpoint: '/api/auth/signup',
        statusCode: 500,
        action: 'signup',
        additionalData: {
          email,
        },
      })
    } catch {
      // Silently fail analytics, but still track error
      captureBackendError(error, {
        endpoint: '/api/auth/signup',
        statusCode: 500,
        action: 'signup',
      })
    }
    
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    )
  }
}

