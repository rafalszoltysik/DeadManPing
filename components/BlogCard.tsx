/**
 * Blog post card component for article listings.
 * 
 * Displays blog post preview with title, description, category badge, and link.
 * Extracts category from slug/keywords for categorization. Used in blog list
 * and search results. Memoized for performance.
 * 
 * Does not render full article - only preview card linking to article page.
 */

import Link from 'next/link'
import { memo } from 'react'
import type { BlogPostMetadata } from '@/lib/blog-metadata'

interface BlogCardProps {
  slug: string
  metadata: BlogPostMetadata
}

/**
 * Renders blog post preview card.
 * 
 * @param slug - Blog post slug for URL generation
 * @param metadata - Blog post metadata (title, description, keywords)
 */
export const BlogCard = memo(function BlogCard({ slug, metadata }: BlogCardProps) {
  // Extract category from keywords or slug
  const getCategory = () => {
    if (slug.includes('backup')) return 'Backup Monitoring'
    if (slug.includes('cron')) return 'Cron Monitoring'
    if (slug.includes('curl') || slug.includes('verify')) return 'Verification'
    if (slug.includes('detect') || slug.includes('silent')) return 'Failure Detection'
    return 'General'
  }

  const category = getCategory()

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block h-full bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {category}
          </span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {metadata.title.replace(' | DeadManPing', '')}
        </h2>
        
        <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-3 flex-grow">
          {metadata.description}
        </p>
        
        <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
          <span>Read article</span>
          <svg
            className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
})

