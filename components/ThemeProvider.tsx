/**
 * Theme provider component with dark mode locked.
 * 
 * Provides theme context for application. Dark mode is permanently enabled
 * (locked) - toggleTheme is a no-op. Ensures dark class is always applied
 * to document root. Used throughout app for consistent dark theme.
 * 
 * Does not support theme switching - dark mode only.
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * Provides theme context with dark mode locked.
 * 
 * Always applies 'dark' class to document root. Toggle function is disabled.
 * Side effects: DOM manipulation (adds 'dark' class to html element).
 * 
 * @param children - React children to wrap with theme context
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('dark')

  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  }, [])

  // Disabled - dark mode is locked
  const toggleTheme = () => {
    // No-op: dark mode is permanently enabled
  }

  // Always provide context, even before mount (with default values)
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context.
 * 
 * Returns theme state and toggle function. Must be used within ThemeProvider.
 * 
 * @returns Theme context with theme and toggleTheme
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

