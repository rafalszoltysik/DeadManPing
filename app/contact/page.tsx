import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { ContactForm } from './ContactForm'
import { getSupabaseUser } from '@/lib/auth/supabase-session'
import { Footer } from '@/components/Footer'

// Force static generation for better performance
export const dynamic = 'force-dynamic' // Keep dynamic because we need user session
export const revalidate = 60 // Revalidate every minute

export default async function ContactPage() {
  // Get user email server-side so it appears immediately
  const user = await getSupabaseUser()
  const initialEmail = user?.email || null

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
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

      <Footer />
    </div>
  )
}
