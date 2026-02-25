import React from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { theme } from '../theme'
import { Panel } from '../components/Panel'
import { PageBackground } from '../components/PageBackground'
import { staggerFade } from '../utils/transitions'
import { useIsVertical } from '../utils/useFormat'

const CARDS = [
  {
    title: 'Empty backup',
    subtitle: 'File is 0 bytes',
    icon: 'alert',
  },
  {
    title: 'Cron stopped',
    subtitle: 'No one noticed',
    icon: 'alert',
  },
  {
    title: 'No alert fires',
    subtitle: 'Silent failure',
    icon: 'alert',
  },
]
const FADE_DURATION = 22
const STAGGER = 12

function AlertIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke={`rgb(${theme.warning})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13v1" stroke={`rgb(${theme.warning})`} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

type Props = { frame: number; fps: number }

export const Scene2Problem: React.FC<Props> = ({ frame }) => {
  const isVertical = useIsVertical()
  const headingOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' })

  const padding = isVertical ? 40 : 56
  const headingSize = isVertical ? 36 : 32
  const cardWidth = isVertical ? '100%' : 320
  const cardMinHeight = isVertical ? 140 : 160
  const cardPadding = isVertical ? 32 : 28
  const titleSize = isVertical ? 28 : 26
  const subtitleSize = isVertical ? 20 : 18
  const containerMaxWidth = isVertical ? 520 : 1100
  const iconSize = isVertical ? 40 : 36
  const cardGap = isVertical ? 24 : 28
  const headingMargin = isVertical ? 36 : 40

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
        <p
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: headingSize,
            fontWeight: 600,
            color: `rgb(${theme.mutedForeground})`,
            marginBottom: headingMargin,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            opacity: headingOpacity,
          }}
        >
          No one tells you.
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: isVertical ? 'column' : 'row',
            gap: cardGap,
            flexWrap: isVertical ? 'nowrap' : 'wrap',
            justifyContent: 'center',
            maxWidth: containerMaxWidth,
            width: '100%',
          }}
        >
          {CARDS.map((card, i) => {
            const opacity = staggerFade(frame, 20 + i * STAGGER, FADE_DURATION)
            const translateY = interpolate(
              opacity,
              [0, 1],
              [16, 0]
            )
            return (
              <div
                key={card.title}
                style={{
                  opacity,
                  transform: `translateY(${translateY}px)`,
                  width: isVertical ? '100%' : undefined,
                }}
              >
                <Panel
                  style={{
                    width: cardWidth,
                    minHeight: cardMinHeight,
                    padding: cardPadding,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <AlertIcon size={iconSize} />
                  <span
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: titleSize,
                      fontWeight: 600,
                      color: `rgb(${theme.foreground})`,
                    }}
                  >
                    {card.title}
                  </span>
                  <span
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: subtitleSize,
                      color: `rgb(${theme.mutedForeground})`,
                    }}
                  >
                    {card.subtitle}
                  </span>
                </Panel>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
