'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  showText?: boolean
  variant?: 'icon-only' | 'with-text'
}

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
        <div className="w-8 h-8 rounded bg-muted animate-pulse" />
        {showText && variant === 'with-text' && (
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/icon.svg" 
        alt="DeadManPing Logo" 
        width={32}
        height={32}
        className="flex-shrink-0"
      />
      
      {showText && variant === 'with-text' && (
        <span className="font-bold text-lg sm:text-xl whitespace-nowrap flex-shrink-0">
          <span className="text-foreground">DeadMan</span>
          <span className="text-primary">Ping</span>
        </span>
      )}
    </div>
  )
}

// Icon-only version for favicon and small spaces
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

