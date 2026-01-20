'use client'

import Link from 'next/link'
import { PageNav } from '@/components/PageNav'
import { StaticLogo } from '@/components/StaticLogo'
import { AnimatedSection, AnimatedItem } from '@/components/AnimatedSection'
import { useState, ReactElement } from 'react'

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DeadManPing?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DeadManPing is a monitoring service for cron jobs and scheduled tasks. It uses a dead man switch approach - if your job doesn't ping us within the expected time window, we alert you. You keep your existing cron setup and just add one curl line to your scripts."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to migrate my cron jobs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Keep your cron. Keep your scripts. Just add one curl line at the end of your existing script."
        }
      },
      {
        "@type": "Question",
        "name": "Does DeadManPing run my jobs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Your cron runs your jobs. DeadManPing only observes the results. DeadManPing doesn't touch execution."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DeadManPing cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DeadManPing offers a free tier with 10 monitors and 5-minute minimum intervals. Paid plans start at $9/month for Starter (25 monitors), $29/month for Pro (100 monitors), and $79/month for Team (500 monitors). Before purchasing a paid plan, you can try it free for 14 days with no credit card required."
        }
      },
      {
        "@type": "Question",
        "name": "What alert channels are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Free tier includes email alerts. Starter, Pro, and Team plans add Slack and Discord integrations. Team plan also includes custom webhooks for integration with any service."
        }
      },
      {
        "@type": "Question",
        "name": "Can I send custom data with my pings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! You can send JSON payloads with any data you want - success status, counts, file sizes, durations, error messages, etc. You can also set up payload validation rules to ensure your jobs are producing the expected results."
        }
      },
      {
        "@type": "Question",
        "name": "What programming languages are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Any language that can make HTTP requests! We provide examples for bash, Python, Node.js, Ruby, Go, PHP, and more. Since it's just a simple HTTP POST request, you can use curl, wget, or any HTTP library in your preferred language."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a free trial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Before purchasing any paid plan, you can try it free for 14 days with no credit card required. During the trial, you get full access to all features of the plan you're trialing. When you purchase a plan, the trial ends and your paid subscription begins. If you don't purchase, you'll automatically move to the free tier after the trial ends."
        }
      },
      {
        "@type": "Question",
        "name": "Can I monitor backup jobs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Backup monitoring is one of the most common use cases. You can verify that backups run on schedule, check backup file sizes, and ensure backups complete successfully."
        }
      },
      {
        "@type": "Question",
        "name": "How do I contact support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can contact support through the contact form or email us directly. Team plan customers get priority support with 24-hour response time."
        }
      }
    ]
  }

  const faqSections = [
    {
      title: "Getting Started",
      items: [
        {
          q: "What is DeadManPing?",
          a: "DeadManPing is a monitoring service for cron jobs and scheduled tasks. It uses a dead man switch approach - if your job doesn't ping us within the expected time window, we alert you. You keep your existing cron setup and just add one curl line to your scripts."
        },
        {
          q: "Do I need to migrate my cron jobs?",
          a: "No. Keep your cron. Keep your scripts. Just add one curl line at the end of your existing script. DeadManPing doesn't change how your jobs run - it only observes the results."
        },
        {
          q: "Does DeadManPing run my jobs?",
          a: "No. Your cron runs your jobs. DeadManPing only observes the results. DeadManPing doesn't touch execution. We simply wait for your script to ping us when it completes."
        },
        {
          q: "Why must curl be inside the script, not in the cron line?",
          a: "Because only inside the script do you have access to variables from execution results (e.g., count, file size, duration). Data must come from execution, not be hardcoded. This allows you to send meaningful data about what your job actually did."
        },
        {
          q: "How do I get started?",
          a: "1. Sign up for a free account (no credit card required). 2. Create your first monitor and set how often your job should run. 3. Copy the unique ping URL. 4. Add a curl command to the end of your existing script. 5. Configure alerts (email, Slack, or Discord). That's it! Check out our documentation for detailed examples.",
          links: [{ text: "documentation", href: "/docs" }]
        },
        {
          q: "Can I monitor jobs that run on different servers?",
          a: "Yes! As long as the server can make HTTP requests, you can ping from anywhere. Each monitor has a unique URL that works from any server or environment."
        }
      ]
    },
    {
      title: "Pricing & Plans",
      items: [
        {
          q: "How much does DeadManPing cost?",
          a: "DeadManPing offers a free tier with 10 monitors and 5-minute minimum intervals. Paid plans start at $9/month for Starter (25 monitors), $29/month for Pro (100 monitors), and $79/month for Team (500 monitors). Before purchasing a paid plan, you can try it free for 14 days with no credit card required - the trial gives you full access to all plan features."
        },
        {
          q: "What's included in the free tier?",
          a: "The free tier includes 10 monitors, 5-minute minimum intervals, email alerts, and single-user access. Perfect for trying out the service or monitoring personal projects."
        },
        {
          q: "What's the difference between Starter, Pro, and Team plans?",
          a: "Starter ($9/month): 25 monitors, 5-minute intervals, email + Slack/Discord alerts. Pro ($29/month): 100 monitors, 1-minute intervals, up to 3 team members. Team ($79/month): 500 monitors, 1-minute intervals, up to 10 team members, custom webhooks, and priority support."
        },
        {
          q: "Do you offer annual billing?",
          a: "Yes! Annual billing saves you money: Starter saves 10% ($97/year), Pro saves 15% ($296/year), and Team saves 20% ($758/year). You can switch between monthly and annual billing anytime."
        },
        {
          q: "What happens if I exceed my monitor limit?",
          a: "You'll need to upgrade your plan to create more monitors. Existing monitors will continue to work, but you won't be able to create new ones until you upgrade."
        },
        {
          q: "Can I change plans later?",
          a: "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades take effect at the end of your current billing period."
        },
        {
          q: "Is there a free trial?",
          a: "Yes! Before purchasing any paid plan, you can try it free for 14 days with no credit card required. During the trial, you get full access to all features of the plan you're trialing. When you purchase a plan, the trial ends and your paid subscription begins. If you don't purchase, you'll automatically move to the free tier after the trial ends."
        }
      ]
    },
    {
      title: "Technical Questions",
      items: [
        {
          q: "What if my job runs less frequently than 5 minutes?",
          a: "The free tier has a minimum interval of 5 minutes. Upgrade to Starter or Pro plan for longer intervals (up to 1 minute minimum). You can set any interval longer than the minimum."
        },
        {
          q: "What programming languages are supported?",
          a: "Any language that can make HTTP requests! We provide examples for bash, Python, Node.js, Ruby, Go, PHP, and more. Since it's just a simple HTTP POST request, you can use curl, wget, or any HTTP library in your preferred language."
        },
        {
          q: "Can I send custom data with my pings?",
          a: "Yes! You can send JSON payloads with any data you want - success status, counts, file sizes, durations, error messages, etc. You can also set up payload validation rules to ensure your jobs are producing the expected results."
        },
        {
          q: "Are there limits on payload validation fields?",
          a: "Yes. Each monitor can have up to 5 payload validation fields. Field names must be 100 characters or less. Only declared fields are processed during validation - any additional fields in the payload are ignored."
        },
        {
          q: "What happens if my server is offline?",
          a: "If your server is offline and can't ping us, DeadManPing will detect the missed ping and send you an alert. This is exactly what the dead man switch is designed to catch - when your job doesn't run or can't complete."
        },
        {
          q: "How accurate is the monitoring?",
          a: "DeadManPing checks for pings every minute (for Pro/Team plans) or every 5 minutes (for Free/Starter plans). If a ping is expected but doesn't arrive within the time window, you'll be alerted. The system accounts for network delays and timing variations."
        },
        {
          q: "Can I monitor Docker containers?",
          a: "Yes! As long as your container can make HTTP requests (which most can), you can ping from inside Docker containers. Just add the curl command to your containerized script."
        },
        {
          q: "What if I need to report a failure?",
          a: "To report failures, you need to set up payload validation rules in your monitor settings. For example, to detect `{\"success\": false}`: 1) Go to your monitor's settings, 2) Enable 'Payload Validation', 3) Add a field named 'success' with type 'boolean', rule '==' and value 'true'. Now when your job sends `{\"success\": false}`, it will be detected as a failure and trigger alerts. You can also use `?s=fail` in the URL, but you'll need to configure a validation rule for the 's' field (e.g., rule '==' value 'ok') to detect when it's not 'ok'."
        }
      ]
    },
    {
      title: "Alerts & Notifications",
      items: [
        {
          q: "What alert channels are available?",
          a: "Free tier includes email alerts. Starter, Pro, and Team plans add Slack and Discord integrations. Team plan also includes custom webhooks for integration with any service."
        },
        {
          q: "When will I receive alerts?",
          a: "You'll receive alerts when: 1) Your job doesn't ping within the expected time window (missed ping), 2) Your job reports a failure status, 3) Your job recovers after being down. You can also configure alert preferences in your settings."
        },
        {
          q: "Can I disable email alerts?",
          a: "Yes! You can disable email alerts in your account settings. This is useful if you prefer to use only Slack, Discord, or webhooks for notifications."
        },
        {
          q: "How quickly will I be notified?",
          a: "Alerts are sent immediately when a missed ping is detected or a failure is reported. The system checks for missed pings every minute (Pro/Team) or every 5 minutes (Free/Starter)."
        },
        {
          q: "Can I set up different alert channels for different monitors?",
          a: "Yes! You can override alert channels for individual monitors. Go to your monitor's settings and configure the 'Alert Channels' section. If you set alert channels for a specific monitor, those will be used instead of your account-wide defaults. If you don't set monitor-specific channels, the system will use your account-level settings. This allows you to send different monitors' alerts to different Slack channels, Discord servers, or email addresses."
        },
        {
          q: "What information is included in alerts?",
          a: "Alerts include the monitor name, current status (healthy, failed, late, etc.), and the last successful ping time (if available). Each alert also includes a direct link to view the monitor details in your dashboard."
        }
      ]
    },
    {
      title: "Account & Billing",
      items: [
        {
          q: "How do I sign up?",
          a: "Click 'Sign Up' in the navigation or visit the signup page. You can sign up with email/password or use Google OAuth. No credit card required for the free tier or trial.",
          links: [{ text: "signup page", href: "/auth/signup" }]
        },
        {
          q: "Can I use Google OAuth to sign in?",
          a: "Yes! DeadManPing supports Google OAuth for quick and secure sign-in. You can also use traditional email/password authentication."
        },
        {
          q: "How do I cancel my subscription?",
          a: "You can cancel your subscription anytime from your billing settings. Your subscription will remain active until the end of the current billing period, and you'll retain access to all features until then."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards and process payments securely through Stripe. We don't store your payment information - Stripe handles all payment processing."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 14-day free trial before purchasing any paid plan, so you can try before you commit. If you're not satisfied during the trial, you can simply not purchase - no charges will be made. For paid subscriptions, refunds are handled on a case-by-case basis - contact support for assistance."
        },
        {
          q: "Can I invite team members?",
          a: "Yes! Pro plans support up to 3 team members, and Team plans support up to 10. You can invite team members from your workspace settings. They'll have access to all monitors in your workspace."
        },
        {
          q: "What happens to my data if I cancel?",
          a: "Your monitors and data will remain accessible for 30 days after cancellation. After that, data is permanently deleted. You can export your monitor configurations before canceling if needed."
        }
      ]
    },
    {
      title: "Security & Privacy",
      items: [
        {
          q: "Is my data secure?",
          a: "Yes. DeadManPing uses industry-standard security practices including HTTPS encryption, secure authentication, and regular security audits. Your ping URLs contain unique tokens that are difficult to guess, but you should still keep them private."
        },
        {
          q: "What data do you store?",
          a: "We store your account information (email, hashed password), monitor configurations, ping timestamps and status, and optional metadata you send with pings. We don't store the actual content of your scripts or job outputs - only the data you explicitly send us."
        },
        {
          q: "Can I make my ping URLs private?",
          a: "Your ping URLs already contain unique, hard-to-guess tokens. However, if someone knows your URL, they can send pings to your monitor. For sensitive use cases, consider using custom webhooks (Team plan) or implementing additional authentication in your scripts."
        },
        {
          q: "Do you share my data with third parties?",
          a: "No. We don't sell or share your data with third parties. We use Stripe for payment processing (they handle payment data) and may use analytics services to improve our product, but your monitoring data is never shared. See our Privacy Policy for details.",
          links: [{ text: "Privacy Policy", href: "/legal/privacy" }]
        },
        {
          q: "How do you handle GDPR compliance?",
          a: "DeadManPing is GDPR compliant. You can request access to, correction of, or deletion of your data at any time. Contact support or visit your account settings to manage your data."
        }
      ]
    },
    {
      title: "Use Cases",
      items: [
        {
          q: "What can I monitor with DeadManPing?",
          a: "You can monitor any scheduled task or cron job: database backups, data sync jobs, report generation, cleanup scripts, API health checks, scheduled maintenance tasks, and more. If it runs on a schedule and can make an HTTP request, you can monitor it."
        },
        {
          q: "Can I monitor backup jobs?",
          a: "Yes! Backup monitoring is one of the most common use cases. You can verify that backups run on schedule, check backup file sizes, and ensure backups complete successfully. See our backup monitoring guide for examples.",
          links: [{ text: "backup monitoring guide", href: "/backup-monitoring" }]
        },
        {
          q: "Can I use this as a dead man switch?",
          a: "Absolutely! That's exactly what DeadManPing is designed for. If you don't ping us within the expected time window, we assume something is wrong and alert you. Perfect for personal safety, server monitoring, or any situation where regular check-ins are critical."
        },
        {
          q: "Can I monitor cron jobs?",
          a: "Yes! Cron job monitoring is our primary use case. You can monitor any cron job without changing how it runs - just add one curl line to your existing scripts. See our cron monitoring guide for details.",
          links: [{ text: "cron monitoring guide", href: "/monitor-cron-jobs" }]
        },
        {
          q: "Can I verify job results, not just that they ran?",
          a: "Yes! You can send custom data with your pings (counts, file sizes, success status, etc.) and set up payload validation rules. This lets you verify not just that your job ran, but that it produced the expected results."
        }
      ]
    },
    {
      title: "Support & Resources",
      items: [
        {
          q: "Where can I find documentation?",
          a: "Check out our documentation page for quick start guides, API reference, and code examples in multiple programming languages.",
          links: [{ text: "documentation page", href: "/docs" }]
        },
        {
          q: "How do I contact support?",
          a: "You can contact support through the contact form or email us directly. Team plan customers get priority support with 24-hour response time.",
          links: [{ text: "contact form", href: "/contact" }]
        },
        {
          q: "Can I integrate DeadManPing with other services?",
          a: "Yes! Team plan includes custom webhooks, and all paid plans support Slack and Discord integrations. You can also use our API (Team plan) to build custom integrations."
        },
        {
          q: "Do you have a status page?",
          a: "DeadManPing itself is monitored and highly available. If you experience issues, please contact support. We maintain 99.9% uptime for our monitoring service."
        }
      ]
    }
  ]

  let itemIndex = 0

  return (
    <div className="min-h-screen text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <PageNav />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <AnimatedSection>
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
          <header className="mb-8 sm:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about DeadManPing. Can't find what you're looking for? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
            </p>
          </header>
        </AnimatedSection>

        <div className="space-y-8 sm:space-y-12">
          {faqSections.map((section, sectionIndex) => (
            <AnimatedSection key={sectionIndex} delay={sectionIndex * 100}>
              <div className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-foreground">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => {
                    const currentIndex = itemIndex++
                    const isOpen = openItems.has(currentIndex)
                    return (
                      <AnimatedItem key={itemIdx} delay={itemIdx * 50}>
                        <div className="border-b border-border last:border-b-0 pb-4 last:pb-0">
                          <button
                            onClick={() => toggleItem(currentIndex)}
                            className="w-full text-left flex items-start justify-between gap-4 py-2 hover:text-foreground transition-colors group"
                          >
                            <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors pr-8">
                              {item.q}
                            </h3>
                            <svg
                              className={`w-5 h-5 flex-shrink-0 mt-1 text-muted-foreground transition-transform ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                          >
                            <div className="pt-2 pb-2 text-muted-foreground prose prose-sm max-w-none">
                              <p>
                                {item.links && item.links.length > 0 ? (
                                  (() => {
                                    let text = item.a
                                    const elements: (string | ReactElement)[] = []
                                    let lastIndex = 0
                                    
                                    item.links.forEach((link, linkIndex) => {
                                      const linkIndexInText = text.toLowerCase().indexOf(link.text.toLowerCase(), lastIndex)
                                      if (linkIndexInText !== -1) {
                                        // Add text before link
                                        if (linkIndexInText > lastIndex) {
                                          elements.push(text.substring(lastIndex, linkIndexInText))
                                        }
                                        // Add link
                                        elements.push(
                                          <Link key={linkIndex} href={link.href} className="text-primary hover:underline">
                                            {link.text}
                                          </Link>
                                        )
                                        lastIndex = linkIndexInText + link.text.length
                                      }
                                    })
                                    
                                    // Add remaining text
                                    if (lastIndex < text.length) {
                                      elements.push(text.substring(lastIndex))
                                    }
                                    
                                    return elements.length > 0 ? elements : text
                                  })()
                                ) : (
                                  item.a
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </AnimatedItem>
                    )
                  })}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={800}>
          <div className="mt-12 sm:mt-16 text-center bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              We're here to help! Check out our <Link href="/docs" className="text-primary hover:underline">documentation</Link> or <Link href="/contact" className="text-primary hover:underline">contact our support team</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/docs"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth inline-block text-center"
              >
                View Documentation
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-card border border-border rounded-lg hover:bg-accent transition-smooth inline-block text-center"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <StaticLogo showText={true} variant="with-text" className="text-lg" />
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

