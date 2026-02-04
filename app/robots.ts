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

/**
 * Generates robots.txt configuration.
 * 
 * Excludes private paths and file types, allows public pages.
 * 
 * @returns Robots.txt configuration with rules and sitemap URL
 */
export default function robots(): MetadataRoute.Robots {
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
  // Ensure baseUrl is without www for SEO consistency (canonical URL)
  baseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')
  
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

