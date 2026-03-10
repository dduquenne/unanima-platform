import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  glow?: boolean
}

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export function Card({ children, padding = 'md', interactive = false, glow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)]',
        'border border-[var(--color-border-light,var(--color-border))]',
        'bg-[var(--color-surface,#fff)] shadow-sm',
        'transition-all duration-200 ease-out',
        interactive && [
          'cursor-pointer',
          'hover:shadow-md hover:border-[var(--color-border)]',
          'hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
        ],
        glow && 'hover:shadow-[var(--shadow-glow)]',
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
