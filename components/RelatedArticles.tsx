/**
 * Related articles section component for blog posts.
 * 
 * Displays curated list of related articles based on blog post slug. Uses
 * manually curated mappings from blog-related-articles.ts. Used at bottom
 * of blog posts for internal linking and SEO. Server component.
 * 
 * Does not calculate relatedness algorithmically - uses curated mappings.
 */

import Link from 'next/link'
import { AnimatedSection } from '@/components/AnimatedSection'
import { getRelatedArticles } from '@/lib/blog-related-articles'

interface RelatedArticlesProps {
  slug: string
}

/**
 * Renders related articles section for blog post.
 * 
 * @param slug - Current blog post slug to find related articles
 * @returns Related articles section or null if none found
 */
export function RelatedArticles({ slug }: RelatedArticlesProps) {
  const articles = getRelatedArticles(slug)
  
  if (articles.length === 0) {
    return null
  }

  return (
    <AnimatedSection>
      <section className="bg-card border border-border rounded-lg sm:rounded-xl p-6 sm:p-8 card-hover">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">
          Related Articles
        </h2>
        <p className="text-muted-foreground mb-6">
          Learn more about cron job monitoring and troubleshooting:
        </p>
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/blog/${article.slug}`}
                className="block group"
              >
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AnimatedSection>
  )
}

