import React from 'react'
import { theme } from '../theme'

type PanelProps = {
  children: React.ReactNode
  style?: React.CSSProperties
  noPadding?: boolean
}

export function Panel({ children, style = {}, noPadding }: PanelProps) {
  return (
    <div
      style={{
        backgroundColor: `rgb(${theme.card})`,
        border: `1px solid rgb(${theme.border})`,
        borderRadius: 12,
        boxShadow: `0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.03)`,
        overflow: 'hidden',
        ...(noPadding ? {} : { padding: 24 }),
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function PanelHeader({
  title,
  action,
  style = {},
}: {
  title: string
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: `rgba(${theme.muted}, 0.5)`,
        borderBottom: `1px solid rgb(${theme.border})`,
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 15,
          fontWeight: 600,
          color: `rgb(${theme.foreground})`,
        }}
      >
        {title}
      </span>
      {action}
    </div>
  )
}
