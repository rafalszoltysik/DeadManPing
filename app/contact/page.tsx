import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { StaticLogo } from '@/components/StaticLogo'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { ContactForm } from './ContactForm'
import { getSupabaseUser } from '@/lib/auth/supabase-session'

export default async function ContactPage() {
  // Get user email server-side so it appears immediately
  const user = await getSupabaseUser()
  const initialEmail = user?.email || null

  return (
    <div className="min-h-screen bg-background">
      <PageNav />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Contact Us</h1>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection delay={300} direction="up" duration={800}>
          <div className="bg-card border border-border shadow-sm rounded-lg sm:rounded-xl p-6 sm:p-8">
            <AnimatedItem delay={100} direction="up" duration={700}>
              <p className="text-muted-foreground mb-6">
                Have a question or need help? Send us a message and we'll get back to you as soon as possible.
              </p>
            </AnimatedItem>
            
            <ContactForm initialEmail={initialEmail} />
          </div>
        </AnimatedSection>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <StaticLogo showText={true} variant="with-text" className="text-xl sm:text-2xl" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Simple monitoring for your cron jobs and scheduled tasks.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/monitor-cron-jobs" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Monitor Cron Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/dead-man-switch" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Dead Man Switch
                  </Link>
                </li>
                <li>
                  <Link href="/backup-monitoring" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Backup Monitoring
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-smooth">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signup" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/legal/terms" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/opt-out" className="text-muted-foreground hover:text-foreground transition-smooth">
                    Analytics Opt-Out
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} DeadManPing. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
