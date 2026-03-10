import { type ReactNode } from 'react'
import { cn } from './cn'

export interface KPICardProps {
  title: string
  value: string | number
  previousValue?: number
  icon?: ReactNode
  color?: 'success' | 'warning' | 'danger' | 'info'
  className?: string
}

const colorStyles: Record<string, string> = {
  success: 'border-l-[var(--color-success)]',
  warning: 'border-l-[var(--color-warning)]',
  danger: 'border-l-[var(--color-danger)]',
  info: 'border-l-[var(--color-info)]',
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous
  const percentage = previous !== 0 ? Math.round((diff / previous) * 100) : 0

  if (diff === 0) return null

  const isPositive = diff > 0

  return (
    <span
      className={cn(
        'inline-flex items-center text-sm font-medium',
        isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
      )}
    >
      <svg
        className={cn('h-4 w-4 mr-1', !isPositive && 'rotate-180')}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
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

  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm',
        'border-l-4',
        colorStyles[color],
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)]/60">{title}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{value}</p>
          {previousValue !== undefined && !isNaN(currentNumeric) && (
            <div className="mt-1">
              <TrendIndicator current={currentNumeric} previous={previousValue} />
            </div>
          )}
        </div>
        {icon && <div className="text-[var(--color-text)]/40">{icon}</div>}
      </div>
    </div>
  )
}
