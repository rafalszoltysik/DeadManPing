/**
 * Root layout component for Next.js application.
 * 
 * Defines global metadata, structured data (Organization, WebSite schemas),
 * and wraps all pages with ThemeProvider and analytics. Sets dark mode as default.
 * Includes cookie banner and client-side analytics wrapper.
 * 
 * Does not handle routing - Next.js App Router handles page routing.
 */

import type { Metadata } from "next";
import "./globals.css";
import { getCanonicalBaseUrl } from '@/lib/seo-helpers'
import { CookieBanner } from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnalyticsWrapperClient from '@/components/AnalyticsWrapperClient'

const canonicalBaseUrl = getCanonicalBaseUrl()

export const metadata: Metadata = {
  metadataBase: new URL(canonicalBaseUrl),
  title: "Cron Job & Backup Monitoring With Dead Man Switch - DeadManPing",
  description: "Dead man switch monitoring for cron jobs and backups. One curl line, no SDK. Detect silent failures, empty backups, hanging scripts. Free tier available.",
  keywords: "backup dead man switch, dead man switch backup, detect empty backup file, backup monitoring without infrastructure, backup failure detection, empty backup file detection, backup file zero bytes, backup monitoring, dead man switch for backups, monitor backup jobs, cron monitoring, dead man switch, job monitoring, scheduled tasks, cron jobs, result-aware monitoring, payload validation, job outcome verification, cron job alerts, devops monitoring, scheduled task monitoring, silent failure detection, multi-currency pricing, USD pricing, EUR pricing, euro pricing",
  authors: [{ name: "DeadManPing" }],
  creator: "DeadManPing",
  publisher: "DeadManPing",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Cron Job & Backup Monitoring With Dead Man Switch - DeadManPing",
    description: "Dead man switch monitoring for cron jobs and backups. One curl line, no SDK. Detect silent failures, empty backups, hanging scripts. Free tier available.",
    type: "website",
    url: canonicalBaseUrl,
    siteName: "DeadManPing",
    images: [
      {
        url: `${canonicalBaseUrl}/icon.png`,
        width: 1200,
        height: 1200,
        alt: "DeadManPing - Cron Job Monitoring",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cron Job & Backup Dead Man Switch Monitoring - Free Tier",
    description: "Monitor cron job outcomes, not just execution. One curl line, instant alerts for failures, empty backups, hanging scripts. 2-min setup.",
    images: [`${canonicalBaseUrl}/icon.png`],
  },
  alternates: {
    canonical: canonicalBaseUrl,
  },
  category: "Software",
  classification: "Developer Tools, Monitoring Software",
};

/**
 * Renders root HTML layout with metadata and global providers.
 * 
 * Includes structured data for SEO, theme provider, cookie banner, and analytics.
 * 
 * @param children - React children (page content)
 * @returns Root HTML layout
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const canonicalBaseUrl = getCanonicalBaseUrl()

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DeadManPing",
    "url": canonicalBaseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${canonicalBaseUrl}/icon.png`,
      "width": 1200,
      "height": 1200,
      "contentUrl": `${canonicalBaseUrl}/icon.png`,
      "encodingFormat": "image/png"
    },
    "image": `${canonicalBaseUrl}/icon.png`,
    "description": "Dead man switch monitoring service for cron jobs and scheduled tasks. Monitor your backups, reports, and sync jobs without changing your existing setup.",
    "foundingDate": "2026",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": `${canonicalBaseUrl}/contact`
    },
    "areaServed": "Worldwide",
    "paymentAccepted": "USD, EUR",
    "knowsAbout": [
      "Cron job monitoring",
      "Dead man switch",
      "Scheduled task monitoring",
      "Backup monitoring",
      "Job outcome verification",
      "Payload validation",
      "DevOps monitoring"
    ]
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DeadManPing",
    "url": canonicalBaseUrl,
    "description": "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution.",
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": canonicalBaseUrl
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${canonicalBaseUrl}/docs?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "en-US"
  }

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          suppressHydrationWarning
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <AnalyticsWrapperClient />}
      </body>
    </html>
  );
}

