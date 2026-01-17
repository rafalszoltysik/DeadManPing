import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
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

  if (!code) {
    console.error('No OAuth code in callback URL')
    const loginUrl = new URL('/auth/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'No authentication code received')
    return NextResponse.redirect(loginUrl)
  }

  // Create response object for setting cookies - will be used for redirect
  const response = NextResponse.redirect(new URL(redirect, requestUrl.origin))

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
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
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
        .select('id')
        .eq('id', user.id)
        .single()

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
        }
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
        }
      }
    }
  }

  // Return response with cookies already set
  return response
}

