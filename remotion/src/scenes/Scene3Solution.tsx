import React from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { theme } from '../theme'
import { TerminalWindow } from '../components/TerminalWindow'
import { Panel } from '../components/Panel'
import { PageBackground } from '../components/PageBackground'
import { fadeIn } from '../utils/transitions'
import { useIsVertical } from '../utils/useFormat'

const CURL = 'curl -X POST "https://deadmanping.com/api/ping/backup-daily?file_size=$FILE_SIZE"'
const TYPING_START = 15
const TYPING_DURATION = 55
const TAGLINE_START = 85
const TAGLINE_DURATION = 25

type Props = { frame: number; fps: number }

export const Scene3Solution: React.FC<Props> = ({ frame }) => {
  const isVertical = useIsVertical()
  const containerOpacity = fadeIn(frame, 25)
  const charsVisible = Math.min(
    CURL.length,
    Math.floor(
      interpolate(frame, [TYPING_START, TYPING_START + TYPING_DURATION], [0, CURL.length], {
        extrapolateRight: 'clamp',
      })
    )
  )
  const displayCode = CURL.slice(0, charsVisible)
  const taglineOpacity = interpolate(frame, [TAGLINE_START, TAGLINE_START + TAGLINE_DURATION], [0, 1], {
    extrapolateRight: 'clamp',
  })
  const showCursor = charsVisible < CURL.length && Math.floor(frame / 15) % 2 === 0

  const padding = isVertical ? 28 : 48
  const codeFontSize = isVertical ? 13 : 15
  const brandSize = isVertical ? 26 : 22
  const taglineSize = isVertical ? 22 : 20
  const gap = isVertical ? 20 : 28
  const maxWidth = isVertical ? '100%' : 880

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
            width: '100%',
            maxWidth,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap,
          }}
        >
          <TerminalWindow style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: codeFontSize }}>$</span>
                <span style={{ color: '#7ee787', fontSize: codeFontSize }}> ./backup.sh</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: codeFontSize }}>$</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: codeFontSize, fontFamily: 'ui-monospace, monospace' }}>
                  {displayCode}
                  {showCursor && (
                    <span style={{ color: `rgb(${theme.primary})`, marginLeft: 2 }}>|</span>
                  )}
                </span>
              </div>
            </div>
          </TerminalWindow>

          <div
            style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              alignItems: 'center',
              gap: isVertical ? 12 : 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
              opacity: taglineOpacity,
              width: isVertical ? '100%' : undefined,
            }}
          >
            <Panel
              style={{
                padding: isVertical ? '14px 20px' : '16px 24px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: brandSize,
                  fontWeight: 700,
                  color: `rgb(${theme.primary})`,
                }}
              >
                DeadManPing
              </span>
            </Panel>
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: taglineSize,
                color: `rgb(${theme.foreground})`,
                fontWeight: 500,
                textAlign: isVertical ? 'center' : 'left',
              }}
            >
              One curl. We verify the result.
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
