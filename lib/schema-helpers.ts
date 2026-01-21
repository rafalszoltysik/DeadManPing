/**
 * Helper functions for generating Schema.org structured data
 * Useful for LLM/AI search engine optimization
 */

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'

export interface ArticleSchemaOptions {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  articleSection?: string
  keywords?: string
}

export function generateArticleSchema(options: ArticleSchemaOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": options.headline,
    "description": options.description,
    "url": options.url,
    "datePublished": options.datePublished || new Date().toISOString().split('T')[0],
    "dateModified": options.dateModified || new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "DeadManPing",
      "url": baseUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": options.url
    },
    "articleSection": options.articleSection || "Cron Monitoring Guides",
    "keywords": options.keywords || "",
    "inLanguage": "en-US"
  }
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }
}

export function generateVideoSchema(options: {
  name: string
  description: string
  thumbnailUrl?: string
  uploadDate?: string
  duration?: string
  contentUrl?: string
  embedUrl?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": options.name,
    "description": options.description,
    "thumbnailUrl": options.thumbnailUrl || `${baseUrl}/icon.svg`,
    "uploadDate": options.uploadDate || new Date().toISOString().split('T')[0],
    "duration": options.duration || "PT2M",
    "contentUrl": options.contentUrl || "",
    "embedUrl": options.embedUrl || "",
    "publisher": {
      "@type": "Organization",
      "name": "DeadManPing",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/icon.svg`
      }
    }
  }
}

