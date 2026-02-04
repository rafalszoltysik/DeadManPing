/**
 * Authentication layout component with metadata.
 * 
 * Wraps all authentication pages (login, signup, password reset) with
 * consistent metadata. Sets noindex/nofollow for SEO. Does not add any
 * visual layout - only provides metadata.
 * 
 * Does not handle authentication - only provides metadata wrapper.
 */

import type { Metadata } from 'next'

// Default metadata for auth pages
export const metadata: Metadata = {
  title: "Authentication | DeadManPing",
  description: "Sign in or sign up to DeadManPing to monitor your cron jobs and scheduled tasks.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Authentication | DeadManPing",
    description: "Sign in or sign up to DeadManPing to monitor your cron jobs and scheduled tasks.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Authentication | DeadManPing",
    description: "Sign in or sign up to DeadManPing to monitor your cron jobs and scheduled tasks.",
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

