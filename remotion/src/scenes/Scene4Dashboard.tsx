import React from 'react'
import { AbsoluteFill, interpolate } from 'remotion'
import { theme } from '../theme'
import { Panel, PanelHeader } from '../components/Panel'
import {
  getStatusIcon,
  getStatusBadgeStyle,
  getStatusLabel,
} from '../components/StatusIcons'
import { PageBackground } from '../components/PageBackground'
import { fadeIn, slideUp } from '../utils/transitions'
import { useIsVertical } from '../utils/useFormat'

const ROWS = [
  { name: 'Daily Backup', status: 'healthy' as const, interval: '24h', lastPing: '2h ago', reason: null },
  { name: 'Report Generator', status: 'warn' as const, interval: '6h', lastPing: '1h ago', reason: 'count: 45 (expected ≥ 100)' },
  { name: 'Database Sync', status: 'late' as const, interval: '1h', lastPing: '2h ago', reason: 'Ping delayed' },
  { name: 'Health Check', status: 'failed' as const, interval: '5m', lastPing: '25m ago', reason: 'No ping received' },
  { name: 'Data Export', status: 'failed' as const, interval: '12h', lastPing: '3h ago', reason: 'Payload validation failed' },
]
const ROW_STAGGER = 8
const SLIDE_DURATION = 28

type Props = { frame: number; fps: number }

export const Scene4Dashboard: React.FC<Props> = ({ frame }) => {
  const isVertical = useIsVertical()
  const containerOpacity = fadeIn(frame, 20)
  const panelTranslateY = slideUp(frame, 24, 40)

  const padding = isVertical ? 24 : 40
  const subtitleSize = isVertical ? 20 : 18
  const maxWidth = isVertical ? '100%' : 720
  const rowPaddingV = isVertical ? 18 : 14
  const rowPaddingH = isVertical ? 20 : 20
  const nameSize = isVertical ? 17 : 15
  const metaSize = isVertical ? 13 : 12
  const reasonSize = isVertical ? 12 : 11

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
            transform: `translateY(${panelTranslateY}px)`,
          }}
        >
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: subtitleSize,
              color: `rgb(${theme.mutedForeground})`,
              marginBottom: isVertical ? 24 : 20,
              textAlign: 'center',
            }}
          >
            See status. Set rules. Get alerted.
          </p>
          <Panel noPadding style={{ overflow: 'hidden' }}>
            <PanelHeader
              title="Active Monitors"
              action={
                <span
                  style={{
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: `rgb(${theme.primary})`,
                    background: `rgba(${theme.primary}, 0.12)`,
                    padding: '6px 14px',
                    borderRadius: 8,
                  }}
                >
                  Add monitor
                </span>
              }
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {ROWS.map((row, i) => {
                const rowOpacity = interpolate(
                  frame,
                  [24 + i * ROW_STAGGER, 24 + i * ROW_STAGGER + 18],
                  [0, 1],
                  { extrapolateRight: 'clamp' }
                )
                const rowTranslateY = interpolate(
                  frame,
                  [24 + i * ROW_STAGGER, 24 + i * ROW_STAGGER + SLIDE_DURATION],
                  [12, 0],
                  { extrapolateRight: 'clamp' }
                )
                return (
                  <div
                    key={row.name}
                    style={{
                      opacity: rowOpacity,
                      transform: `translateY(${rowTranslateY}px)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${rowPaddingV}px ${rowPaddingH}px`,
                      borderBottom:
                        i < ROWS.length - 1 ? `1px solid rgb(${theme.border})` : 'none',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                      {getStatusIcon(row.status)}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              fontSize: nameSize,
                              fontWeight: 500,
                              color: `rgb(${theme.foreground})`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'system-ui, -apple-system, sans-serif',
                              ...getStatusBadgeStyle(row.status),
                            }}
                          >
                            {getStatusLabel(row.status)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, monospace',
                            fontSize: metaSize,
                            color: `rgb(${theme.mutedForeground})`,
                          }}
                        >
                          Expected every {row.interval}
                        </span>
                        {row.reason && (
                          <div
                            style={{
                              fontFamily: 'ui-monospace, monospace',
                              fontSize: reasonSize,
                              color: `rgb(${theme.mutedForeground})`,
                              marginTop: 4,
                              opacity: 0.9,
                            }}
                          >
                            {row.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: metaSize - 1,
                          color: `rgb(${theme.mutedForeground})`,
                        }}
                      >
                        Last ping
                      </div>
                      <div
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          fontSize: metaSize,
                          color: `rgb(${theme.foreground})`,
                        }}
                      >
                        {row.lastPing}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
