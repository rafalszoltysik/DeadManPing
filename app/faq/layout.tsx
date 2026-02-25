/**
 * FAQ layout component with metadata.
 * 
 * Wraps FAQ page with consistent metadata. Sets SEO metadata for FAQ page.
 * Does not add any visual layout - only provides metadata wrapper.
 * 
 * Does not handle FAQ content - only provides metadata.
 */

import type { Metadata } from 'next'
import { getCanonicalBaseUrl } from '@/lib/seo-helpers'

export const metadata: Metadata = {
  title: "Cron Job Monitoring FAQ - Pricing, Setup, Alerts & Features",
  description: "Common questions about cron job monitoring: setup in 2 min, free tier, payload validation, Slack/Discord/email alerts, start/stop tracking, and more.",
  keywords: "deadmanping faq, cron monitoring faq, cron job monitoring questions, dead man switch faq, job monitoring help",
  openGraph: {
    title: "Cron Job Monitoring FAQ - Pricing, Setup & Features",
    description: "Common questions about cron job monitoring: free tier, payload validation, Slack/Discord alerts, start/stop tracking.",
    type: "website",
    url: `${getCanonicalBaseUrl()}/faq`,
  },
  twitter: {
    card: "summary",
    title: "Cron Job Monitoring FAQ - Setup, Pricing & Alerts",
    description: "Answers to common questions about dead man switch cron monitoring: setup, pricing, alerts, payload validation.",
  },
  alternates: {
    canonical: `${getCanonicalBaseUrl()}/faq`,
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

