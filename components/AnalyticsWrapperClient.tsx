'use client'

import dynamic from 'next/dynamic'

// Client-side only wrapper for AnalyticsWrapper
const AnalyticsWrapper = dynamic(() => import('@/components/AnalyticsWrapper').then(mod => ({ default: mod.AnalyticsWrapper })), {
  ssr: false, // Client-side only since it checks localStorage
})

export default function AnalyticsWrapperClient() {
  return <AnalyticsWrapper />
}

