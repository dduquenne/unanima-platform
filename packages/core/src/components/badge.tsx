import { type HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  dot?: boolean
}

const colorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-[var(--color-primary)]/20',
  success: 'bg-[var(--color-success-light,var(--color-success))]/20 text-[var(--color-success)] ring-[var(--color-success)]/20',
  warning: 'bg-[var(--color-warning-light,var(--color-warning))]/20 text-[var(--color-warning)] ring-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-light,var(--color-danger))]/20 text-[var(--color-danger)] ring-[var(--color-danger)]/20',
  info: 'bg-[var(--color-info-light,var(--color-info))]/20 text-[var(--color-info)] ring-[var(--color-info)]/20',
  secondary: 'bg-[var(--color-muted,#f1f5f9)] text-[var(--color-text-secondary,var(--color-text))] ring-[var(--color-border)]/30',
}

const dotColorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]',
  secondary: 'bg-[var(--color-text-secondary,var(--color-text))]',
}

export function Badge({ color = 'primary', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'rounded-[var(--radius-full,9999px)] px-2.5 py-0.5',
        'text-xs font-medium',
        'ring-1 ring-inset',
        'transition-colors duration-150',
        colorStyles[color],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', dotColorStyles[color])} />
      )}
      {children}
    </span>
  )
}
