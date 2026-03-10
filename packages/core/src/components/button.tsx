import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:ring-[var(--color-primary)]',
  secondary: 'bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-border)]/80 focus-visible:ring-[var(--color-border)]',
  success: 'bg-[var(--color-success)] text-white hover:bg-[var(--color-success)]/90 focus-visible:ring-[var(--color-success)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger)]/90 focus-visible:ring-[var(--color-danger)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-border)]/50 focus-visible:ring-[var(--color-primary)]',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
