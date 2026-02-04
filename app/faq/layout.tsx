/**
 * FAQ layout component with metadata.
 * 
 * Wraps FAQ page with consistent metadata. Sets SEO metadata for FAQ page.
 * Does not add any visual layout - only provides metadata wrapper.
 * 
 * Does not handle FAQ content - only provides metadata.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | DeadManPing",
  description: "Find answers to common questions about DeadManPing cron job monitoring. Learn about pricing, features, setup, alerts, and more.",
  keywords: "deadmanping faq, cron monitoring faq, cron job monitoring questions, dead man switch faq, job monitoring help",
  openGraph: {
    title: "FAQ - Frequently Asked Questions | DeadManPing",
    description: "Find answers to common questions about DeadManPing cron job monitoring. Learn about pricing, features, setup, alerts, and more.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FAQ - Frequently Asked Questions | DeadManPing",
    description: "Find answers to common questions about DeadManPing cron job monitoring.",
  },
  alternates: {
    canonical: "/faq",
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

