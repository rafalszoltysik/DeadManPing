/**
 * Theme toggle button component (disabled - dark mode locked).
 * 
 * Renders theme toggle button UI, but toggle function is disabled since
 * dark mode is permanently enabled. Button is rendered for UI consistency
 * but clicking has no effect. Uses ThemeProvider context.
 * 
 * NOTE: Theme toggle is disabled - dark mode is locked. This component
 * is kept for potential future use or UI consistency.
 */

'use client'

import { useTheme } from './ThemeProvider'
import { SunIcon, MoonIcon } from './Icons'

/**
 * Renders theme toggle button (no-op in current implementation).
 * 
 * Button is displayed but toggleTheme is disabled. Side effects: none
 * (toggle is disabled).
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-smooth"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  )
}

