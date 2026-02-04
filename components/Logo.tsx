/**
 * DeadManPing logo component with theme-aware rendering.
 * 
 * Displays application logo with optional text. Handles client-side hydration
 * to prevent SSR mismatches. Supports icon-only and with-text variants.
 * Used in navigation, headers, and branding sections.
 * 
 * Does not handle logo file loading - Next.js Image handles optimization.
 */

'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: 'icon-only' | 'with-text'
}

/**
 * Renders DeadManPing logo with optional text.
 * 
 * Handles hydration to prevent SSR mismatches. Side effects: theme subscription.
 * 
 * @param className - Additional CSS classes
 * @param showText - Whether to display text alongside icon
 * @param variant - Display variant (icon-only or with-text)
 */
export function Logo({ className = '', showText = true, variant = 'with-text' }: LogoProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsDark(theme === 'dark')
    }
  }, [theme, mounted])

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-10 h-10 rounded bg-muted animate-pulse" />
        {showText && variant === 'with-text' && (
          <div className="h-6 w-32 rounded bg-muted animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/icon.svg" 
        alt="DeadManPing Logo" 
        width={40}
        height={40}
        className="flex-shrink-0"
      />
      
      {showText && variant === 'with-text' && (
        <span className="font-bold text-xl sm:text-2xl whitespace-nowrap flex-shrink-0">
          <span className="text-foreground">DeadMan</span>
          <span className="text-primary">Ping</span>
        </span>
      )}
    </div>
  )
}

/**
 * Icon-only logo component for small spaces.
 * 
 * Renders logo icon without text. Used for favicons, small headers, and compact layouts.
 * 
 * @param className - Additional CSS classes
 * @param size - Icon size in pixels
 */
export function LogoIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      setIsDark(theme === 'dark')
    }
  }, [theme, mounted])

  if (!mounted) {
    return <div className={`w-8 h-8 rounded bg-muted animate-pulse ${className}`} />
  }

  return (
    <Image 
      src="/icon.svg" 
      alt="DeadManPing Logo" 
      width={size}
      height={size}
      className={className}
    />
  )
}

