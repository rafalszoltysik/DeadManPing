/**
 * Syntax-highlighted code block component with copy functionality.
 * 
 * Displays code with syntax highlighting using Prism, includes copy-to-clipboard
 * button, and custom theme matching DeadManPing design system. Used throughout
 * the application for displaying curl commands, code examples, and API responses.
 * 
 * Does not execute code - only displays formatted code.
 */

'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { useState } from 'react'

interface CodeBlockProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

/**
 * Renders syntax-highlighted code block with copy button.
 * 
 * @param code - Code string to display
 * @param language - Programming language for syntax highlighting (default: 'bash')
 * @param showLineNumbers - Whether to show line numbers
 * @param className - Additional CSS classes
 */
export function CodeBlock({ 
  code, 
  language = 'bash', 
  showLineNumbers = false,
  className = '' 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Custom theme matching DeadManPing design system - more muted/subtle colors
  // Primary: rgb(20, 184, 166) - teal/cyan (more muted)
  // Background: rgb(24, 24, 27) - card
  // Border: rgb(39, 39, 42)
  // Foreground: rgb(244, 244, 245)
  // Muted: rgb(161, 161, 170)
  const customTheme = {
    'code[class*="language-"]': {
      background: 'transparent',
      color: 'rgb(244, 244, 245)',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
      textShadow: 'none',
    },
    'pre[class*="language-"]': {
      background: 'rgb(24, 24, 27)',
      color: 'rgb(244, 244, 245)',
      border: '1px solid rgb(39, 39, 42)',
      borderRadius: '0.5rem',
      padding: '1rem',
      margin: 0,
      overflow: 'auto',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    'comment': {
      color: 'rgb(161, 161, 170)', // muted-foreground
      fontStyle: 'italic',
    },
    'prolog': {
      color: 'rgb(161, 161, 170)',
    },
    'doctype': {
      color: 'rgb(161, 161, 170)',
    },
    'cdata': {
      color: 'rgb(161, 161, 170)',
    },
    'punctuation': {
      color: 'rgb(220, 220, 230)', // slightly muted
    },
    'property': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'tag': {
      color: 'rgb(220, 100, 100)', // balanced red
    },
    'boolean': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'number': {
      color: 'rgb(220, 190, 80)', // balanced yellow
    },
    'constant': {
      color: 'rgb(220, 190, 80)', // balanced yellow
    },
    'symbol': {
      color: 'rgb(220, 190, 80)', // balanced yellow
    },
    'deleted': {
      color: 'rgb(220, 100, 100)', // balanced red
    },
    'selector': {
      color: 'rgb(80, 200, 120)', // balanced green
    },
    'attr-name': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'string': {
      color: 'rgb(80, 200, 120)', // balanced green
    },
    'char': {
      color: 'rgb(80, 200, 120)', // balanced green
    },
    'builtin': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'inserted': {
      color: 'rgb(80, 200, 120)', // balanced green
    },
    'operator': {
      color: 'rgb(230, 230, 240)', // slightly muted
    },
    'entity': {
      color: 'rgb(56, 196, 180)', // balanced teal
      cursor: 'help',
    },
    'url': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    '.language-css .token.string': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    '.style .token.string': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'variable': {
      color: 'rgb(235, 235, 245)', // slightly muted
    },
    'atrule': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'attr-value': {
      color: 'rgb(80, 200, 120)', // balanced green
    },
    'function': {
      color: 'rgb(56, 196, 180)', // balanced teal for functions
    },
    'class-name': {
      color: 'rgb(220, 190, 80)', // balanced yellow
    },
    'keyword': {
      color: 'rgb(56, 196, 180)', // balanced teal
    },
    'regex': {
      color: 'rgb(220, 190, 80)', // balanced yellow
    },
    'important': {
      color: 'rgb(220, 100, 100)', // balanced red
      fontWeight: 'bold',
    },
    'bold': {
      fontWeight: 'bold',
    },
    'italic': {
      fontStyle: 'italic',
    },
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={copyToClipboard}
          className="px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground bg-background/80 hover:bg-background border border-border rounded transition-smooth opacity-0 group-hover:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={customTheme}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'rgb(161, 161, 170)', // muted-foreground
          userSelect: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

