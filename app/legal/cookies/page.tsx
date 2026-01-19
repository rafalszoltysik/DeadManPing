import { PageNav } from '@/components/PageNav'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Cookie Policy</h1>
        <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">What Are Cookies?</h2>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They are widely
              used to make websites work more efficiently and provide information to website owners.
            </p>
          </section>

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

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">Analytics Cookies</h3>
            <p className="text-muted-foreground mb-4">
              We use analytics cookies to understand how visitors interact with our Service. This helps us improve
              the user experience and identify issues. These cookies require your consent and can be disabled.
            </p>
            <p className="text-muted-foreground mb-4">
              We use the following analytics services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>PostHog:</strong> Product analytics to understand how users interact with our Service. 
                Privacy policy: <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://posthog.com/privacy</a></li>
              <li><strong>Vercel Analytics:</strong> Website usage analytics to improve performance and user experience.
                Privacy policy: <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com/legal/privacy-policy</a></li>
            </ul>
          </section>

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

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Cookie Policy from time to time. We will notify you of any changes by posting
              the new policy on this page.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about our use of cookies, please contact us at:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
              <p className="text-muted-foreground mb-2">
              <strong>Business Name:</strong> Rafał Szołtysik<br />
              <strong>Legal Form:</strong> Sole Proprietorship<br />
              <strong>Address:</strong> [Adres Twojego wirtualnego biura]<br />
              <strong>NIP:</strong> 9691672125<br />
              <strong>REGON:</strong> 541870021<br />
              <strong>Email:</strong> support@deadmanping.com<br />
              <strong>Website:</strong> https://deadmanping.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

