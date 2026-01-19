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
  
  posthog.capture('page_view', {
    path: event.path,
    referrer: event.referrer,
  })
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

