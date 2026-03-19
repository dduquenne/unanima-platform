import { type HTMLAttributes, type ReactNode, type KeyboardEvent } from 'react'
import { cn } from '../utils/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  glow?: boolean
  disabled?: boolean
}

const paddingStyles: Record<string, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
}

export function Card({ children, padding = 'md', interactive = false, glow = false, disabled = false, className, onClick, ...props }: CardProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || disabled || !onClick) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)]',
        'border border-[var(--color-border-light,var(--color-border))]',
        'bg-[var(--color-surface,#fff)] shadow-sm',
        'transition-all duration-200 ease-out',
        interactive && !disabled && [
          'cursor-pointer',
          'hover:shadow-md hover:border-[var(--color-border)]',
          'hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
        ],
        interactive && disabled && 'opacity-50 cursor-not-allowed',
        glow && 'hover:shadow-[var(--shadow-glow)]',
        paddingStyles[padding],
        className,
      )}
      {...(interactive ? {
        role: 'button',
        tabIndex: disabled ? -1 : 0,
        'aria-disabled': disabled || undefined,
        onKeyDown: handleKeyDown,
      } : {})}
      onClick={interactive && disabled ? undefined : onClick}
      {...props}
    >
      {children}
    </div>
  )
}
