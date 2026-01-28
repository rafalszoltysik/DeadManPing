import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnalyticsWrapperClient from '@/components/AnalyticsWrapperClient'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
// Ensure baseUrl is without www for consistency (canonical URL)
const canonicalBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  metadataBase: new URL(canonicalBaseUrl),
  title: "DeadManPing - Monitor Your Cron Jobs | Result-Aware Monitoring",
  description: "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution. One curl line. Your job logic stays the same. Verify backups, reports, and sync jobs produce correct results. Free tier available. Multi-currency pricing in USD and EUR.",
  keywords: "cron monitoring, dead man switch, job monitoring, scheduled tasks, cron jobs, backup monitoring, result-aware monitoring, payload validation, job outcome verification, cron job alerts, devops monitoring, scheduled task monitoring, silent failure detection, multi-currency pricing, USD pricing, EUR pricing, euro pricing",
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
    title: "DeadManPing - Never Miss a Cron Job Again | Result-Aware Monitoring",
    description: "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution. One curl line. Your job logic stays the same. Verify backups, reports, and sync jobs produce correct results. Multi-currency pricing in USD and EUR.",
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
    title: "DeadManPing - Never Miss a Cron Job Again",
    description: "Dead man switch monitoring for cron jobs. Monitor job outcomes, not just execution. One curl line. Your job logic stays the same.",
    images: [`${canonicalBaseUrl}/icon.png`],
  },
  alternates: {
    canonical: canonicalBaseUrl,
  },
  category: "Software",
  classification: "Developer Tools, Monitoring Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
  // Ensure baseUrl is without www for consistency (canonical URL)
  const canonicalBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DeadManPing",
    "url": baseUrl,
    "logo": `${baseUrl}/icon.svg`,
    "description": "Dead man switch monitoring service for cron jobs and scheduled tasks. Monitor your backups, reports, and sync jobs without changing your existing setup.",
    "foundingDate": "2024",
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "url": `${baseUrl}/contact`
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
    "url": baseUrl,
    "description": "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution.",
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": baseUrl
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/docs?q={search_term_string}`
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

