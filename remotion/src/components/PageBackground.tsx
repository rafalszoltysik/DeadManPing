import React from 'react'
import { AbsoluteFill } from 'remotion'
import { theme } from '../theme'

export function PageBackground() {
  return (
    <AbsoluteFill
      style={{
        background: `rgb(${theme.background})`,
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(20, 184, 166, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse 60% 40% at 80% 80%, rgba(20, 184, 166, 0.05) 0%, transparent 50%)
        `,
      }}
    />
  )
}
