import { type ReactNode } from 'react'
import { cn } from '@unanima/core'

export interface Alert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  action?: ReactNode
}

export interface AlertPanelProps {
  alerts: Alert[]
  onDismiss?: (id: string) => void
  className?: string
}

const severityStyles: Record<string, string> = {
  info: 'border-l-[var(--color-info)] bg-[var(--color-info-light,var(--color-info))]/8',
  warning: 'border-l-[var(--color-warning)] bg-[var(--color-warning-light,var(--color-warning))]/8',
  error: 'border-l-[var(--color-danger)] bg-[var(--color-danger-light,var(--color-danger))]/8',
  success: 'border-l-[var(--color-success)] bg-[var(--color-success-light,var(--color-success))]/8',
}

const severityTitleStyles: Record<string, string> = {
  info: 'text-[var(--color-info)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-danger)]',
  success: 'text-[var(--color-success)]',
}

const severityIcons: Record<string, ReactNode> = {
  info: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export function AlertPanel({ alerts, onDismiss, className }: AlertPanelProps) {
  if (alerts.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className={cn(
            'rounded-[var(--radius-lg,0.75rem)] border-l-4 p-4',
            'animate-fade-in',
            severityStyles[alert.severity],
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn('shrink-0 mt-0.5', severityTitleStyles[alert.severity])}>
              {severityIcons[alert.severity]}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold', severityTitleStyles[alert.severity])}>
                {alert.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary,var(--color-text))]">
                {alert.message}
              </p>
              {alert.action && <div className="mt-3">{alert.action}</div>}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className={cn(
                  'shrink-0 rounded-[var(--radius-md,0.5rem)] p-1',
                  'text-[var(--color-text-muted,var(--color-text))]/50',
                  'hover:bg-[var(--color-surface,#fff)]/50 hover:text-[var(--color-text)]',
                  'transition-colors duration-150',
                )}
                aria-label="Fermer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
