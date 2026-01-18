import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for middleware to refresh session
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

  // Get user from Supabase session (this also refreshes the session)
  const { data: { user } } = await supabase.auth.getUser()

  // Handle OAuth callback code on homepage - redirect to /auth/callback
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('code')) {
    const callbackUrl = new URL('/auth/callback', request.url)
    // Copy all search params (code, error, etc.) to callback URL
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(callbackUrl)
  }

  // Handle expired OTP token errors from Supabase (redirects to homepage)
  // Check both error_code and error_description
  const errorCode = request.nextUrl.searchParams.get('error_code')
  const errorDescription = request.nextUrl.searchParams.get('error_description')
  if (request.nextUrl.pathname === '/' && 
      (errorCode === 'otp_expired' || 
       errorDescription?.toLowerCase().includes('expired') ||
       errorDescription?.toLowerCase().includes('invalid'))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('error', 'verification_link_expired')
    loginUrl.searchParams.set('action', 'resend_verification')
    return NextResponse.redirect(loginUrl)
  }

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  // BUT allow API routes, OAuth callbacks, logout route, password reset, and forgot password
  // Password reset and forgot password need to allow authenticated users (they may have a recovery session)
  if (request.nextUrl.pathname.startsWith('/auth') && 
      !request.nextUrl.pathname.startsWith('/api') &&
      request.nextUrl.pathname !== '/auth/logout' &&
      request.nextUrl.pathname !== '/auth/callback' &&
      request.nextUrl.pathname !== '/auth/reset-password' &&
      request.nextUrl.pathname !== '/auth/forgot-password' &&
      user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

