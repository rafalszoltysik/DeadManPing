'use client'

import { useState, useMemo, memo } from 'react'
import type { BlogPostMetadata } from '@/lib/blog-metadata'
import { BlogCard } from './BlogCard'
import { BlogSearch } from './BlogSearch'
import { AnimatedSection, AnimatedItem } from './AnimatedSection'

interface BlogListProps {
  articles: Array<{ slug: string; metadata: BlogPostMetadata }>
  featuredSlugs?: string[]
}

const CATEGORIES = [
  'All',
  'Backup Monitoring',
  'Cron Monitoring',
  'Verification',
  'Failure Detection',
  'General'
] as const

function getCategory(slug: string): string {
  if (slug.includes('backup')) return 'Backup Monitoring'
  if (slug.includes('cron')) return 'Cron Monitoring'
  if (slug.includes('curl') || slug.includes('verify')) return 'Verification'
  if (slug.includes('detect') || slug.includes('silent')) return 'Failure Detection'
  return 'General'
}

function matchesCategory(slug: string, category: string): boolean {
  if (category === 'All') return true
  return getCategory(slug) === category
}

function matchesSearch(article: { slug: string; metadata: BlogPostMetadata }, query: string): boolean {
  if (!query.trim()) return true
  
  const searchQuery = query.toLowerCase().trim()
  const title = article.metadata.title.toLowerCase()
  const description = article.metadata.description.toLowerCase()
  const keywords = (article.metadata.keywords || '').toLowerCase()
  const slugLower = article.slug.toLowerCase()
  
  return (
    title.includes(searchQuery) ||
    description.includes(searchQuery) ||
    keywords.includes(searchQuery) ||
    slugLower.includes(searchQuery)
  )
}

export const BlogList = memo(function BlogList({ articles, featuredSlugs = [] }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  const filteredArticles = useMemo(() => {
    return articles.filter(article => 
      matchesCategory(article.slug, selectedCategory) &&
      matchesSearch(article, searchQuery)
    )
  }, [articles, searchQuery, selectedCategory])

  const featuredArticles = useMemo(() => {
    return filteredArticles.filter(({ slug }) => featuredSlugs.includes(slug))
  }, [filteredArticles, featuredSlugs])

  const regularArticles = useMemo(() => {
    return filteredArticles.filter(({ slug }) => !featuredSlugs.includes(slug))
  }, [filteredArticles, featuredSlugs])

  return (
    <>
      {/* Search and Filters */}
      <AnimatedSection>
        <div className="mb-8 sm:mb-12">
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
              {CATEGORIES.map((category) => {
                const count = category === 'All' 
                  ? articles.length 
                  : articles.filter(({ slug }) => getCategory(slug) === category).length
                
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/30'
                    }`}
                  >
                    {category}
                    {category !== 'All' && (
                      <span className="ml-2 text-xs opacity-75">
                        ({count})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              Showing {filteredArticles.length} of {articles.length} articles
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && (
        <AnimatedSection>
          <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              {featuredArticles.map((article) => (
                <AnimatedItem key={article.slug} className="h-full">
                  <BlogCard slug={article.slug} metadata={article.metadata} />
                </AnimatedItem>
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* All Articles Section */}
      <AnimatedSection>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {searchQuery || selectedCategory !== 'All' ? 'Filtered Articles' : 'All Articles'}
          </h2>
          {regularArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {regularArticles.map((article) => (
                <AnimatedItem key={article.slug} className="h-full">
                  <BlogCard slug={article.slug} metadata={article.metadata} />
                </AnimatedItem>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No articles found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('All')
                }}
                className="mt-4 text-primary hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </AnimatedSection>
    </>
  )
})

