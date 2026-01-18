/**
 * Get the application URL based on environment
 * - Uses NEXT_PUBLIC_APP_URL if set
 * - Falls back to VERCEL_URL for Vercel deployments
 * - Falls back to localhost for development
 * - Uses production domain for production
 * 
 * IMPORTANT: The returned URL must be in Supabase Redirect URLs list
 * for emailRedirectTo to work properly.
 */
export function getAppUrl(): string {
  // If explicitly set, use it
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // For Vercel deployments, use Vercel URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // For production environment, use production domain
  if (process.env.NODE_ENV === 'production') {
    return 'https://deadmanping.com'
  }

  // Development fallback
  return 'http://localhost:3000'
}

