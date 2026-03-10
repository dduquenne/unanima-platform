import { cn } from './cn'

export interface ProgressBarProps {
  value: number
  label?: string
  showPercentage?: boolean
  color?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const barColorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color = 'primary',
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between">
          {label && <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-[var(--color-text)]/60">{clamped}%</span>
          )}
        </div>
      )}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColorStyles[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
