'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ReactElement } from 'react'

interface FAQItem {
  q: string
  a: string
  links?: Array<{ text: string; href: string }>
}

interface FAQAccordionProps {
  items: FAQItem[]
  startIndex: number
}

export function FAQAccordion({ items, startIndex }: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="space-y-4">
      {items.map((item, itemIdx) => {
        const currentIndex = startIndex + itemIdx
        const isOpen = openItems.has(currentIndex)
        return (
          <div key={itemIdx} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <button
              onClick={() => toggleItem(currentIndex)}
              className="w-full text-left flex items-start justify-between gap-4 py-2 hover:text-foreground transition-colors group"
            >
              <h3 className="text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors pr-8">
                {item.q}
              </h3>
              <svg
                className={`w-5 h-5 flex-shrink-0 mt-1 text-muted-foreground transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pt-2 pb-2 text-muted-foreground prose prose-sm max-w-none">
                <p>
                  {item.links && item.links.length > 0 ? (
                    (() => {
                      let text = item.a
                      const elements: (string | ReactElement)[] = []
                      let lastIndex = 0
                      
                      item.links.forEach((link, linkIndex) => {
                        const linkIndexInText = text.toLowerCase().indexOf(link.text.toLowerCase(), lastIndex)
                        if (linkIndexInText !== -1) {
                          // Add text before link
                          if (linkIndexInText > lastIndex) {
                            elements.push(text.substring(lastIndex, linkIndexInText))
                          }
                          // Add link
                          elements.push(
                            <Link key={linkIndex} href={link.href} className="text-primary hover:underline">
                              {link.text}
                            </Link>
                          )
                          lastIndex = linkIndexInText + link.text.length
                        }
                      })
                      
                      // Add remaining text
                      if (lastIndex < text.length) {
                        elements.push(text.substring(lastIndex))
                      }
                      
                      return elements.length > 0 ? elements : text
                    })()
                  ) : (
                    item.a
                  )}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

