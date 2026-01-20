import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import "./globals.css";
import { CookieBanner } from '@/components/CookieBanner'
import { ThemeProvider } from '@/components/ThemeProvider'

// Lazy load AnalyticsWrapper to avoid blocking initial render
const AnalyticsWrapper = dynamic(() => import('@/components/AnalyticsWrapper').then(mod => ({ default: mod.AnalyticsWrapper })), {
  ssr: false, // Client-side only since it checks localStorage
})

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
  },
  twitter: {
    card: "summary",
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

