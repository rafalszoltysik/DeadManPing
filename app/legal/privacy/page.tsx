import Link from 'next/link'
import { PageNav } from '@/components/PageNav'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Privacy Policy</h1>
        <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              DeadManPing ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">2. Information We Collect</h2>
            
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">2.1 Account Information</h3>
            <p className="text-muted-foreground mb-4">
              When you create an account, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Email address</li>
              <li>Password (hashed and encrypted)</li>
              <li>Authentication tokens from third-party providers (Google OAuth)</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">2.2 Monitor Data</h3>
            <p className="text-muted-foreground mb-4">
              We store information about your monitors:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Monitor names and configuration</li>
              <li>Ping timestamps and status</li>
              <li>Optional metadata you send with pings (messages, duration, custom fields)</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">2.3 Payment Information</h3>
            <p className="text-muted-foreground mb-4">
              Payment processing is handled by Stripe. We do not store credit card information.
              We only store your Stripe customer ID and subscription status.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">2.4 Usage Data</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect information about how you use the Service:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>IP addresses</li>
              <li>Browser type and version</li>
              <li>Pages visited and time spent</li>
              <li>Error logs and performance data</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use the collected information to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide, maintain, and improve the Service</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Detect, prevent, and address technical issues</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">4. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Data is encrypted in transit (HTTPS/TLS)</li>
              <li>Passwords are hashed using bcrypt</li>
              <li>Database access is restricted with Row Level Security (RLS)</li>
              <li>We use Supabase (PostgreSQL) for data storage, which complies with SOC 2 Type II</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data,
              we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">5. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your information for as long as your account is active or as needed to provide the Service.
              We retain ping data for up to 100 pings per monitor (older pings are automatically deleted).
              If you delete your account, we will delete your personal information within 30 days, except where
              we are required to retain it for legal purposes.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">6. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">We use the following third-party services:</p>
            
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">6.1 Core Services</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Supabase:</strong> Database and authentication 
                (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
              <li><strong>Stripe:</strong> Payment processing 
                (<a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
              <li><strong>Resend:</strong> Email delivery 
                (<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
              <li><strong>Vercel:</strong> Hosting and infrastructure 
                (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
            </ul>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">6.2 Analytics Services</h3>
            <p className="text-muted-foreground mb-4">
              We use analytics services to understand how users interact with our Service and to improve performance. 
              These services are enabled by default based on our legitimate interest (GDPR Article 6(1)(f)) to improve 
              our service quality and user experience.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Privacy-First Configuration:</strong> Our analytics services operate in <strong>cookieless and anonymized mode</strong>. 
              No cookies are used for tracking, and IP addresses are anonymized before processing. This ensures that no 
              personally identifiable information is collected.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>PostHog:</strong> Product analytics configured in cookieless mode with anonymized IP addresses. 
                We collect anonymous page views, button clicks, and user interactions to improve our Service. 
                No cookies or persistent identifiers are used. You can opt-out at any time via our{' '}
                <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a>.
                (<a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
              <li><strong>Vercel Analytics:</strong> Website usage analytics that is fully anonymous and cookieless by design. 
                No personal data is collected or stored. This service measures performance and user experience without 
                tracking individual users.
                (<a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Your Rights:</strong> Under GDPR Article 21, you have the right to object to processing based on 
              legitimate interest. You can opt-out of PostHog analytics at any time by visiting our{' '}
              <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a>.
            </p>

            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-4 sm:mt-6">6.3 Error Tracking</h3>
            <p className="text-muted-foreground mb-4">
              We use error tracking to maintain service quality and security. This is based on legitimate interest:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Sentry:</strong> Error tracking and performance monitoring. We collect error logs, stack traces, 
                and performance data to identify and fix issues. This does not require explicit consent as it is necessary 
                for service reliability.
                (<a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>)</li>
            </ul>

            <p className="text-muted-foreground mb-4">
              These services have their own privacy policies. We encourage you to read them.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Object to processing based on legitimate interest (e.g., analytics) - visit our{' '}
                <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a></li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us through our contact form
              </Link>
              .
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">8. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar technologies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong>Essential cookies:</strong> Maintain your session and authentication state (required for Service functionality). 
                These cookies are enabled by default and cannot be disabled.</li>
              <li><strong>Analytics (Legitimate Interest):</strong> We use analytics services in cookieless/anonymized mode to analyze 
                usage patterns and improve our Service. These services are enabled by default based on our legitimate interest 
                (GDPR Article 6(1)(f)) and do not require explicit consent as they don't use cookies or collect personally 
                identifiable information.</li>
              <li><strong>Preference cookies:</strong> Remember your preferences and settings</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              <strong>Analytics Configuration:</strong> Our analytics services (PostHog and Vercel Analytics) operate in 
              cookieless and anonymized mode. No cookies are used for tracking, and IP addresses are anonymized before processing. 
              This means we can use these services without requiring explicit consent, as they don't collect personally 
              identifiable information.
            </p>
            <p className="text-muted-foreground mb-4">
              For detailed information about the cookies and analytics we use, please see our{' '}
              <a href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</a>.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Opting out of analytics:</strong> Under GDPR Article 21, you have the right to object to processing 
              based on legitimate interest. You can opt-out of PostHog analytics at any time by visiting our{' '}
              <a href="/legal/opt-out" className="text-primary hover:underline">opt-out page</a>. 
              Vercel Analytics is fully anonymous and cookieless, so it doesn't require opt-out, but you can block it using 
              browser extensions if desired.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">9. Children's Privacy</h2>
            <p className="text-muted-foreground mb-4">
              The Service is not intended for users under the age of 18. We do not knowingly collect personal
              information from children. If you believe we have collected information from a child, please contact us.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">10. International Data Transfers</h2>
            <p className="text-muted-foreground mb-4">
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have data protection laws that differ from those in your country. By using the Service,
              you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">11. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by
              posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">12. Data Controller Information</h2>
            <p className="text-muted-foreground mb-4">
              The administrator of your personal data is:
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4">
              <p className="text-muted-foreground mb-2">
              <strong>Business Name:</strong> Rafał Szołtysik<br />
              <strong>Legal Form:</strong> Sole Proprietorship<br />
              <strong>Address:</strong> Wolna 35, 44-187 Wielowieś, Poland<br />
              <strong>NIP:</strong> 9691672125<br />
              <strong>REGON:</strong> 541870021<br />
              <strong>Contact:</strong>{' '}
              <Link href="/contact" className="text-primary hover:underline">
                Contact Form
              </Link>
              <br />
              <strong>Website:</strong> https://deadmanping.com
              </p>
            </div>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or wish to exercise your rights under GDPR, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us through our contact form
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

