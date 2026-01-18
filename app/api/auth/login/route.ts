import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
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

    // Verify password with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get or create profile
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
    // No need for custom JWT session - middleware uses Supabase auth directly

    return NextResponse.json({ success: true, redirect })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

