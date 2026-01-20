'use client'

import posthog from 'posthog-js'
import type {
  PageViewEvent,
  CTAClickedEvent,
  SignupStartedEvent,
  HeartbeatUrlCopiedEvent,
} from './events'

/**
 * Check if PostHog is initialized and opt-out is not set
 * 
 * Developers can block analytics by setting: localStorage.setItem('blockAnalytics', 'true')
 * Users can opt-out via the opt-out page: /legal/opt-out
 */
export function isPostHogEnabled(): boolean {
  // Disable PostHog in development to avoid sending test data
  if (process.env.NODE_ENV !== 'production') return false
  
  if (typeof window === 'undefined') return false
  
  // Check for developer block flags (custom localStorage to block analytics for developers)
  // To disable analytics as a developer: localStorage.setItem('blockAnalytics', 'true')
  const blockAnalytics = localStorage.getItem('blockAnalytics')
  const blockEssentialCookies = localStorage.getItem('blockEssentialCookies')
  if (blockAnalytics === 'true' || blockEssentialCookies === 'true') return false
  
  // Check for user opt-out flag (users can opt-out via /legal/opt-out page)
  const optOut = localStorage.getItem('posthog_opt_out')
  if (optOut === 'true') return false
  
  // Check if PostHog is initialized
  return typeof posthog !== 'undefined' && posthog.__loaded === true
}

/**
 * Capture a page view event
 */
export function capturePageView(event: PageViewEvent): void {
  if (!isPostHogEnabled()) return
  
  // Build properties object with UTM parameters
  const properties: Record<string, any> = {
    path: event.path,
    referrer: event.referrer,
  }
  
  // Add UTM parameters if present
  if (event.utm_source) properties.utm_source = event.utm_source
  if (event.utm_medium) properties.utm_medium = event.utm_medium
  if (event.utm_campaign) properties.utm_campaign = event.utm_campaign
  if (event.utm_term) properties.utm_term = event.utm_term
  if (event.utm_content) properties.utm_content = event.utm_content
  
  // Set UTM parameters as user properties so they persist across sessions
  // PostHog will automatically track these as $initial_utm_source, etc.
  if (event.utm_source || event.utm_medium || event.utm_campaign) {
    const userProperties: Record<string, any> = {}
    if (event.utm_source) userProperties.$initial_utm_source = event.utm_source
    if (event.utm_medium) userProperties.$initial_utm_medium = event.utm_medium
    if (event.utm_campaign) userProperties.$initial_utm_campaign = event.utm_campaign
    if (event.utm_term) userProperties.$initial_utm_term = event.utm_term
    if (event.utm_content) userProperties.$initial_utm_content = event.utm_content
    
    // Only set if not already set (preserve first touch attribution)
    posthog.identify(undefined, userProperties, { set_once: true })
  }
  
  posthog.capture('page_view', properties)
}

/**
 * Capture a CTA click event
 */
export function captureCTAClicked(event: CTAClickedEvent): void {
  if (!isPostHogEnabled()) return
  
  posthog.capture('cta_clicked', {
    cta: event.cta,
  })
}

/**
 * Capture a signup started event
 */
export function captureSignupStarted(event: SignupStartedEvent): void {
  if (!isPostHogEnabled()) return
  
  posthog.capture('signup_started', {
    method: event.method,
  })
}

/**
 * Capture a heartbeat URL copied event
 */
export function captureHeartbeatUrlCopied(event: HeartbeatUrlCopiedEvent): void {
  if (!isPostHogEnabled()) return
  
  posthog.capture('heartbeat_url_copied', {
    method: event.method,
  })
}

/**
 * Set or unset PostHog opt-out
 */
export function setPostHogOptOut(optOut: boolean): void {
  if (typeof window === 'undefined') return
  
  if (optOut) {
    localStorage.setItem('posthog_opt_out', 'true')
    // If PostHog is already initialized, opt out
    if (typeof posthog !== 'undefined' && posthog.__loaded) {
      posthog.opt_out_capturing()
    }
  } else {
    localStorage.removeItem('posthog_opt_out')
    // If PostHog is already initialized, opt in
    if (typeof posthog !== 'undefined' && posthog.__loaded) {
      posthog.opt_in_capturing()
    }
  }
}

/**
 * Check if user has opted out
 */
export function isPostHogOptedOut(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('posthog_opt_out') === 'true'
}

