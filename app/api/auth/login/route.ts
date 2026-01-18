import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { checkRateLimit } from '@/lib/rate-limit'

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

    // Rate limiting: 5 attempts per minute per IP and per email
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const ipKey = `login:ip:${clientIp}`
    const emailKey = `login:email:${email.toLowerCase().trim()}`
    
    const ipRateLimit = await checkRateLimit(ipKey, 60000) // 1 minute
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const emailRateLimit = await checkRateLimit(emailKey, 60000) // 1 minute
    if (!emailRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts for this email. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if user exists before attempting login
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

    // Check if user exists by looking up in profiles table
    // This is more efficient than querying all users from auth
    const normalizedEmail = email.toLowerCase().trim()
    
    // Check profiles table to see if account exists
    const { data: existingProfileCheck } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    // Verify password with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      // Determine if user exists based on profile check
      // If profile exists, user exists but password is wrong
      // If profile doesn't exist, account likely doesn't exist
      if (existingProfileCheck) {
        // Profile exists, so user exists but password is wrong
        return NextResponse.json(
          { error: 'Nieprawidłowe hasło. Sprawdź hasło lub użyj opcji "Zapomniałem hasła".' },
          { status: 401 }
        )
      } else {
        // No profile found - account likely doesn't exist
        // Note: There's a small edge case where user exists in auth but not in profiles,
        // but this is rare and will be handled by creating profile on successful login
        return NextResponse.json(
          { error: 'Nie ma takiego konta. Sprawdź adres email lub utwórz nowe konto.' },
          { status: 401 }
        )
      }
    }

    // Get or create profile (serviceClient already created above)

    const { data: existingProfile } = await serviceClient
      .from('profiles')
      .select('id, email, email_verified')
      .eq('email', email)
      .maybeSingle()

    let userId: string
    let emailVerified = authData.user.email_confirmed_at ? true : false

    if (existingProfile) {
      userId = existingProfile.id
      // Update email verification status if needed
      if (emailVerified && !existingProfile.email_verified) {
        await serviceClient
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', userId)
        emailVerified = true
      }
    } else {
      // Create new profile
      userId = authData.user.id
      const { error: insertError } = await serviceClient
        .from('profiles')
        .insert({
          id: userId,
          email: authData.user.email!,
          email_verified: emailVerified,
          subscription_tier: 'free',
          subscription_status: 'trialing',
        })

      if (insertError) {
        console.error('Error creating profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }
    }

    // Supabase Auth automatically creates and manages the session via cookies
    // The response object already has cookies set from the signInWithPassword() call above
    // Create a new response with JSON body and copy all cookies with their options
    const finalResponse = NextResponse.json({ success: true, redirect })
    
    // Copy all cookies from the original response (they were set by Supabase during signIn)
    response.cookies.getAll().forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    })
    return finalResponse
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

