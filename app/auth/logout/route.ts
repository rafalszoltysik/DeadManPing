import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  
  // Delete session cookie - use expires with past date (same as createSession uses expires)
  // Must use EXACT same options as when created (path, sameSite, secure, httpOnly)
  const pastDate = new Date(0) // January 1, 1970
  response.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: pastDate, // Set to past date to delete (same as createSession uses expires)
    path: '/',
  })
  
  return response
}

