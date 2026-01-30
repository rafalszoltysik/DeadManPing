'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  stagger?: boolean
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  duration?: number
}

// Shared IntersectionObserver instance to reduce overhead
let sharedObserver: IntersectionObserver | null = null
const observedElements = new WeakMap<Element, () => void>()

function getSharedObserver() {
  if (sharedObserver) return sharedObserver

  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const callback = observedElements.get(entry.target)
        if (callback && entry.isIntersecting) {
          callback()
        }
      })
    },
    { threshold: 0.1, rootMargin: '-50px' }
  )

  return sharedObserver
}

// Check reduced motion preference once and cache
let cachedPrefersReducedMotion: boolean | null = null
function getPrefersReducedMotion(): boolean {
  if (cachedPrefersReducedMotion === null && typeof window !== 'undefined') {
    cachedPrefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  return cachedPrefersReducedMotion ?? false
}

// Check mobile once and cache (can be updated on resize if needed)
let cachedIsMobile: boolean | null = null
function getIsMobile(): boolean {
  if (cachedIsMobile === null && typeof window !== 'undefined') {
    cachedIsMobile = window.innerWidth < 768
  }
  return cachedIsMobile ?? false
}

export function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0, 
  stagger = false,
  direction = 'up',
  duration = 800
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)
  // Use state to ensure SSR/CSR consistency - default to desktop values
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    // Set actual values after mount to avoid hydration mismatch
    setIsMobile(getIsMobile())
    setPrefersReducedMotion(getPrefersReducedMotion())
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsVisible(true)
      hasAnimated.current = true
      return
    }

    let observedElement: Element | null = null

    // Defer observer setup until after initial render
    const timer = setTimeout(() => {
      const currentElement = ref.current
      if (!currentElement || hasAnimated.current) return
      observedElement = currentElement

      const observer = getSharedObserver()
      const callback = () => {
        if (hasAnimated.current) return
        hasAnimated.current = true
        
        setTimeout(() => {
          setIsVisible(true)
        }, delay)

        // Unobserve after animation starts
        setTimeout(() => {
          if (observedElement) {
            observer.unobserve(observedElement)
            observedElements.delete(observedElement)
          }
        }, delay + duration + 100)
      }

      observedElements.set(currentElement, callback)
      observer.observe(currentElement)
    }, 50) // Small delay to batch initial renders

    return () => {
      clearTimeout(timer)
      if (observedElement) {
        const observer = getSharedObserver()
        observer.unobserve(observedElement)
        observedElements.delete(observedElement)
      }
    }
  }, [delay, duration, prefersReducedMotion])

  const getTransformStyle = () => {
    if (isVisible) return { transform: 'translateY(0) translateX(0) scale(1)' }
    
    // Smaller transforms on mobile
    const translateValue = isMobile ? 4 : 8
    
    switch (direction) {
      case 'up':
        return { transform: `translateY(${translateValue * 4}px)` }
      case 'down':
        return { transform: `translateY(-${translateValue * 4}px)` }
      case 'left':
        return { transform: `translateX(${translateValue * 4}px)` }
      case 'right':
        return { transform: `translateX(-${translateValue * 4}px)` }
      case 'fade':
        return { transform: 'none' }
      default:
        return { transform: `translateY(${translateValue * 4}px)` }
    }
  }

  // Shorter duration on mobile or if reduced motion
  const actualDuration = prefersReducedMotion ? 0 : (isMobile ? Math.min(duration, 600) : duration)

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-all ease-[cubic-bezier(0.16,1,0.3,1)]`}
      style={{ 
        ...getTransformStyle(),
        transitionDuration: `${actualDuration}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      {children}
    </div>
  )
}

export function AnimatedItem({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 600
}: { 
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  duration?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const hasAnimated = useRef(false)
  // Use state to ensure SSR/CSR consistency - default to desktop values
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    // Set actual values after mount to avoid hydration mismatch
    setIsMobile(getIsMobile())
    setPrefersReducedMotion(getPrefersReducedMotion())
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsVisible(true)
      hasAnimated.current = true
      return
    }

    let observedElement: Element | null = null

    // Defer observer setup until after initial render
    const timer = setTimeout(() => {
      const currentElement = ref.current
      if (!currentElement || hasAnimated.current) return
      observedElement = currentElement

      const observer = getSharedObserver()
      const callback = () => {
        if (hasAnimated.current) return
        hasAnimated.current = true
        
        setTimeout(() => {
          setIsVisible(true)
        }, delay)

        // Unobserve after animation starts
        setTimeout(() => {
          if (observedElement) {
            observer.unobserve(observedElement)
            observedElements.delete(observedElement)
          }
        }, delay + duration + 100)
      }

      observedElements.set(currentElement, callback)
      observer.observe(currentElement)
    }, 50) // Small delay to batch initial renders

    return () => {
      clearTimeout(timer)
      if (observedElement) {
        const observer = getSharedObserver()
        observer.unobserve(observedElement)
        observedElements.delete(observedElement)
      }
    }
  }, [delay, duration, prefersReducedMotion])

  const getTransformStyle = () => {
    if (isVisible) return { transform: 'translateY(0) translateX(0) scale(1)' }
    
    // Smaller transforms on mobile
    const translateValue = isMobile ? 3 : 6
    
    switch (direction) {
      case 'up':
        return { transform: `translateY(${translateValue * 4}px)` }
      case 'down':
        return { transform: `translateY(-${translateValue * 4}px)` }
      case 'left':
        return { transform: `translateX(${translateValue * 4}px)` }
      case 'right':
        return { transform: `translateX(-${translateValue * 4}px)` }
      case 'fade':
        return { transform: 'none' }
      default:
        return { transform: `translateY(${translateValue * 4}px)` }
    }
  }

  // Shorter duration on mobile or if reduced motion
  const actualDuration = prefersReducedMotion ? 0 : (isMobile ? Math.min(duration, 500) : duration)
  const actualDelay = prefersReducedMotion ? 0 : delay

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-all ease-[cubic-bezier(0.16,1,0.3,1)]`}
      style={{ 
        ...getTransformStyle(),
        transitionDuration: `${actualDuration}ms`, 
        transitionDelay: `${actualDelay}ms`,
        willChange: isVisible ? 'auto' : 'transform, opacity',
        visibility: isVisible ? 'visible' : 'hidden'
      }}
    >
      {children}
    </div>
  )
}

export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 100
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set())
  const hasAnimated = useRef(false)
  // Use state to ensure SSR/CSR consistency - default to desktop values
  const [isMobile, setIsMobile] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  
  useEffect(() => {
    // Set actual values after mount to avoid hydration mismatch
    setIsMobile(getIsMobile())
    setPrefersReducedMotion(getPrefersReducedMotion())
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      const children = Array.from(element.children || [])
      children.forEach((_, index) => {
        setVisibleIndices(prev => new Set([...prev, index]))
      })
      hasAnimated.current = true
      return
    }

    let observedElement: Element | null = null

    // Defer observer setup until after initial render
    const timer = setTimeout(() => {
      const currentElement = ref.current
      if (!currentElement || hasAnimated.current) return
      observedElement = currentElement

      const observer = getSharedObserver()
      const callback = () => {
        if (hasAnimated.current) return
        hasAnimated.current = true
        
        const children = Array.from(observedElement?.children || [])
        const actualStaggerDelay = isMobile ? Math.min(staggerDelay, 60) : staggerDelay
        
        children.forEach((_, index) => {
          setTimeout(() => {
            setVisibleIndices(prev => new Set([...prev, index]))
          }, index * actualStaggerDelay)
        })
      }

      observedElements.set(currentElement, callback)
      observer.observe(currentElement)
    }, 50) // Small delay to batch initial renders

    return () => {
      clearTimeout(timer)
      if (observedElement) {
        const observer = getSharedObserver()
        observer.unobserve(observedElement)
        observedElements.delete(observedElement)
      }
    }
  }, [staggerDelay, isMobile, prefersReducedMotion])

  // Smaller translate on mobile
  const translateValue = isMobile ? 3 : 6
  const duration = isMobile ? 500 : 700
  const calculatedStaggerDelay = isMobile ? Math.min(staggerDelay, 60) : staggerDelay
  const baseTransitionClass = 'transition-all ease-[cubic-bezier(0.16,1,0.3,1)]'

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? children.map((child, index) => {
        const isVisible = visibleIndices.has(index)
        const delay = prefersReducedMotion ? '0ms' : `${index * calculatedStaggerDelay}ms`
        const translateY = isVisible ? 'translateY(0)' : `translateY(${translateValue * 4}px)`
        const willChange = isVisible ? 'auto' : 'transform, opacity'
        
        return (
          <div
            key={index}
            className={`${baseTransitionClass} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{ 
              transform: translateY,
              transitionDuration: `${duration}ms`,
              transitionDelay: delay,
              willChange,
              visibility: isVisible ? 'visible' : 'hidden'
            }}
          >
            {child}
          </div>
        )
      }) : children}
    </div>
  )
}
