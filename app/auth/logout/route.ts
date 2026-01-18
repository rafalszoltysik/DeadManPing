import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  return handleLogout(request)
}

export async function GET(request: NextRequest) {
  return handleLogout(request)
}

async function handleLogout(request: NextRequest) {
  try {
    // Create response object for setting cookies
    const response = NextResponse.json({ success: true })
    
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
      console.error('Logout error from Supabase:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack,
      })
      // Return error but still clear cookies
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? {
            status: error.status,
            name: error.name,
          } : undefined
        },
        { status: 500 }
      )
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
  } catch (error) {
    // Log full error details for debugging
    console.error('Logout route error:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    })
    
    // Return error response instead of redirect
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        } : undefined
      },
      { status: 500 }
    )
  }
}

