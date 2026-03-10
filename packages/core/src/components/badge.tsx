import { type HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const colorStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  info: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
}

export function Badge({ color = 'primary', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorStyles[color],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
