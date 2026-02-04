/**
 * Google OAuth authentication initiation endpoint.
 * 
 * Redirects user to Google OAuth consent screen. Stores redirect URL in state
 * parameter for post-authentication redirect. Used for "Sign in with Google" flow.
 * 
 * Does not handle OAuth callback - see google/callback route.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getGoogleAuthUrl } from '@/lib/auth/google-oauth'

/**
 * Initiates Google OAuth flow by redirecting to Google consent screen.
 * 
 * Encodes redirect URL in state parameter for post-auth redirect.
 * 
 * @param request - HTTP request with optional redirect query parameter
 * @returns Redirect response to Google OAuth URL
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirect = searchParams.get('redirect') || '/dashboard'

  // Store redirect URL in state for later use
  const state = Buffer.from(JSON.stringify({ redirect })).toString('base64')
  
  const authUrl = getGoogleAuthUrl(state)

  return NextResponse.redirect(authUrl)
}

