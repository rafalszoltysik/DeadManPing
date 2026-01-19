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
      ],
      
      beforeSend(event, hint) {
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

