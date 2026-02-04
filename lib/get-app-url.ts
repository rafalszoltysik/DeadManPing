/**
 * Application URL resolution utility.
 * 
 * Determines application base URL based on environment variables and deployment
 * platform. Used for email redirects, OAuth callbacks, and absolute URL generation.
 * Must match Supabase Redirect URLs configuration.
 * 
 * Does not validate URL format - assumes environment variables are correct.
 */

/**
 * Gets application base URL from environment or deployment platform.
 * 
 * Priority: NEXT_PUBLIC_APP_URL > VERCEL_URL > production domain > localhost.
 * 
 * @returns Application base URL (e.g., https://deadmanping.com)
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

