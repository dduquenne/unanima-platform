import { cn } from '@unanima/core'

export interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
  animated?: boolean
  className?: string
}

const barColorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
}

const trackColorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]/10',
  success: 'bg-[var(--color-success-light,var(--color-success))]/15',
  warning: 'bg-[var(--color-warning-light,var(--color-warning))]/15',
  danger: 'bg-[var(--color-danger-light,var(--color-danger))]/15',
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color = 'primary',
  animated = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-semibold tabular-nums text-[var(--color-text-secondary,var(--color-text))]/70">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'h-2.5 w-full overflow-hidden rounded-[var(--radius-full,9999px)]',
          trackColorStyles[color],
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-[var(--radius-full,9999px)]',
            'transition-all duration-500 ease-out',
            animated && 'animate-progress-fill',
            barColorStyles[color],
          )}
          style={{
            width: `${clamped}%`,
            ...(animated ? { '--progress-width': `${clamped}%` } as React.CSSProperties : {}),
          }}
        />
      </div>
    </div>
  )
}
