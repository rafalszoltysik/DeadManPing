/**
 * Robots.txt generator for search engine crawlers.
 * 
 * Defines which paths should be crawled and which should be excluded.
 * Blocks dashboard, API, auth, and private file types. Points to sitemap.
 * Used by Next.js App Router for /robots.txt route.
 * 
 * Does not handle sitemap generation - see sitemap.ts for that.
 */

import { MetadataRoute } from 'next'
import { getCanonicalBaseUrl } from '@/lib/seo-helpers'

/**
 * Generates robots.txt configuration.
 * 
 * Excludes private paths and file types, allows public pages.
 * Uses canonical base URL (HTTPS, no www) so crawlers discover the same domain as sitemap.
 * 
 * @returns Robots.txt configuration with rules and sitemap URL
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getCanonicalBaseUrl()
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/auth/',
          '/examples/',
          '/scripts/',
          // Exclude private file types
          '/*.sh',
          '/*.py',
          '/*.js',
          '/*.ts',
          '/*.json',
          '/*.env',
          '/*.config',
          '/*.log',
          '/*.tmp',
          // Exclude files in subdirectories
          '/examples/*.sh',
          '/examples/*.py',
          '/examples/*.js',
          '/scripts/*.ts',
          '/scripts/*.js',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

