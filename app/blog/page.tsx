import Link from 'next/link'
import type { Metadata } from 'next'
import { PageNav } from '@/components/PageNav'
import { Footer } from '@/components/Footer'
import { BlogList } from '@/components/BlogList'
import { blogMetadata } from '@/lib/blog-metadata'
import { AnimatedSection } from '@/components/AnimatedSection'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

export const metadata: Metadata = {
  title: "Blog | Cron Monitoring & Backup Monitoring Guides | DeadManPing",
  description: "Learn how to monitor cron jobs, detect backup failures, verify job completion, and prevent silent failures. Comprehensive guides with code examples in Bash, Python, and Node.js.",
  keywords: "cron monitoring blog, backup monitoring guides, cron job monitoring tutorials, detect cron failures, verify backup completion, silent failure detection, cron job troubleshooting, backup monitoring best practices",
  openGraph: {
    title: "Blog | DeadManPing",
    description: "Learn how to monitor cron jobs, detect backup failures, verify job completion, and prevent silent failures.",
    type: "website",
    url: `${cleanBaseUrl}/blog`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | DeadManPing",
    description: "Learn how to monitor cron jobs, detect backup failures, verify job completion, and prevent silent failures.",
  },
  alternates: {
    canonical: `${cleanBaseUrl}/blog`,
  },
}

// Convert blogMetadata to array format
const allArticles = Object.entries(blogMetadata).map(([slug, metadata]) => ({
  slug,
  metadata,
}))

// Sort articles: featured first, then by title
const featuredSlugs = [
  'monitor-cron-jobs',
  'dead-man-switch',
  'backup-monitoring',
  'cron-job-failed',
]

const sortedArticles = [
  ...allArticles.filter(({ slug }) => featuredSlugs.includes(slug)),
  ...allArticles.filter(({ slug }) => !featuredSlugs.includes(slug)).sort((a, b) => 
    a.metadata.title.localeCompare(b.metadata.title)
  ),
]

export default function BlogPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "url": `${cleanBaseUrl}/blog`,
    "name": "DeadManPing Blog",
    "description": "Comprehensive guides on cron monitoring, backup monitoring, and job failure detection",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": allArticles.length,
      "itemListElement": sortedArticles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "url": `${cleanBaseUrl}/blog/${article.slug}`,
          "headline": article.metadata.title.replace(' | DeadManPing', ''),
          "description": article.metadata.description,
        }
      }))
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${cleanBaseUrl}/icon.png`,
        "width": 1200,
        "height": 1200
      }
    },
    "inLanguage": "en-US"
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": cleanBaseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${cleanBaseUrl}/blog`
      }
    ]
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PageNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-8 sm:mb-12">
            <div className="mb-4">
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
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Blog
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl">
              Learn how to monitor cron jobs, detect backup failures, verify job completion, 
              and prevent silent failures. Comprehensive guides with code examples.
            </p>
          </div>
        </AnimatedSection>

        {/* Blog List with Search and Filters */}
        <BlogList articles={allArticles} featuredSlugs={featuredSlugs} />

        {/* CTA Section */}
        <AnimatedSection>
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
            <div className="bg-card border-2 border-primary/20 rounded-lg sm:rounded-xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Ready to Start Monitoring?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Start monitoring your cron jobs and backups in minutes. 
                  No migration required. Keep your existing setup. Add one curl line.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/auth/signup"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                  >
                    Start Free Trial
                  </Link>
                  <Link
                    href="/docs"
                    className="border border-border text-foreground hover:bg-muted px-6 py-3 rounded-lg font-medium inline-block transition-smooth hover-lift"
                  >
                    View Documentation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  )
}

