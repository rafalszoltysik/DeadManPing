/**
 * Terms of Service page.
 * 
 * Static page displaying terms of service and user agreement. Includes
 * legal text about service usage, user responsibilities, and limitations.
 * Static generation for performance.
 * 
 * Does not handle legal agreements - only displays terms.
 */

import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { Footer } from '@/components/Footer'

/**
 * Renders terms of service page.
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Terms of Service</h1>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection delay={200} direction="up" duration={800}>
          <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8 prose prose-gray max-w-none">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Last updated: {new Date().toLocaleDateString()}</p>
            </AnimatedItem>

            <AnimatedItem delay={200} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing or using DeadManPing ("Service"), you agree to be bound by these Terms of Service ("Terms").
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={300} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  DeadManPing is a monitoring service that allows you to track the execution of cron jobs and scheduled tasks
                  through HTTP ping endpoints. The Service provides alerting capabilities via email, Slack, and Discord.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={400} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials. You agree to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Provide accurate and complete information when creating an account</li>
                  <li>Maintain and update your account information</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={500} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">4. Subscription and Payment</h2>
                <p className="text-muted-foreground mb-4">
                  The Service offers both free and paid subscription plans:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li><strong>Free Plan:</strong> Limited to 20 monitors with 5-minute minimum intervals</li>
                  <li><strong>Starter Plan:</strong> $7/month for 30 monitors</li>
                  <li><strong>Pro Plan:</strong> $24/month for 150 monitors</li>
                  <li><strong>Team Plan:</strong> $79/month for 1000 monitors</li>
                </ul>
                <p className="text-muted-foreground mb-4">
                  Subscriptions are billed monthly in advance. You may cancel your subscription at any time.
                  Cancellation takes effect at the end of the current billing period. No refunds are provided for partial months.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={600} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">5. Acceptable Use</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                  <li>Use the Service for any illegal purpose or in violation of any laws</li>
                  <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Use the Service to send spam, malware, or other harmful content</li>
                  <li>Exceed the usage limits of your subscription plan</li>
                  <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
                </ul>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={700} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">6. Service Availability</h2>
                <p className="text-muted-foreground mb-4">
                  We strive to maintain high availability of the Service but do not guarantee uninterrupted access.
                  The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
                  We are not liable for any damages resulting from Service unavailability.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={800} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">7. Data and Privacy</h2>
                <p className="text-muted-foreground mb-4">
                  Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to
                  the collection and use of information as described in the Privacy Policy.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={900} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  The Service and its original content, features, and functionality are owned by DeadManPing and are
                  protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={1000} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEADMANPING SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
                  OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE SERVICE.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={1100} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">10. Termination</h2>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice,
                  for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={1200} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">11. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes
                  via email or through the Service. Your continued use of the Service after such modifications constitutes
                  acceptance of the updated Terms.
                </p>
              </section>
            </AnimatedItem>

            <AnimatedItem delay={1300} direction="up" duration={700}>
              <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-3 sm:mb-4">12. Service Provider Information</h2>
                <p className="text-muted-foreground mb-4">
                  The Service is provided by:
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
                  If you have any questions about these Terms, please{' '}
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

