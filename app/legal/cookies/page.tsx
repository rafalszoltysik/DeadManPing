import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatedSection delay={0} direction="fade" duration={800}>
          <AnimatedItem delay={100} direction="up" duration={700}>
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
          </AnimatedItem>
          
          <AnimatedItem delay={200} direction="up" duration={700}>
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Cookie Policy</h1>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection delay={200} direction="up" duration={800}>
          <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            </AnimatedItem>

            <AnimatedItem delay={200} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">What Are Cookies?</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies are small text files that are placed on your device when you visit a website. They are widely
                  used to make websites work more efficiently and provide information to website owners.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={300} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">How We Use Cookies</h2>
                <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
                
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">Essential Cookies</h3>
                <p className="text-muted-foreground mb-4">
                  These cookies are necessary for the Service to function properly. They enable core functionality such as:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>User authentication and session management</li>
                  <li>Security and fraud prevention</li>
                  <li>Remembering your login state</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  These cookies cannot be disabled as they are essential for the Service to work.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">Analytics (Legitimate Interest)</h3>
                <p className="text-muted-foreground mb-4">
                  We use analytics services to understand how visitors interact with our Service and to improve performance. 
                  These services are enabled by default based on our legitimate interest (GDPR Article 6(1)(f)) to improve 
                  our service quality and user experience.
                </p>
                <p className="text-muted-foreground mb-4">
                  <strong>Important:</strong> Our analytics services operate in <strong>cookieless and anonymized mode</strong>. 
                  No cookies are used for tracking, and IP addresses are anonymized before processing. This means we can 
                  use these services without requiring explicit consent, as they don't collect personally identifiable information.
                </p>
                <p className="text-muted-foreground mb-4">
                  We use the following analytics services:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>PostHog:</strong> Product analytics configured in cookieless mode with anonymized IP addresses. 
                    No cookies or persistent identifiers are used. You can opt-out at any time via our{' '}
                    <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a>.
                    Privacy policy: <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://posthog.com/privacy</a></li>
                  <li><strong>Vercel Analytics:</strong> Website usage analytics that is fully anonymous and cookieless by design. 
                    No personal data is collected or stored. Privacy policy: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com/legal/privacy-policy</a></li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>Your Rights:</strong> Under GDPR Article 21, you have the right to object to processing based on 
                  legitimate interest. You can opt-out of PostHog analytics at any time by visiting our{' '}
                  <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a>.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={400} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Error Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use error tracking to identify and fix technical issues. This service does not require explicit consent
                  as it is necessary for the legitimate interest of maintaining service quality and security.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Sentry:</strong> Error tracking and performance monitoring to ensure service reliability.
                    Privacy policy: <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://sentry.io/privacy/</a></li>
                </ul>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={500} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Third-Party Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  Some cookies are placed by third-party services that appear on our pages:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Stripe:</strong> Used for payment processing (only on checkout pages). 
                    Privacy policy: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://stripe.com/privacy</a></li>
                </ul>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={600} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Managing Cookies</h2>
                <p className="text-muted-foreground mb-4">
                  You can control and manage cookies in various ways:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
                  <li>Browser extensions: You can install extensions to block cookies</li>
                  <li>Private browsing: Use incognito/private mode to limit cookie storage</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  <strong>Note:</strong> Disabling essential cookies may prevent the Service from functioning properly.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={700} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Cookie Duration</h2>
                <p className="text-muted-foreground mb-4">
                  Cookies may be either "persistent" or "session" cookies:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
                  <li><strong>Persistent cookies:</strong> Remain on your device for a set period or until you delete them</li>
                </ul>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={800} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Updates to This Policy</h2>
                <p className="text-muted-foreground mb-4">
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting
                  the new policy on this page.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={900} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Contact Us</h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about our use of cookies, please{' '}
                  <Link href="/contact" className="text-primary hover:underline">
                    contact us through our contact form
                  </Link>
                  .
                </p>
              </section>
            </AnimatedItem>
          </div>
        </AnimatedSection>
      </div>

      <Footer />
    </div>
  )
}

