/**
 * Blog search and filter component.
 * 
 * Provides search input and category filtering for blog articles. Filters
 * articles by search query (title/description/keywords) and selected category.
 * Calls optional callback when filters change. Memoized for performance.
 * 
 * Does not fetch articles - filters provided articles array.
 */

'use client'

import { useState, useMemo, memo, useCallback } from 'react'
import type { BlogPostMetadata } from '@/lib/blog-metadata'

interface BlogSearchProps {
  articles: Array<{ slug: string; metadata: BlogPostMetadata }>
  onFilterChange?: (filtered: Array<{ slug: string; metadata: BlogPostMetadata }>) => void
}

const CATEGORIES = [
  'All',
  'Backup Monitoring',
  'Cron Monitoring',
  'Verification',
  'Failure Detection',
  'General'
] as const

export const BlogSearch = memo(function BlogSearch({ articles, onFilterChange }: BlogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const filteredArticles = useMemo(() => {
    let filtered = articles

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(({ slug }) => {
        if (selectedCategory === 'Backup Monitoring' && slug.includes('backup')) return true
        if (selectedCategory === 'Cron Monitoring' && slug.includes('cron')) return true
        if (selectedCategory === 'Verification' && (slug.includes('curl') || slug.includes('verify'))) return true
        if (selectedCategory === 'Failure Detection' && (slug.includes('detect') || slug.includes('silent'))) return true
        if (selectedCategory === 'General') {
          return !slug.includes('backup') && !slug.includes('cron') && !slug.includes('curl') && !slug.includes('verify') && !slug.includes('detect') && !slug.includes('silent')
        }
        return false
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(({ metadata, slug }) => {
        const title = metadata.title.toLowerCase()
        const description = metadata.description.toLowerCase()
        const keywords = (metadata.keywords || '').toLowerCase()
        const slugLower = slug.toLowerCase()
        
        return (
          title.includes(query) ||
          description.includes(query) ||
          keywords.includes(query) ||
          slugLower.includes(query)
        )
      })
    }

    // Notify parent component
    if (onFilterChange) {
      onFilterChange(filtered)
    }

    return filtered
  }, [articles, searchQuery, selectedCategory, onFilterChange])

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg sm:rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30'
            }`}
          >
            {category}
            {category !== 'All' && (
              <span className="ml-2 text-xs opacity-75">
                ({articles.filter(({ slug }) => {
                  if (category === 'Backup Monitoring') return slug.includes('backup')
                  if (category === 'Cron Monitoring') return slug.includes('cron')
                  if (category === 'Verification') return slug.includes('curl') || slug.includes('verify')
                  if (category === 'Failure Detection') return slug.includes('detect') || slug.includes('silent')
                  if (category === 'General') {
                    return !slug.includes('backup') && !slug.includes('cron') && !slug.includes('curl') && !slug.includes('verify') && !slug.includes('detect') && !slug.includes('silent')
                  }
                  return false
                }).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredArticles.length} of {articles.length} articles
        {searchQuery && ` matching "${searchQuery}"`}
      </div>
    </div>
  )
})

export function useFilteredArticles(
  articles: Array<{ slug: string; metadata: BlogPostMetadata }>,
  searchQuery: string,
  selectedCategory: string
) {
  return useMemo(() => {
    let filtered = articles

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(({ slug }) => {
        if (selectedCategory === 'Backup Monitoring' && slug.includes('backup')) return true
        if (selectedCategory === 'Cron Monitoring' && slug.includes('cron')) return true
        if (selectedCategory === 'Verification' && (slug.includes('curl') || slug.includes('verify'))) return true
        if (selectedCategory === 'Failure Detection' && (slug.includes('detect') || slug.includes('silent'))) return true
        if (selectedCategory === 'General') {
          return !slug.includes('backup') && !slug.includes('cron') && !slug.includes('curl') && !slug.includes('verify') && !slug.includes('detect') && !slug.includes('silent')
        }
        return false
      })
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(({ metadata, slug }) => {
        const title = metadata.title.toLowerCase()
        const description = metadata.description.toLowerCase()
        const keywords = (metadata.keywords || '').toLowerCase()
        const slugLower = slug.toLowerCase()
        
        return (
          title.includes(query) ||
          description.includes(query) ||
          keywords.includes(query) ||
          slugLower.includes(query)
        )
      })
    }

    return filtered
  }, [articles, searchQuery, selectedCategory])
}

