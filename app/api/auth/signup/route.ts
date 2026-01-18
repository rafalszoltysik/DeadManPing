import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validatePassword } from '@/lib/password-validator'
import { checkRateLimit } from '@/lib/rate-limit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect = '/dashboard' } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Rate limiting: 3 attempts per minute per IP and per email
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const ipKey = `signup:ip:${clientIp}`
    const emailKey = `signup:email:${email.toLowerCase().trim()}`
    
    const ipRateLimit = await checkRateLimit(ipKey, 60000) // 1 minute
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const emailRateLimit = await checkRateLimit(emailKey, 60000) // 1 minute
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
    const serviceClient = createClient(
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 400 }
      )
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

    // Supabase Auth automatically creates and manages the session via cookies
    // No need for custom JWT session - middleware uses Supabase auth directly

    return NextResponse.json({ success: true, redirect })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: error.message || 'Signup failed' },
      { status: 500 }
    )
  }
}

