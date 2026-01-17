'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

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
      <img 
        src="/icon.svg" 
        alt="DeadManPing Logo" 
        className="flex-shrink-0"
        style={{ width: '32px', height: '32px' }}
      />
      
      {showText && variant === 'with-text' && (
        <span className="font-bold text-lg sm:text-xl">
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
    <img 
      src="/icon.svg" 
      alt="DeadManPing Logo" 
      className={className}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  )
}

