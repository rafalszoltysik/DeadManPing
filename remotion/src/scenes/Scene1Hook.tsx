import React from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { theme } from '../theme'
import { PageBackground } from '../components/PageBackground'
import { fadeIn } from '../utils/transitions'
import { useIsVertical } from '../utils/useFormat'

type Props = { frame: number; fps: number }

export const Scene1Hook: React.FC<Props> = ({ frame }) => {
  const isVertical = useIsVertical()
  const line1Opacity = 1
  const line2Opacity = interpolate(frame, [15, 50], [0, 1], { extrapolateRight: 'clamp' })

  const padding = isVertical ? 32 : 48
  const fontSize = isVertical ? 52 : 42
  const maxWidth = isVertical ? '100%' : 800

  return (
    <AbsoluteFill>
      <PageBackground />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding,
        }}
      >
        <div style={{ textAlign: 'center', maxWidth, width: '100%' }}>
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize,
              color: `rgb(${theme.foreground})`,
              marginBottom: 16,
              opacity: line1Opacity,
            }}
          >
            Your backup ran.
          </p>
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize,
              color: `rgb(${theme.error})`,
              opacity: line2Opacity,
            }}
          >
            The file is 0 bytes.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
