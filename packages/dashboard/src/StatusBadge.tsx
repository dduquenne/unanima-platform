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
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
}

export function StatusBadge({ status, statusConfig, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  if (!config) {
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600', className)}>
        {status}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorStyles[config.color],
        className,
      )}
    >
      {config.label}
    </span>
  )
}
