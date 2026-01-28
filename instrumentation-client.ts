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

  // Defer initialization until after page is interactive
  // This improves initial page load performance
  if (typeof window !== 'undefined') {
    const initializeWhenReady = () => {
      if (document.readyState === 'complete') {
        initializeAnalytics()
      } else {
        window.addEventListener('load', () => {
          // Additional delay to ensure page is fully interactive
          setTimeout(initializeAnalytics, 100)
        })
      }
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initializeWhenReady, { timeout: 2000 })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(initializeWhenReady, 1000)
    }
    return
  }

  // Server-side: initialize immediately
  initializeAnalytics()
}

function initializeAnalytics() {

  // Initialize Sentry on the client (only in production)
  // Sentry uses essential cookies that don't require user consent
  // But developers can block them using blockEssentialCookies flag
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  if (sentryDsn && typeof window !== 'undefined') {
    // Check for developer block flag for essential cookies (only in browser)
    let shouldInitSentry = true
    const blockEssentialCookies = localStorage.getItem('blockEssentialCookies')
    if (blockEssentialCookies === 'true') {
      // Developer has blocked essential cookies, don't initialize Sentry
      shouldInitSentry = false
    }
    
    if (shouldInitSentry) {
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
        // Expected auth errors (normal for unauthenticated users)
        'refresh_token_not_found',
        'Invalid Refresh Token',
        'Refresh Token Not Found',
        'AuthSessionMissingError',
      ],
      
      // Don't send errors from browser extensions or expected auth errors
      beforeSend(event, hint) {
        // Filter out expected "no session" errors - they're normal for unauthenticated users
        const errorMessage = event.message || 
          (hint.originalException && typeof hint.originalException === 'object' && 'message' in hint.originalException
            ? String(hint.originalException.message)
            : '')
        const errorString = String(errorMessage).toLowerCase()
        
        const isExpectedNoSessionError = 
          event.exception?.values?.[0]?.value?.toLowerCase().includes('refresh token not found') ||
          event.exception?.values?.[0]?.value?.toLowerCase().includes('invalid refresh token') ||
          event.exception?.values?.[0]?.value?.toLowerCase().includes('session missing') ||
          event.exception?.values?.[0]?.value?.toLowerCase().includes('auth session missing') ||
          errorString.includes('refresh token not found') ||
          errorString.includes('invalid refresh token') ||
          errorString.includes('session missing') ||
          errorString.includes('auth session missing')
        
        if (isExpectedNoSessionError) {
          // Don't send expected "no session" errors to Sentry
          return null
        }
        
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
  }

  // Initialize PostHog (only in production)
  // PostHog is configured in cookieless/anonymized mode for GDPR compliance
  // Analytics are enabled by default as "legitimate interest" (Art. 6(1)(f) GDPR)
  // Users can opt-out via posthog_opt_out flag, developers can block via blockAnalytics flag

  // Check if PostHog is configured
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey || !host) {
    // PostHog not configured, skip initialization
    return
  }

  // Check for developer block flag and user opt-out (only in browser)
  if (typeof window !== 'undefined') {
    // Check for developer block flag (custom localStorage to block analytics for developers)
    // To disable analytics as a developer: localStorage.setItem('blockAnalytics', 'true')
    const blockAnalytics = localStorage.getItem('blockAnalytics')
    const blockEssentialCookies = localStorage.getItem('blockEssentialCookies')
    if (blockAnalytics === 'true' || blockEssentialCookies === 'true') {
      // Developer has blocked analytics, don't initialize PostHog
      return
    }
    
    // Check for user opt-out flag (users can opt-out via /legal/opt-out page)
    const optOut = localStorage.getItem('posthog_opt_out')
    if (optOut === 'true') {
      // User has opted out, don't initialize PostHog
      return
    }
  }

  // Initialize PostHog in cookieless/anonymized mode
  // This configuration ensures GDPR compliance without requiring explicit consent
  // cookieless_mode: "always" - no cookies, no localStorage, fully anonymous tracking
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
    // Cookieless mode - no cookies, no localStorage, fully anonymous
    // This ensures GDPR compliance without requiring explicit consent
    cookieless_mode: 'always',
    // Load PostHog asynchronously
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PostHog initialized in cookieless/anonymized mode')
      }
    },
  })
}

// Export onRouterTransitionStart hook for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

