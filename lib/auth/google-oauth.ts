import { OAuth2Client } from 'google-auth-library'

/**
 * Google OAuth Redirect URI Configuration
 * 
 * IMPORTANT: The redirect URI must match EXACTLY what's registered in Google Cloud Console:
 * - For localhost: http://localhost:3000/api/auth/google/callback
 * - For production: https://yourdomain.com/api/auth/google/callback
 * 
 * Make sure to add this exact URI in Google Cloud Console under:
 * APIs & Services > Credentials > OAuth 2.0 Client IDs > Authorized redirect URIs
 */
export const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/google/callback`
)

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

