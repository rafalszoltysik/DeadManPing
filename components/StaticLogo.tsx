import Image from 'next/image'

// Static server component versions (no hydration delay)
export function StaticLogo({ className = '', showText = true, variant = 'with-text' }: { className?: string; showText?: boolean; variant?: 'icon-only' | 'with-text' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/icon.svg" 
        alt="DeadManPing Logo" 
        width={32}
        height={32}
        className="flex-shrink-0"
        priority
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

