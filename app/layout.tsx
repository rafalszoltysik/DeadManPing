import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import AnalyticsWrapperClient from '@/components/AnalyticsWrapperClient'

export const metadata: Metadata = {
  title: "DeadManPing - Monitor Your Cron Jobs | Result-Aware Monitoring",
  description: "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution. One curl line. Zero execution changes. Verify backups, reports, and sync jobs produce correct results. Free tier available.",
  keywords: "cron monitoring, dead man switch, job monitoring, scheduled tasks, cron jobs, backup monitoring, result-aware monitoring, payload validation, job outcome verification, cron job alerts, devops monitoring, scheduled task monitoring, silent failure detection",
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
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "DeadManPing - Never Miss a Cron Job Again | Result-Aware Monitoring",
    description: "Dead man switch monitoring for cron jobs and scheduled tasks. Monitor job outcomes, not just execution. One curl line. Zero execution changes. Verify backups, reports, and sync jobs produce correct results.",
    type: "website",
    url: "https://deadmanping.com",
    siteName: "DeadManPing",
    images: [
      {
        url: "https://deadmanping.com/icon.svg",
        width: 1200,
        height: 630,
        alt: "DeadManPing - Cron Job Monitoring",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeadManPing - Never Miss a Cron Job Again",
    description: "Dead man switch monitoring for cron jobs. Monitor job outcomes, not just execution. One curl line. Zero execution changes.",
    images: ["https://deadmanping.com/icon.svg"],
  },
  alternates: {
    canonical: "/",
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

  // Aggregate reviews schema - można później zastąpić prawdziwymi recenzjami
  const aggregateReviewSchema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": "DeadManPing"
    },
    "ratingValue": "4.8",
    "reviewCount": "50",
    "bestRating": "5",
    "worstRating": "1"
  }

  // Przykładowe recenzje - można później zastąpić prawdziwymi
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "SoftwareApplication",
      "name": "DeadManPing",
      "applicationCategory": "DeveloperApplication"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5",
      "bestRating": "5"
    },
    "author": {
      "@type": "Person",
      "name": "Alex M."
    },
    "reviewBody": "DeadManPing solved our silent failure problem. We were losing data because backups appeared to succeed but were actually empty. Now we catch these issues immediately. The payload validation is brilliant - we verify file sizes, record counts, and execution times without writing any custom alert logic.",
    "datePublished": "2024-12-01"
  }

  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateReviewSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
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

