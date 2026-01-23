/**
 * Script to update all code blocks in blog posts to use CodeBlock component
 * This script finds all code blocks and replaces them with CodeBlock component
 */

import * as fs from 'fs'
import * as path from 'path'

const blogDir = path.join(process.cwd(), 'app', 'blog')

function updateCodeBlocksInFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false

  // Check if CodeBlock is already imported
  if (!content.includes("import { CodeBlock }")) {
    // Add import after other imports
    const importMatch = content.match(/(import.*from.*['"]@\/components\/.*['"];?\s*\n)/)
    if (importMatch) {
      const lastImport = content.match(/import.*from.*['"]@\/components\/.*['"];?\s*$/m)
      if (lastImport) {
        content = content.replace(
          lastImport[0],
          lastImport[0] + "\nimport { CodeBlock } from '@/components/CodeBlock'"
        )
        modified = true
      }
    }
  }

  // Pattern to match code blocks with divs inside code
  const codeBlockPattern = /<div className="bg-background border border-border p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">\s*<code className="text-foreground">\s*((?:<div>.*?<\/div>\s*)+)\s*<\/code>\s*<\/div>/gs

  content = content.replace(codeBlockPattern, (match, divs) => {
    // Extract text from divs
    const lines = divs.match(/<div>(.*?)<\/div>/g)?.map((d: string) => {
      return d.replace(/<\/?div>/g, '').trim()
    }) || []
    
    const code = lines.join('\n')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&apos;/g, "'")
      .replace(/&#96;/g, '`')
      .replace(/&amp;/g, '&')
      .replace(/\{'\{'}/g, '{')
      .replace(/\{'\}'}/g, '}')
      .replace(/\{`/g, '{')
      .replace(/`\}/g, '}')
    
    // Detect language from code content
    let language = 'bash'
    if (code.includes('import ') || code.includes('from ') || code.includes('def ') || code.includes('requests.')) {
      language = 'python'
    } else if (code.includes('const ') || code.includes('require(') || code.includes('function ') || code.includes('=>')) {
      language = 'javascript'
    } else if (code.includes('<?php') || code.includes('$')) {
      language = 'php'
    } else if (code.includes('package ') || code.includes('import (')) {
      language = 'go'
    } else if (code.includes('require ') && code.includes('::')) {
      language = 'ruby'
    }

    modified = true
    return `<CodeBlock\n                    code={\`${code}\`}\n                    language="${language}"\n                  />`
  })

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`Updated: ${filePath}`)
  }

  return modified
}

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      processDirectory(filePath)
    } else if (file === 'page.tsx') {
      updateCodeBlocksInFile(filePath)
    }
  }
}

console.log('Starting code block updates...')
processDirectory(blogDir)
console.log('Done!')

