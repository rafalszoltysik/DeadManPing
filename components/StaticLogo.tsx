/**
 * Static logo components for server-side rendering.
 * 
 * Server Components version of logo without client-side hydration delay.
 * Used in places where theme-aware rendering is not needed or where SSR
 * performance is critical. No theme detection or client-side state.
 * 
 * Does not handle theme changes - use Logo component for theme-aware rendering.
 */

import Image from 'next/image'

/**
 * Renders static logo with optional text (server component).
 * 
 * @param className - Additional CSS classes
 * @param showText - Whether to display text alongside icon
 * @param variant - Display variant (icon-only or with-text)
 */
export function StaticLogo({ className = '', showText = true, variant = 'with-text' }: { className?: string; showText?: boolean; variant?: 'icon-only' | 'with-text' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/icon.svg" 
        alt="DeadManPing Logo" 
        width={40}
        height={40}
        className="flex-shrink-0"
        priority
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
 * Renders static logo icon only (server component).
 * 
 * @param className - Additional CSS classes
 * @param size - Icon size in pixels
 */
export function StaticLogoIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <Image 
      src="/icon.svg" 
      alt="DeadManPing Logo" 
      width={size}
      height={size}
      className={className}
      priority
    />
  )
}

