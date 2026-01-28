import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { Footer } from '@/components/Footer'
import { OptOutControls } from '@/components/OptOutControls'

export const metadata: Metadata = {
  title: "Analytics Opt-Out | DeadManPing",
  description: "Opt-out of analytics tracking. DeadManPing respects your privacy and allows you to disable analytics at any time.",
  alternates: {
    canonical: "/legal/opt-out",
  },
}

// Force static generation for better performance
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

export default function OptOutPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <PageNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth group"
          >
            <svg 
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Analytics Opt-Out</h1>
        <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
          
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR Article 21, you have the right to object to processing of your personal data 
              based on legitimate interest. We use analytics services (PostHog and Vercel Analytics) 
              in cookieless/anonymized mode to improve our service.
            </p>
            <p className="text-muted-foreground mb-4">
              You can opt-out of PostHog analytics at any time. Vercel Analytics is fully anonymous 
              and cookieless, so it doesn't require opt-out, but you can block it using browser 
              extensions if desired.
            </p>
          </section>

          <OptOutControls />

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">About Our Analytics</h2>
            <p className="text-muted-foreground mb-4">
              We use analytics to understand how users interact with our service and to improve performance. 
              Our analytics are configured to be privacy-friendly:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>PostHog:</strong> Configured in cookieless mode with anonymized IP addresses. 
                No cookies are used, and IP addresses are anonymized before processing.</li>
              <li><strong>Vercel Analytics:</strong> Fully anonymous and cookieless by design. 
                No personal data is collected or stored.</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              For more information, please see our{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              {' '}and{' '}
              <Link href="/legal/cookies" className="text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about our analytics or privacy practices, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us through our contact form
              </Link>
              .
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
