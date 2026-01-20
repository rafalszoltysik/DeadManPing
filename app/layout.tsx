import type { Metadata } from "next";
import "./globals.css";
import { CookieBanner } from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper'

export const metadata: Metadata = {
  title: "DeadManPing - Monitor Your Cron Jobs",
  description: "Simple dead-man switch monitoring for your cron jobs and scheduled tasks",
  keywords: "cron monitoring, job monitoring, dead man switch, scheduled tasks, cron jobs",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "DeadManPing - Never Miss a Cron Job Again",
    description: "Simple dead-man switch monitoring for your cron jobs and scheduled tasks. Get alerted when your backups, reports, or sync jobs don't run.",
    type: "website",
    url: "https://deadmanping.com",
    siteName: "DeadManPing",
    images: [
      {
        url: "https://deadmanping.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeadManPing - Monitor Your Cron Jobs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DeadManPing - Never Miss a Cron Job Again",
    description: "Simple dead-man switch monitoring for your cron jobs and scheduled tasks.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body>
        <ThemeProvider>
          {children}
          <CookieBanner />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <AnalyticsWrapper />}
      </body>
    </html>
  );
}

