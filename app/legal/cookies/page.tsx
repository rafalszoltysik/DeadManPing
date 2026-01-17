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
              the user experience and identify issues.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">Third-Party Cookies</h2>
            <p className="text-muted-foreground mb-4">
              Some cookies are placed by third-party services that appear on our pages:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Vercel Analytics:</strong> Helps us understand website usage</li>
              <li><strong>Stripe:</strong> Used for payment processing (only on checkout pages)</li>
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
            <p className="text-muted-foreground">
              Email: support@deadmanping.com<br />
              Website: https://deadmanping.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

