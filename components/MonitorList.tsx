'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useState, useEffect, useRef } from 'react'
import { ChevronRightIcon } from './Icons'
import { MonitorListProps } from '@/lib/types/monitor'
import { MonitorStatusIcon, MonitorStatus } from './MonitorStatus'
import { getStatusColor } from '@/lib/monitor-utils'

export function MonitorList({ monitors }: MonitorListProps) {
  const [mounted, setMounted] = useState(false)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Animate items after mount and when monitors change
  useEffect(() => {
    if (!mounted) return

    const timers: NodeJS.Timeout[] = []
    
    // Start animations immediately for better mobile experience
    const animationTimer = setTimeout(() => {
      itemRefs.current.forEach((ref, index) => {
        if (ref && !ref.classList.contains('slide-up')) {
          const timer = setTimeout(() => {
            if (ref) {
              ref.classList.add('slide-up')
            }
          }, 30 + (index * 30)) // Faster stagger for mobile
          timers.push(timer)
        }
      })
    }, 10) // Small delay to ensure DOM is ready
    
    // Fallback timeout to ensure items are visible even if animation fails (especially on mobile)
    const fallbackTimer = setTimeout(() => {
      itemRefs.current.forEach((ref) => {
        if (ref) {
          // Check if item is still invisible (animation didn't trigger)
          const computedStyle = window.getComputedStyle(ref)
          const opacity = computedStyle.opacity
          const hasOpacity0 = ref.classList.contains('opacity-0')
          const hasSlideUp = ref.classList.contains('slide-up')
          
          // More robust check - handle both string and number comparisons
          // Only force visibility if animation hasn't started
          if (!hasSlideUp && (opacity === '0' || parseFloat(opacity) < 0.01 || hasOpacity0)) {
            // Force visibility if animation didn't trigger
            ref.style.opacity = '1'
            ref.style.transform = 'translateY(0)'
            ref.classList.remove('opacity-0', 'translate-y-4')
            ref.classList.add('slide-up')
          }
        }
      })
    }, 600) // Shorter fallback - 600ms for faster mobile experience
    
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      clearTimeout(fallbackTimer)
      clearTimeout(animationTimer)
    }
  }, [mounted, monitors.length])

  // Prevent rendering before hydration to avoid flickering
  if (!mounted) {
    return (
      <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {monitors.map((_, index) => (
            <div
              key={index}
              className="px-4 sm:px-6 py-3 sm:py-4 animate-pulse"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-muted rounded mb-2 w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="w-16 h-4 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg sm:rounded-xl overflow-hidden shadow-sm">
      <div className="divide-y divide-border">
        {monitors.map((monitor, index) => (
          <Link
            key={monitor.id}
            ref={(el) => {
              itemRefs.current[index] = el
            }}
            href={`/dashboard/monitors/${monitor.slug}`}
            className="block hover:bg-accent/50 transition-smooth group opacity-0 translate-y-4 will-change-[opacity,transform]"
          >
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${getStatusColor(monitor.status)}`}>
                    <MonitorStatusIcon status={monitor.status} className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                      <h3 className="text-base sm:text-lg font-medium truncate">{monitor.name}</h3>
                      <MonitorStatus status={monitor.status} size="sm" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                      Expected every {Math.floor(monitor.expected_interval_seconds / 60)} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    {monitor.last_ping_at ? (
                      <>
                        <p className="text-xs sm:text-sm text-muted-foreground">Last ping</p>
                        <p className="text-xs sm:text-sm font-mono">
                          {formatDistanceToNow(new Date(monitor.last_ping_at), { addSuffix: true })}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs sm:text-sm text-muted-foreground">No pings yet</p>
                    )}
                  </div>
                  <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground transition-smooth" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
