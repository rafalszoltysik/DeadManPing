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
        disallow: ['/dashboard/', '/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

