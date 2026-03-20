import { type ReactNode } from 'react'
import { cn } from '@unanima/core'

export interface KPICardProps {
  title: string
  value: string | number
  previousValue?: number
  icon?: ReactNode
  color?: 'success' | 'warning' | 'danger' | 'info' | 'primary'
  className?: string
}

const colorStyles: Record<string, { border: string; iconBg: string }> = {
  success: {
    border: 'border-l-[var(--color-success)]',
    iconBg: 'bg-[var(--color-success-light,var(--color-success))]/10 text-[var(--color-success)]',
  },
  warning: {
    border: 'border-l-[var(--color-warning)]',
    iconBg: 'bg-[var(--color-warning-light,var(--color-warning))]/10 text-[var(--color-warning)]',
  },
  danger: {
    border: 'border-l-[var(--color-danger)]',
    iconBg: 'bg-[var(--color-danger-light,var(--color-danger))]/10 text-[var(--color-danger)]',
  },
  info: {
    border: 'border-l-[var(--color-info)]',
    iconBg: 'bg-[var(--color-info-light,var(--color-info))]/10 text-[var(--color-info)]',
  },
  primary: {
    border: 'border-l-[var(--color-primary)]',
    iconBg: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  },
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  const percentage = previous !== 0 ? Math.round((diff / previous) * 100) : 0

  if (diff === 0) return null

  const isPositive = diff > 0

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-sm font-medium',
        'rounded-[var(--radius-full,9999px)] px-2 py-0.5',
        isPositive
          ? 'bg-[var(--color-success-light,var(--color-success))]/10 text-[var(--color-success)]'
          : 'bg-[var(--color-danger-light,var(--color-danger))]/10 text-[var(--color-danger)]',
      )}
    >
      <svg
        className={cn('h-3.5 w-3.5', !isPositive && 'rotate-180')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      {Math.abs(percentage)}%
    </span>
  )
}

export function KPICard({
  title,
  value,
  previousValue,
  icon,
  color = 'info',
  className,
}: KPICardProps) {
  const currentNumeric = typeof value === 'number' ? value : parseFloat(value)
  const defaultStyles = { border: 'border-l-[var(--color-info)]', iconBg: 'bg-[var(--color-info-light,var(--color-info))]/10 text-[var(--color-info)]' }
  const styles = colorStyles[color] ?? defaultStyles

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)]',
        'border border-[var(--color-border-light,var(--color-border))]',
        'bg-[var(--color-surface,#fff)] p-5',
        'shadow-sm hover:shadow-md',
        'border-l-4',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5',
        styles.border,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/70">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-[var(--color-text)]">{value}</p>
          {previousValue !== undefined && !isNaN(currentNumeric) && (
            <div className="pt-1">
              <TrendIndicator current={currentNumeric} previous={previousValue} />
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex h-10 w-10 items-center justify-center',
            'rounded-[var(--radius-lg,0.75rem)]',
            styles.iconBg,
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
