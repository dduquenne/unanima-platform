import { type ReactNode } from 'react'
import { cn } from './cn'

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
  info: 'border-l-[var(--color-info)] bg-[var(--color-info)]/5',
  warning: 'border-l-[var(--color-warning)] bg-[var(--color-warning)]/5',
  error: 'border-l-[var(--color-danger)] bg-[var(--color-danger)]/5',
  success: 'border-l-[var(--color-success)] bg-[var(--color-success)]/5',
}

const severityTitleStyles: Record<string, string> = {
  info: 'text-[var(--color-info)]',
  warning: 'text-[var(--color-warning)]',
  error: 'text-[var(--color-danger)]',
  success: 'text-[var(--color-success)]',
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
            'rounded-lg border-l-4 p-4',
            severityStyles[alert.severity],
          )}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={cn('font-medium', severityTitleStyles[alert.severity])}>
                {alert.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-text)]">{alert.message}</p>
              {alert.action && <div className="mt-2">{alert.action}</div>}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.id)}
                className="ml-4 text-[var(--color-text)]/40 hover:text-[var(--color-text)]"
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
