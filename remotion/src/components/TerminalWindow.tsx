import React from 'react'
import { theme } from '../theme'

type TerminalWindowProps = {
  children: React.ReactNode
  style?: React.CSSProperties
}

export function TerminalWindow({ children, style = {} }: TerminalWindowProps) {
  return (
    <div
      style={{
        backgroundColor: `rgb(30, 30, 34)`,
        borderRadius: 10,
        border: `1px solid rgb(${theme.border})`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4)`,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* macOS-style title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: 'rgba(60, 60, 65, 0.8)',
          borderBottom: `1px solid rgba(255,255,255,0.06)`,
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#ff5f57' }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#febc2e' }} />
        <div style={{ width: 12, height: 12, borderRadius: 6, background: '#28c840' }} />
        <span
          style={{
            marginLeft: 12,
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Terminal
        </span>
      </div>
      <div style={{ padding: '16px 20px', fontFamily: 'ui-monospace, "SF Mono", Monaco, monospace' }}>
        {children}
      </div>
    </div>
  )
}
