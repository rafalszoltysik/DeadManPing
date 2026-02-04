/**
 * Monitor status badge components for UI display.
 * 
 * Provides reusable status badges with icons, labels, and customizable sizes.
 * Used throughout the application to display monitor health status consistently.
 * 
 * Does not calculate status - uses status from monitor object.
 */

'use client'

import { MonitorStatus as MonitorStatusType } from '@/lib/types/monitor'
import { getStatusColor, getStatusLabel, getStatusIconName } from '@/lib/monitor-utils'
import {
  StatusHealthyIcon,
  StatusLateIcon,
  StatusFailedIcon,
  StatusPendingIcon,
} from './Icons'

interface MonitorStatusProps {
  status: MonitorStatusType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  showIcon?: boolean
  className?: string
}

const sizeClasses = {
  sm: {
    icon: 'w-4 h-4',
    label: 'text-xs',
    padding: 'px-2 py-0.5',
  },
  md: {
    icon: 'w-5 h-5',
    label: 'text-sm',
    padding: 'px-2 sm:px-3 py-0.5 sm:py-1',
  },
  lg: {
    icon: 'w-6 h-6',
    label: 'text-base',
    padding: 'px-3 py-1',
  },
}

/**
 * Renders monitor status badge with icon and label.
 * 
 * @param status - Monitor status value
 * @param size - Badge size (sm, md, lg)
 * @param showLabel - Whether to show status label
 * @param showIcon - Whether to show status icon
 * @param className - Additional CSS classes
 */
export function MonitorStatus({
  status,
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = '',
}: MonitorStatusProps) {
  const statusColor = getStatusColor(status)
  const statusLabel = getStatusLabel(status)
  const iconName = getStatusIconName(status)
  const sizeClass = sizeClasses[size]

  const renderIcon = () => {
    if (!showIcon) return null

    const iconProps = { className: sizeClass.icon }
    
    switch (iconName) {
      case 'healthy':
        return <StatusHealthyIcon {...iconProps} />
      case 'late':
        return <StatusLateIcon {...iconProps} />
      case 'failed':
        return <StatusFailedIcon {...iconProps} />
      default:
        return <StatusPendingIcon {...iconProps} />
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 sm:gap-2 font-semibold rounded-full border ${statusColor} ${sizeClass.padding} ${sizeClass.label} ${className}`}
    >
      {renderIcon()}
      {showLabel && <span>{statusLabel}</span>}
    </span>
  )
}

interface MonitorStatusIconProps {
  status: MonitorStatusType
  className?: string
}

/**
 * Renders only the status icon without badge styling.
 * 
 * @param status - Monitor status value
 * @param className - CSS classes for icon sizing
 */
export function MonitorStatusIcon({ status, className = 'w-5 h-5' }: MonitorStatusIconProps) {
  const iconName = getStatusIconName(status)
  const iconProps = { className }

  switch (iconName) {
    case 'healthy':
      return <StatusHealthyIcon {...iconProps} />
    case 'late':
      return <StatusLateIcon {...iconProps} />
    case 'failed':
      return <StatusFailedIcon {...iconProps} />
    default:
      return <StatusPendingIcon {...iconProps} />
  }
}

interface MonitorStatusBadgeProps {
  status: MonitorStatusType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Renders complete status badge (icon + label) with default styling.
 * 
 * @param status - Monitor status value
 * @param size - Badge size (sm, md, lg)
 * @param className - Additional CSS classes
 */
export function MonitorStatusBadge({
  status,
  size = 'md',
  className = '',
}: MonitorStatusBadgeProps) {
  return (
    <MonitorStatus
      status={status}
      size={size}
      showIcon={true}
      showLabel={true}
      className={className}
    />
  )
}

