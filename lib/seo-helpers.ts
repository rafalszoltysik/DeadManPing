/**
 * SEO Helper Functions for DeadManPing
 * Provides standardized functions for creating structured data schemas
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

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
 * Creates a complete Article schema for blog posts
 */
export function createArticleSchema(options: ArticleSchemaOptions) {
  const {
    slug,
    headline,
    description,
    keywords,
    articleSection,
    datePublished = "2024-12-01",
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
 * Creates a BreadcrumbList schema for navigation
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

/**
 * Gets the clean base URL for use in components
 */
export function getCleanBaseUrl(): string {
  return cleanBaseUrl
}

