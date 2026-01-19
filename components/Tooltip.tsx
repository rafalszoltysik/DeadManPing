'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface TooltipProps {
  content: string | React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'warning' | 'info' | 'error'
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  className?: string
}

export function Tooltip({ 
  content, 
  children, 
  variant = 'default',
  position = 'top',
  delay = 200,
  className = ''
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
      updatePosition()
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const scrollX = window.scrollX || window.pageXOffset
    const scrollY = window.scrollY || window.pageYOffset

    let top = 0
    let left = 0

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
        break
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2)
        break
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.left + scrollX - tooltipRect.width - 8
        break
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2)
        left = triggerRect.right + scrollX + 8
        break
    }

    // Keep tooltip within viewport
    const padding = 8
    if (left < padding) left = padding
    if (left + tooltipRect.width > window.innerWidth - padding) {
      left = window.innerWidth - tooltipRect.width - padding
    }
    if (top < padding) top = padding
    if (top + tooltipRect.height > window.innerHeight + scrollY - padding) {
      top = window.innerHeight + scrollY - tooltipRect.height - padding
    }

    setTooltipPosition({ top, left })
  }, [position])

  useEffect(() => {
    if (isVisible) {
      updatePosition()
      const handleScroll = () => updatePosition()
      const handleResize = () => updatePosition()
      window.addEventListener('scroll', handleScroll, true)
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('scroll', handleScroll, true)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isVisible, updatePosition])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const variantStyles = {
    default: 'bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900',
    warning: 'bg-amber-500 text-white',
    info: 'bg-blue-500 text-white',
    error: 'bg-red-500 text-white',
  }

  const arrowStyles = {
    top: 'bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-100',
    bottom: 'top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-100',
    left: 'right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-100',
    right: 'left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-100',
  }

  const variantArrowStyles: Record<string, Record<string, string>> = {
    default: {
      top: 'border-t-gray-900 dark:border-t-gray-100',
      bottom: 'border-b-gray-900 dark:border-b-gray-100',
      left: 'border-l-gray-900 dark:border-l-gray-100',
      right: 'border-r-gray-900 dark:border-r-gray-100',
    },
    warning: {
      top: 'border-t-amber-500',
      bottom: 'border-b-amber-500',
      left: 'border-l-amber-500',
      right: 'border-r-amber-500',
    },
    info: {
      top: 'border-t-blue-500',
      bottom: 'border-b-blue-500',
      left: 'border-l-blue-500',
      right: 'border-r-blue-500',
    },
    error: {
      top: 'border-t-red-500',
      bottom: 'border-b-red-500',
      left: 'border-l-red-500',
      right: 'border-r-red-500',
    },
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={className}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-3 py-2 text-sm font-medium rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${variantStyles[variant]}`}
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {content}
          <div
            className={`absolute w-0 h-0 border-8 border-transparent ${arrowStyles[position]} ${variantArrowStyles[variant]?.[position] || variantArrowStyles.default[position]}`}
          />
        </div>
      )}
    </>
  )
}

// Convenience component for warning tooltips
export function WarningTooltip({ content, children, ...props }: Omit<TooltipProps, 'variant'>) {
  return (
    <Tooltip content={content} variant="warning" {...props}>
      {children}
    </Tooltip>
  )
}

// Convenience component for info tooltips
export function InfoTooltip({ content, children, ...props }: Omit<TooltipProps, 'variant'>) {
  return (
    <Tooltip content={content} variant="info" {...props}>
      {children}
    </Tooltip>
  )
}

