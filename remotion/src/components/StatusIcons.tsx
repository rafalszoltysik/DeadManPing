import React from 'react'
import { theme } from '../theme'

const iconSize = 18

function IconWrap({
  children,
  color,
  style = {},
}: {
  children: React.ReactNode
  color: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: iconSize,
        height: iconSize,
        borderRadius: iconSize / 2,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function StatusHealthyIcon() {
  return (
    <IconWrap color={`rgb(${theme.success})`}>
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </IconWrap>
  )
}

export function StatusLateIcon() {
  return (
    <IconWrap color={`rgb(${theme.warning})`}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M5 3v3l2 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  )
}

export function StatusFailedIcon() {
  return (
    <IconWrap color={`rgb(${theme.error})`}>
      <svg width="8" height="8" viewBox="0 0 8 8">
        <path d="M1 1l6 6M7 1L1 7" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  )
}

export function StatusWarnIcon() {
  return (
    <IconWrap color={`rgb(${theme.warning})`}>
      <svg width="8" height="8" viewBox="0 0 8 8">
        <path d="M4 2v3.5M4 6v.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </IconWrap>
  )
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <StatusHealthyIcon />
    case 'late':
      return <StatusLateIcon />
    case 'warn':
      return <StatusWarnIcon />
    case 'failed':
      return <StatusFailedIcon />
    default:
      return <StatusHealthyIcon />
  }
}

export function getStatusBadgeStyle(status: string): React.CSSProperties {
  const base = {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 6,
  }
  switch (status) {
    case 'healthy':
      return { ...base, background: `rgba(${theme.success}, 0.15)`, color: `rgb(${theme.success})` }
    case 'late':
    case 'warn':
      return { ...base, background: `rgba(${theme.warning}, 0.15)`, color: `rgb(${theme.warning})` }
    case 'failed':
      return { ...base, background: `rgba(${theme.error}, 0.15)`, color: `rgb(${theme.error})` }
    default:
      return { ...base, background: `rgb(${theme.muted})`, color: `rgb(${theme.mutedForeground})` }
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'healthy': return 'HEALTHY'
    case 'late': return 'LATE'
    case 'warn': return 'WARN'
    case 'failed': return 'FAILED'
    default: return 'PENDING'
  }
}
