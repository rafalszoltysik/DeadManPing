import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  return handleLogout(request)
}

export async function GET(request: NextRequest) {
  return handleLogout(request)
}

async function handleLogout(request: NextRequest) {
  const redirectUrl = new URL('/', process.env.NEXT_PUBLIC_APP_URL || request.url)
  const response = NextResponse.redirect(redirectUrl)
  
  // Create Supabase client to sign out
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
            // If value is empty, delete the cookie
            if (!value || value === '') {
              response.cookies.delete(name)
            } else {
              response.cookies.set(name, value, options)
            }
          })
        },
      },
    }
  )

  // Sign out from Supabase (this clears all Supabase auth cookies)
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Logout error:', error)
  }

  // Also manually clear any Supabase-related cookies to ensure complete logout
  const supabaseCookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase.auth.token',
  ]
  
  // Get all cookies and clear any that look like Supabase auth cookies
  request.cookies.getAll().forEach((cookie) => {
    const cookieName = cookie.name
    // Clear cookies that start with supabase auth patterns
    if (
      cookieName.includes('supabase') ||
      cookieName.includes('sb-') ||
      supabaseCookieNames.some(name => cookieName.includes(name))
    ) {
      response.cookies.delete(cookieName)
    }
  })
  
  return response
}

