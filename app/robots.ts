import { MetadataRoute } from 'next'

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

