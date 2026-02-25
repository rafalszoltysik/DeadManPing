/**
 * SEO helper functions for generating structured data schemas.
 * 
 * Provides functions to create Schema.org Article and BreadcrumbList schemas
 * for blog posts. Used for SEO optimization and rich snippets in search results.
 * 
 * Does not handle page rendering - only generates JSON-LD structured data.
 */

/**
 * Returns the canonical base URL (HTTPS, no www) for the site.
 * Use for all canonical URLs, sitemap, robots, and structured data
 * so Google indexes a single canonical domain.
 */
export function getCanonicalBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
  return baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')
}

const cleanBaseUrl = getCanonicalBaseUrl()

export interface ArticleSchemaOptions {
  slug: string
  headline: string
  description: string
  keywords: string
  articleSection: string
  datePublished?: string
  dateModified?: string
}

export interface BreadcrumbSchemaOptions {
  slug: string
  title: string
}

/**
 * Creates Schema.org Article structured data for blog posts.
 * 
 * Generates complete Article schema with author, publisher, and metadata.
 * 
 * @param options - Article metadata (slug, headline, description, keywords, etc.)
 * @returns Article schema object for JSON-LD
 */
export function createArticleSchema(options: ArticleSchemaOptions) {
  const {
    slug,
    headline,
    description,
    keywords,
    articleSection,
    datePublished = "2026-01-01",
    dateModified = new Date().toISOString().split('T')[0]
  } = options

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "url": `${cleanBaseUrl}/blog/${slug}`,
    "headline": headline,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": cleanBaseUrl
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
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${cleanBaseUrl}/blog/${slug}`
    },
    "articleSection": articleSection,
    "keywords": keywords,
    "inLanguage": "en-US"
  }
}

/**
 * Creates Schema.org BreadcrumbList structured data for navigation.
 * 
 * Generates breadcrumb schema with Home and current page items.
 * 
 * @param options - Breadcrumb metadata (slug, title)
 * @returns BreadcrumbList schema object for JSON-LD
 */
export function createBreadcrumbSchema(options: BreadcrumbSchemaOptions) {
  const { slug, title } = options

  return {
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
        "name": title,
        "item": `${cleanBaseUrl}/blog/${slug}`
      }
    ]
  }
}


