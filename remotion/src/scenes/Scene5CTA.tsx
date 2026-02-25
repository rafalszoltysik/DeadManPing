import React from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { theme } from '../theme'
import { Panel } from '../components/Panel'
import { PageBackground } from '../components/PageBackground'
import { fadeIn } from '../utils/transitions'
import { useIsVertical } from '../utils/useFormat'

type Props = { frame: number; fps: number }

export const Scene5CTA: React.FC<Props> = ({ frame }) => {
  const isVertical = useIsVertical()
  const containerOpacity = fadeIn(frame, 28)
  const buttonScale = interpolate(frame, [35, 55], [0.96, 1], { extrapolateRight: 'clamp' })
  const pulse = 1 + 0.015 * Math.sin((frame / 18) * Math.PI * 2)

  const padding = isVertical ? 20 : 48
  const panelMaxWidth = isVertical ? '100%' : 480
  const panelPaddingV = isVertical ? 56 : 36
  const panelPaddingH = isVertical ? 24 : 40
  const brandSize = isVertical ? 44 : 28
  const taglineSize = isVertical ? 26 : 18
  const metaSize = isVertical ? 19 : 14
  const buttonPaddingV = isVertical ? 28 : 14
  const buttonPaddingH = isVertical ? 32 : 32
  const buttonFontSize = isVertical ? 22 : 16
  const gap = isVertical ? 36 : 20

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
        <div
          style={{
            opacity: containerOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Panel
            style={{
              maxWidth: panelMaxWidth,
              width: isVertical ? '100%' : '100%',
              minWidth: isVertical ? 0 : undefined,
              padding: `${panelPaddingV}px ${panelPaddingH}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap,
            }}
          >
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: brandSize,
                fontWeight: 700,
                color: `rgb(${theme.primary})`,
                letterSpacing: '-0.02em',
              }}
            >
              DeadManPing
            </span>
            <p
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: taglineSize,
                fontWeight: 500,
                color: `rgb(${theme.foreground})`,
                lineHeight: isVertical ? 1.5 : 1.4,
                margin: 0,
              }}
            >
              Monitor outcomes, not just execution.
            </p>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px 20px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: metaSize,
                color: `rgb(${theme.mutedForeground})`,
              }}
            >
              <span>Free tier</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>No credit card</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>20 monitors</span>
            </div>
            <div
              style={{
                transform: `scale(${buttonScale * pulse})`,
                marginTop: isVertical ? 12 : 8,
                padding: `${buttonPaddingV}px ${buttonPaddingH}px`,
                width: isVertical ? '100%' : undefined,
                minWidth: isVertical ? 0 : undefined,
                textAlign: 'center',
                background: `rgb(${theme.primary})`,
                color: `rgb(${theme.primaryForeground})`,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: buttonFontSize,
                fontWeight: 600,
                borderRadius: 12,
                boxShadow: `0 4px 20px rgba(${theme.primary}, 0.35)`,
              }}
            >
              Start free — 2 min setup
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
