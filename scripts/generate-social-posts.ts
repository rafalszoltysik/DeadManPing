#!/usr/bin/env node

/**
 * Script to generate social media posts (Hacker News, Twitter/X, Threads) from blog posts
 * 
 * Usage:
 *   npm run generate-social-posts
 *   or
 *   npx tsx scripts/generate-social-posts.ts
 * 
 * Output: generates social-posts/SOCIAL_POSTS_READY.md with ready-to-paste posts for all platforms
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://deadmanping.com'
const cleanBaseUrl = baseUrl.replace(/^https?:\/\/(www\.)?/, 'https://')

// Pages to exclude from posts (not blog content)
const EXCLUDED_PATHS = [
  '/',
  '/docs',
  '/faq',
  '/contact',
  '/auth/login',
  '/auth/signup',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/legal/opt-out',
]

interface BlogPost {
  url: string
  slug: string
  title: string
  description: string
}

/**
 * Extract blog posts from sitemap and metadata
 */
function extractBlogPosts(): BlogPost[] {
  const sitemapPath = join(process.cwd(), 'app', 'sitemap.ts')
  const metadataPath = join(process.cwd(), 'lib', 'blog-metadata.ts')
  
  const sitemapContent = readFileSync(sitemapPath, 'utf-8')
  const metadataContent = readFileSync(metadataPath, 'utf-8')
  
  // Extract metadata map
  const metadataMatch = metadataContent.match(/export const blogMetadata: Record<string, BlogPostMetadata> = ({[\s\S]*?})/m)
  if (!metadataMatch) {
    throw new Error('Could not find blogMetadata in blog-metadata.ts')
  }
  
  // Extract URLs from sitemap.ts
  const urlPattern = /url:\s*`\$\{baseUrl\}([^`]+)`/g
  const posts: BlogPost[] = []
  const seenPaths = new Set<string>()

  const matches = sitemapContent.matchAll(urlPattern)
  
  for (const match of matches) {
    let path = match[1]
    
    // Skip if already seen
    if (seenPaths.has(path)) {
      continue
    }
    seenPaths.add(path)
    
    // Skip excluded paths
    if (EXCLUDED_PATHS.includes(path)) {
      continue
    }

    // Only include blog paths
    if (!path.startsWith('/blog/')) {
      continue
    }

    // Extract slug from /blog/slug path
    const slug = path.replace(/^\/blog\//, '')
    const fullUrl = `${cleanBaseUrl}${path}`

    // Extract metadata for this slug
    const titleMatch = metadataContent.match(new RegExp(`${slug}:\\s*{[\\s\\S]*?title:\\s*"([^"]+)"`, 'm'))
    const descMatch = metadataContent.match(new RegExp(`${slug}:\\s*{[\\s\\S]*?description:\\s*"([^"]+)"`, 'm'))
    
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*DeadManPing.*$/, '') : slug
    const description = descMatch ? descMatch[1] : ''

    posts.push({
      url: fullUrl,
      slug,
      title,
      description,
    })
  }

  return posts
}

/**
 * Generate Twitter/X post - short, hook-focused, problem-oriented
 */
function generateTwitterPost(post: BlogPost): string {
  const url = `${post.url}?utm_source=twitter&utm_medium=social&utm_campaign=blog_post`
  
  // Extract key problem/benefit from description
  const problemWords = ['fail', 'error', 'wrong', 'missing', 'silent', 'empty', 'not running', 'stopped', 'incorrectly']
  const hasProblem = problemWords.some(word => post.description.toLowerCase().includes(word))
  
  let tweet = ''
  
  if (hasProblem) {
    // Problem-focused hook - extract the core problem
    const descLower = post.description.toLowerCase()
    const titleLower = post.title.toLowerCase()
    
    // Try to create a hook based on the problem and title
    if (descLower.includes('not running') || descLower.includes('stopped') || titleLower.includes('not running')) {
      tweet = `Your cron job stopped running.\nNo alerts. No errors. Just silence.\n\nDeadManPing detects when jobs don't run at all.\n\n${url}`
    } else if (descLower.includes('empty') || descLower.includes('zero') || titleLower.includes('empty')) {
      tweet = `Your backup cron: exit code 0\nYour backup file: 0 bytes\n\nMost monitoring tools would say "all good" because the job ran.\n\nDeadManPing caught it because it checks results, not just execution.\n\n${url}`
    } else if (descLower.includes('wrong response') || descLower.includes('wrong data') || titleLower.includes('wrong')) {
      tweet = `Curl returns 200. Looks good, right?\n\nBut the response contains error messages.\n\nDeadManPing verifies response content, not just status codes.\n\n${url}`
    } else if (descLower.includes('silent') || descLower.includes('fail silently')) {
      tweet = `Error trackers tell you when your job crashed.\nDeadManPing tells you when it succeeded incorrectly.\n\nOne curl line. Verify results, not assumptions.\n\n${url}`
    } else if (descLower.includes('exit code') || descLower.includes('exit status')) {
      const problemPart = post.description.split('.')[0]
      tweet = `${problemPart}.\n\nDeadManPing checks exit codes AND results.\n\n${url}`
    } else {
      // Generic problem hook - use first sentence of description
      const problemPart = post.description.split('.')[0]
      if (problemPart.length > 100) {
        tweet = `${problemPart.substring(0, 97)}...\n\nOne curl line. Verify results, not assumptions.\n\n${url}`
      } else {
        tweet = `${problemPart}.\n\nOne curl line. Verify results, not assumptions.\n\n${url}`
      }
    }
  } else {
    // Benefit-focused hook
    const shortDesc = post.description.length > 80 
      ? post.description.substring(0, 77) + '...'
      : post.description
    tweet = `${post.title}\n\n${shortDesc}\n\n${url}`
  }
  
  // Ensure it's under 280 characters (with some buffer)
  if (tweet.length > 270) {
    // Try to shorten by removing middle parts
    const lines = tweet.split('\n')
    if (lines.length > 4) {
      // Keep first 2 lines, last 2 lines (url)
      tweet = lines.slice(0, 2).join('\n') + '\n\n' + lines.slice(-2).join('\n')
    } else {
      // Fallback: truncate description
      const words = tweet.split(' ')
      tweet = words.slice(0, -3).join(' ') + '...\n\n' + url
    }
  }
  
  return tweet
}

/**
 * Generate Threads post - longer, story-driven, more detailed
 */
function generateThreadsPost(post: BlogPost): string {
  const url = `${post.url}?utm_source=threads&utm_medium=social&utm_campaign=blog_post`
  
  // Threads allows longer posts, more story-driven
  const descLower = post.description.toLowerCase()
  
  // Create story-driven post based on the problem type
  let threadsPost = ''
  
  const titleLower = post.title.toLowerCase()
  
  if (descLower.includes('not running') || descLower.includes('stopped') || titleLower.includes('not running')) {
    threadsPost = `Your cron job stopped running.\n\n`
    threadsPost += `No alerts. No errors. Just silence.\n\n`
    threadsPost += `Most monitoring tools only check if the job ran. They won't tell you when it stops running entirely.\n\n`
    threadsPost += `DeadManPing detects when jobs don't run at all, not just when they fail.\n\n`
    threadsPost += `One curl line. Works with your existing cron setup.\n\n`
  } else if (descLower.includes('backup') && (descLower.includes('empty') || descLower.includes('zero') || titleLower.includes('empty'))) {
    threadsPost = `Ever had a cron job that "succeeded" but didn't actually work?\n\n`
    threadsPost += `Your backup script: exit code 0\n`
    threadsPost += `The backup file: 0 bytes\n\n`
    threadsPost += `Your sync job: completed\n`
    threadsPost += `Records processed: 3 instead of 1000\n\n`
    threadsPost += `Traditional monitoring won't catch this.\n\n`
    threadsPost += `DeadManPing fixes it by monitoring results, not just execution. One curl line. Works with any language.\n\n`
  } else if (descLower.includes('wrong response') || descLower.includes('wrong data') || titleLower.includes('wrong')) {
    threadsPost = `Curl returns 200. Looks good, right?\n\n`
    threadsPost += `But the response contains error messages or wrong data.\n\n`
    threadsPost += `Most monitoring tools check status codes, not response content.\n\n`
    threadsPost += `DeadManPing verifies response content, not just status codes.\n\n`
    threadsPost += `One curl line. Works with any API endpoint.\n\n`
  } else if (descLower.includes('silent') || descLower.includes('fail silently') || titleLower.includes('silent')) {
    threadsPost = `Most cron jobs don't fail loudly. They succeed incorrectly.\n\n`
    threadsPost += `Your backup script returns exit code 0, but the file is empty.\n`
    threadsPost += `Your sync job finishes, but only 3 rows processed instead of 1000.\n\n`
    threadsPost += `DeadManPing catches silent failures by verifying results, not execution.\n\n`
    threadsPost += `One curl line. Zero code changes. Works with bash, Python, Node, Ruby, PHP, Go.\n\n`
  } else {
    // Generic story-driven post
    threadsPost = `Ever had a cron job that "succeeded" but didn't actually work?\n\n`
    threadsPost += `${post.description}\n\n`
    threadsPost += `Traditional monitoring won't catch this.\n\n`
    threadsPost += `DeadManPing fixes it by monitoring results, not just execution. One curl line. Works with any language.\n\n`
  }
  
  threadsPost += url
  
  // Threads can be longer, but keep it reasonable (max ~500 chars)
  if (threadsPost.length > 500) {
    const sentences = threadsPost.split('\n\n')
    // Keep first few paragraphs and last line (url)
    threadsPost = sentences.slice(0, -1).join('\n\n') + '\n\n' + url
    if (threadsPost.length > 500) {
      threadsPost = sentences.slice(0, 3).join('\n\n') + '\n\n' + url
    }
  }
  
  return threadsPost
}

/**
 * Generate HN post format - Link Post (title + link)
 */
function generateHNPost(post: BlogPost): { title: string; url: string } {
  const url = `${post.url}?utm_source=hackernews&utm_medium=social&utm_campaign=linkpost`
  const title = `${post.title} – DeadManPing`
  
  return { title, url }
}

/**
 * Main function
 */
function main() {
  console.log('Generating social media posts from blog posts...')
  
  const posts = extractBlogPosts()
  
  if (posts.length === 0) {
    console.error('No blog posts found!')
    process.exit(1)
  }

  console.log(`Found ${posts.length} blog posts`)

  // Generate markdown file with all posts
  let markdown = `# Social Media Posts - Ready to Publish\n\n`
  markdown += `**Generated:** ${new Date().toISOString()}\n`
  markdown += `**Total posts:** ${posts.length}\n\n`
  markdown += `---\n\n`
  
  // Instructions
  markdown += `## Instructions\n\n`
  markdown += `### Hacker News\n`
  markdown += `1. Copy Title + Link from HN section\n`
  markdown += `2. Go to https://news.ycombinator.com/submit\n`
  markdown += `3. Paste title in "title" field\n`
  markdown += `4. Paste link in "url" field\n`
  markdown += `5. Submit (no body text needed)\n`
  markdown += `6. Optionally add a comment after publishing if thread gets attention\n`
  markdown += `**Timing:** 12:00-14:00 UTC (13:00-15:00 CET) - wtorek-czwartek\n\n`
  
  markdown += `### Twitter/X\n`
  markdown += `1. Copy post from Twitter section\n`
  markdown += `2. Paste directly into Twitter/X\n`
  markdown += `3. Adjust hashtags if needed (#DevOps #CronJobs #Monitoring)\n`
  markdown += `4. Post\n`
  markdown += `**Timing:** 14:00-19:00 UTC (15:00-20:00 CET)\n`
  markdown += `**Length:** ~150-250 characters\n\n`
  
  markdown += `### Threads\n`
  markdown += `1. Copy post from Threads section\n`
  markdown += `2. Paste directly into Threads\n`
  markdown += `3. Post\n`
  markdown += `**Timing:** 15:00-20:00 UTC (16:00-21:00 CET)\n`
  markdown += `**Length:** ~300-500 characters\n\n`
  
  markdown += `---\n\n`

  // Create output directory if it doesn't exist
  const outputDir = join(process.cwd(), 'social-posts')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // Load published tracking file
  const publishedPath = join(outputDir, '.published.json')
  let published: Record<string, { hn?: boolean; x?: boolean; threads?: boolean }> = {}
  if (existsSync(publishedPath)) {
    try {
      published = JSON.parse(readFileSync(publishedPath, 'utf-8'))
    } catch (e) {
      console.warn('Could not read .published.json, starting fresh')
    }
  }

  // Generate posts for each blog post
  let newPostsCount = 0
  posts.forEach((post, index) => {
    const postNum = index + 1
    const postDir = join(outputDir, `post-${postNum}`)
    
    // Create post directory if it doesn't exist
    if (!existsSync(postDir)) {
      mkdirSync(postDir, { recursive: true })
    }

    // Check if already published
    const postKey = post.slug
    const isPublished = published[postKey] || {}
    
    // Check if files already exist (from previous generation)
    const hnExists = existsSync(join(postDir, 'hn.md'))
    const xExists = existsSync(join(postDir, 'x.md'))
    const threadsExists = existsSync(join(postDir, 'threads.md'))
    
    // Only generate if file doesn't exist or not marked as published
    const needsHN = !hnExists && !isPublished.hn
    const needsX = !xExists && !isPublished.x
    const needsThreads = !threadsExists && !isPublished.threads
    
    if (!needsHN && !needsX && !needsThreads) {
      console.log(`⏭️  Skipping ${post.slug} - already generated/published`)
      return
    }

    newPostsCount++

    // Generate Hacker News post
    if (needsHN) {
      const hnPost = generateHNPost(post)
      const status = isPublished.hn ? '✅ Published' : '⏳ Not published'
      const hnContent = `# ${hnPost.title}\n\n**Link:**\n${hnPost.url}\n\n**Instructions:**\n1. Go to https://news.ycombinator.com/submit\n2. Paste title in "title" field\n3. Paste link in "url" field\n4. Submit (no body text needed)\n5. Optionally add a comment after publishing if thread gets attention\n\n**Timing:** 12:00-14:00 UTC (13:00-15:00 CET) - wtorek-czwartek\n\n**Status:** ${status}\n`
      writeFileSync(join(postDir, 'hn.md'), hnContent, 'utf-8')
    }

    // Generate Twitter/X post
    if (needsX) {
      const twitterPost = generateTwitterPost(post)
      const status = isPublished.x ? '✅ Published' : '⏳ Not published'
      const xContent = `# Twitter/X Post\n\n**Post:**\n\`\`\`\n${twitterPost}\n\`\`\`\n\n**Length:** ${twitterPost.length} characters\n\n**Instructions:**\n1. Copy post above\n2. Paste directly into Twitter/X\n3. Adjust hashtags if needed (#DevOps #CronJobs #Monitoring)\n4. Post\n\n**Timing:** 14:00-19:00 UTC (15:00-20:00 CET)\n\n**Status:** ${status}\n`
      writeFileSync(join(postDir, 'x.md'), xContent, 'utf-8')
    }

    // Generate Threads post
    if (needsThreads) {
      const threadsPost = generateThreadsPost(post)
      const status = isPublished.threads ? '✅ Published' : '⏳ Not published'
      const threadsContent = `# Threads Post\n\n**Post:**\n\`\`\`\n${threadsPost}\n\`\`\`\n\n**Length:** ${threadsPost.length} characters\n\n**Instructions:**\n1. Copy post above\n2. Paste directly into Threads\n3. Post\n\n**Timing:** 15:00-20:00 UTC (16:00-21:00 CET)\n\n**Status:** ${status}\n`
      writeFileSync(join(postDir, 'threads.md'), threadsContent, 'utf-8')
    }

    // Create README for this post
    const readmeContent = `# Post ${postNum}: ${post.slug}\n\n**Title:** ${post.title}\n**Description:** ${post.description}\n**URL:** ${post.url}\n\n## Files\n\n- \`hn.md\` - Hacker News post ${isPublished.hn ? '✅ Published' : '⏳ Not published'}\n- \`x.md\` - Twitter/X post ${isPublished.x ? '✅ Published' : '⏳ Not published'}\n- \`threads.md\` - Threads post ${isPublished.threads ? '✅ Published' : '⏳ Not published'}\n\n## Mark as Published\n\nAfter publishing, update \`.published.json\`:\n\n\`\`\`json\n{\n  "${postKey}": {\n    "hn": true,\n    "x": true,\n    "threads": true\n  }\n}\n\`\`\`\n`
    writeFileSync(join(postDir, 'README.md'), readmeContent, 'utf-8')
  })

  // Save published tracking
  writeFileSync(publishedPath, JSON.stringify(published, null, 2), 'utf-8')

  // Create main README
  const mainReadme = `# Social Media Posts\n\n**Generated:** ${new Date().toISOString()}\n**Total posts:** ${posts.length}\n**New posts:** ${newPostsCount}\n\n## Structure\n\nEach post has its own folder:\n- \`post-1/\` - First post\n- \`post-2/\` - Second post\n- etc.\n\nEach folder contains:\n- \`hn.md\` - Hacker News post\n- \`x.md\` - Twitter/X post\n- \`threads.md\` - Threads post\n- \`README.md\` - Post info and status\n\n## Tracking Published Posts\n\nEdit \`.published.json\` to mark posts as published:\n\n\`\`\`json\n{\n  "post-slug": {\n    "hn": true,\n    "x": true,\n    "threads": true\n  }\n}\n\`\`\`\n\nAfter marking as published, the script will skip generating those posts.\n`
  writeFileSync(join(outputDir, 'README.md'), mainReadme, 'utf-8')

  console.log(`✅ Generated ${newPostsCount} new posts (${posts.length - newPostsCount} already published)`)
  console.log(`📁 Output: ${outputDir}`)
  console.log(`\nNext steps:`)
  console.log(`1. Check social-posts/post-*/ folders`)
  console.log(`2. Copy content from hn.md, x.md, or threads.md`)
  console.log(`3. After publishing, update .published.json to mark as published`)
}

main()
