import React from 'react'
import { AbsoluteFill, useVideoConfig } from 'remotion'
import { theme } from '../theme'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

/**
 * Renders children in a fixed 16:9 stage. For vertical/square compositions,
 * scales the stage to fit and fills the rest with dark background (no white).
 */
export function AspectRatioStage({ children }: { children: React.ReactNode }) {
  const { width, height } = useVideoConfig()
  const isVerticalOrSquare = height >= width
  const scale = isVerticalOrSquare
    ? Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT)
    : 1

  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgb(${theme.background})`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  )
}
