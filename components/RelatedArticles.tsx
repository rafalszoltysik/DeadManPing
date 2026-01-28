import Link from 'next/link'
import { AnimatedSection } from '@/components/AnimatedSection'
import { getRelatedArticles, type RelatedArticle } from '@/lib/blog-related-articles'

interface RelatedArticlesProps {
  slug: string
}

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

