import posthog from 'posthog-js'
import * as Sentry from "@sentry/nextjs"

/**
 * Client Initialization
 * This file is automatically loaded by Next.js 15.3+ for client-side initialization
 * Handles both PostHog and Sentry client initialization
 */

export function init() {
  // Skip initialization in development
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Initialize Sentry on the client (only in production)
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      
      // Adjust this value in production, or use tracesSampler for greater control
      tracesSampleRate: 0.1,
      
      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,
      
      environment: 'production',
      
      // Release version (will be set from commit hash in production)
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
      
      // Filter out known non-errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        'conduitPage',
        // Network errors that are not our fault
        'NetworkError',
        'Network request failed',
        'Failed to fetch',
        // Common browser issues
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      
      // Don't send errors from browser extensions
      beforeSend(event, hint) {
        // Filter out errors from browser extensions
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message);
            if (
              message.includes('chrome-extension://') ||
              message.includes('moz-extension://') ||
              message.includes('safari-extension://')
            ) {
              return null;
            }
          }
        }
        
        // Add context about the route/action
        if (event.contexts) {
          event.contexts = {
            ...event.contexts,
            runtime: {
              name: 'browser',
            },
          };
        }
        
        // Add tags
        event.tags = {
          ...event.tags,
          error_type: 'frontend',
        };
        
        return event;
      },
      
      // Integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Only record replays in production
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
  }

  // Initialize PostHog (only in production)
  // Skip PostHog in development to avoid sending test data

  // Check if PostHog is configured
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || !host) {
    // PostHog not configured, skip initialization
    return
  }

  // Check for cookie consent and opt-out flag (only in browser)
  if (typeof window !== 'undefined') {
    // Check for developer block flag (custom localStorage to block analytics for developers)
    const blockAnalytics = localStorage.getItem('blockAnalytics')
    if (blockAnalytics === 'true') {
      // Developer has blocked analytics, don't initialize PostHog
      return
    }
    
    // Check cookie consent first (GDPR compliance)
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (cookieConsent === 'rejected') {
      // User rejected cookies, don't initialize PostHog
      localStorage.setItem('posthog_opt_out', 'true')
      return
    }
    
    // Also check for explicit opt-out flag
    const optOut = localStorage.getItem('posthog_opt_out')
    if (optOut === 'true') {
      // User has opted out, don't initialize PostHog
      return
    }
    
    // If user accepted cookies, ensure PostHog is not opted out
    if (cookieConsent === 'accepted') {
      localStorage.removeItem('posthog_opt_out')
    }
  }

  // Initialize PostHog
  posthog.init(apiKey, {
    api_host: host,
    // Use defaults for recommended settings
    defaults: '2025-11-30',
    // Disable autocapture - we track events manually
    autocapture: false,
    // Capture pageviews manually (we'll track with custom path/referrer)
    capture_pageview: false,
    // Disable session recording (not needed for product analytics)
    disable_session_recording: true,
    // Disable feature flags (not using them yet)
    disable_persistence: false,
    // Load PostHog asynchronously
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog initialized')
      }
    },
  })
}

// Export onRouterTransitionStart hook for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

