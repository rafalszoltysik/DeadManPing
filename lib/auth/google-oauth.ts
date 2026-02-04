/**
 * Google OAuth 2.0 authentication utilities.
 * 
 * Provides functions to generate OAuth URLs, exchange authorization codes,
 * and retrieve user information from Google. Integrates with Google Auth Library.
 * Redirect URI must match Google Cloud Console configuration exactly.
 * 
 * Does not handle session management - Supabase handles user sessions.
 */

import { OAuth2Client } from 'google-auth-library'

/**
 * Google OAuth client instance.
 * 
 * Configured with client ID, secret, and redirect URI from environment variables.
 * Redirect URI must match exactly what's registered in Google Cloud Console.
 */
export const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
)

/**
 * Generates Google OAuth authorization URL.
 * 
 * Creates URL for redirecting user to Google consent screen. Includes
 * email and profile scopes. State parameter can be used to pass redirect URL.
 * 
 * @param state - Optional state parameter (e.g., encoded redirect URL)
 * @returns Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state?: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  return googleOAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state: state || '',
  })
}

/**
 * Exchanges authorization code for user information.
 * 
 * Validates ID token and extracts user profile data from Google.
 * Side effects: Network call to Google OAuth API.
 * 
 * @param code - Authorization code from Google OAuth callback
 * @returns User information (id, email, name, picture, emailVerified)
 */
export async function getGoogleUserInfo(code: string) {
  const { tokens } = await googleOAuthClient.getToken(code)
  googleOAuthClient.setCredentials(tokens)

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token!,
    audience: process.env.GOOGLE_CLIENT_ID!,
  })

  const payload = ticket.getPayload()
  
  if (!payload) {
    throw new Error('Failed to get user info from Google')
  }

  return {
    id: payload.sub,
    email: payload.email!,
    emailVerified: payload.email_verified || false,
    name: payload.name || '',
    picture: payload.picture || '',
  }
}

