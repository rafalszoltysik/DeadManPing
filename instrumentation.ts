// This file configures the initialization of Sentry for server and edge runtimes.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#create-initialization-config-files

import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Skip Sentry initialization in development
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!sentryDsn) {
    return
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server runtime initialization (only in production)
    Sentry.init({
      dsn: sentryDsn,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 0.1,
      
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
      
      environment: 'production',
      
      // Release version (will be set from commit hash in production)
      release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      
      // Filter out known non-critical errors
      ignoreErrors: [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'refresh_token_not_found',
        'Invalid Refresh Token',
        'Refresh Token Not Found',
        'AuthSessionMissingError',
      ],
      
      beforeSend(event, hint) {
        // Filter out expected "no session" errors - they're normal for unauthenticated users
        const errorMessage = event.message || 
          (hint.originalException && typeof hint.originalException === 'object' && 'message' in hint.originalException
            ? String(hint.originalException.message)
            : '')
        const errorString = String(errorMessage).toLowerCase()
        
        const exceptionValue = event.exception?.values?.[0]?.value?.toLowerCase() || ''
        const isExpectedNoSessionError = 
          exceptionValue.includes('refresh token not found') ||
          exceptionValue.includes('invalid refresh token') ||
          exceptionValue.includes('session missing') ||
          exceptionValue.includes('auth session missing') ||
          errorString.includes('refresh token not found') ||
          errorString.includes('invalid refresh token') ||
          errorString.includes('session missing') ||
          errorString.includes('auth session missing') ||
          event.exception?.values?.[0]?.mechanism?.type === 'refresh_token_not_found'
        
        if (isExpectedNoSessionError) {
          // Don't send expected "no session" errors to Sentry
          return null
        }
        
        // Add context
        if (event.contexts) {
          event.contexts = {
            ...event.contexts,
            runtime: {
              name: 'node',
              version: process.version,
            },
          };
        }
        
        // Add tags
        event.tags = {
          ...event.tags,
          error_type: 'backend',
        };
        
        return event;
      },
      
      // Integrations
      integrations: [
        Sentry.httpIntegration(),
      ],
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization (only in production)
    Sentry.init({
      dsn: sentryDsn,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 0.1,
      
      debug: false,
      
      environment: 'production',
      
      release: process.env.SENTRY_RELEASE || process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      
      beforeSend(event, hint) {
        event.tags = {
          ...event.tags,
          error_type: 'edge',
        };
        
        return event;
      },
    });
  }
}

// Export onRequestError hook for Sentry to capture errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;

