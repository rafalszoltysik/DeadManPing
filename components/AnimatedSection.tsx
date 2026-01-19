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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsVisible(true)
      hasAnimated.current = true
      return
    }

    // Adjust rootMargin for mobile (smaller viewport)
    const rootMargin = isMobile ? '-50px' : '-100px'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            
            const timer = setTimeout(() => {
              setIsVisible(true)
            }, delay)

            // Unobserve after animation starts
            setTimeout(() => {
              if (ref.current) {
                observer.unobserve(ref.current)
              }
            }, delay + duration + 100)

            return () => clearTimeout(timer)
          }
        })
      },
      { threshold: 0.1, rootMargin }
    )

    const currentRef = ref.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, duration, prefersReducedMotion, isMobile])

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
        willChange: isVisible ? 'auto' : 'transform, opacity'
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      setIsVisible(true)
      hasAnimated.current = true
      return
    }

    // Adjust rootMargin for mobile
    const rootMargin = isMobile ? '25px' : '50px'

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            
            const timer = setTimeout(() => {
              setIsVisible(true)
            }, delay)

            // Unobserve after animation starts
            setTimeout(() => {
              if (ref.current) {
                observer.unobserve(ref.current)
              }
            }, delay + duration + 100)

            return () => clearTimeout(timer)
          }
        })
      },
      { threshold: 0.1, rootMargin }
    )

    const currentRef = ref.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, duration, prefersReducedMotion, isMobile])

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
        willChange: isVisible ? 'auto' : 'transform, opacity'
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion) {
      const children = Array.from(ref.current?.children || [])
      children.forEach((_, index) => {
        setVisibleIndices(prev => new Set([...prev, index]))
      })
      hasAnimated.current = true
      return
    }

    // Adjust rootMargin for mobile
    const rootMargin = isMobile ? '-50px' : '-100px'
    // Shorter stagger delay on mobile
    const actualStaggerDelay = isMobile ? Math.min(staggerDelay, 60) : staggerDelay

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            
            const children = Array.from(ref.current?.children || [])
            children.forEach((_, index) => {
              setTimeout(() => {
                setVisibleIndices(prev => new Set([...prev, index]))
              }, index * actualStaggerDelay)
            })

            setTimeout(() => {
              if (ref.current) {
                observer.unobserve(ref.current)
              }
            }, children.length * actualStaggerDelay + 300)
          }
        })
      },
      { threshold: 0.1, rootMargin }
    )

    const currentRef = ref.current
    observer.observe(currentRef)

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [staggerDelay, prefersReducedMotion, isMobile])

  // Smaller translate on mobile
  const translateValue = isMobile ? 3 : 6
  const duration = isMobile ? 500 : 700

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? children.map((child, index) => (
        <div
          key={index}
          className={`transition-all ease-[cubic-bezier(0.16,1,0.3,1)] ${
            visibleIndices.has(index)
              ? 'opacity-100'
              : 'opacity-0'
          }`}
          style={{ 
            transform: visibleIndices.has(index) ? 'translateY(0)' : `translateY(${translateValue * 4}px)`,
            transitionDuration: `${duration}ms`,
            transitionDelay: prefersReducedMotion ? '0ms' : `${index * (isMobile ? Math.min(staggerDelay, 60) : staggerDelay)}ms`,
            willChange: visibleIndices.has(index) ? 'auto' : 'transform, opacity'
          }}
        >
          {child}
        </div>
      )) : children}
    </div>
  )
}
