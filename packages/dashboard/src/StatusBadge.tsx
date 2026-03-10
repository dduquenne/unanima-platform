import { cn } from './cn'

export interface StatusConfig {
  label: string
  color: 'success' | 'warning' | 'danger' | 'info' | 'primary'
}

export interface StatusBadgeProps {
  status: string
  statusConfig: Record<string, StatusConfig>
  className?: string
}

const colorStyles: Record<string, string> = {
  success: 'bg-[var(--color-success-light,var(--color-success))]/15 text-[var(--color-success)] ring-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-light,var(--color-warning))]/15 text-[var(--color-warning)] ring-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-light,var(--color-danger))]/15 text-[var(--color-danger)] ring-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-light,var(--color-info))]/15 text-[var(--color-info)] ring-[var(--color-info)]/20',
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-[var(--color-primary)]/20',
}

const dotStyles: Record<string, string> = {
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]',
  primary: 'bg-[var(--color-primary)]',
}

export function StatusBadge({ status, statusConfig, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1.5',
        'rounded-[var(--radius-full,9999px)] px-2.5 py-0.5',
        'text-xs font-medium',
        'bg-[var(--color-muted,#f1f5f9)] text-[var(--color-text-secondary,var(--color-text))]',
        'ring-1 ring-inset ring-[var(--color-border)]/30',
        className,
      )}>
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'rounded-[var(--radius-full,9999px)] px-2.5 py-0.5',
        'text-xs font-medium',
        'ring-1 ring-inset',
        'transition-colors duration-150',
        colorStyles[config.color],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotStyles[config.color])} />
      {config.label}
    </span>
  )
}
