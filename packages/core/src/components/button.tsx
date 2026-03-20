import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const variantStyles: Record<string, string> = {
  primary: cn(
    'bg-[var(--color-primary)] text-[var(--color-text-inverse,#fff)]',
    'hover:bg-[var(--color-primary-dark)] active:bg-[var(--color-primary-dark)]',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-[var(--color-primary)]',
  ),
  secondary: cn(
    'bg-[var(--color-muted,var(--color-border))] text-[var(--color-text)]',
    'hover:bg-[var(--color-surface-hover,var(--color-border))]/80',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-[var(--color-border)]',
  ),
  success: cn(
    'bg-[var(--color-success)] text-[var(--color-text-inverse,#fff)]',
    'hover:brightness-110 active:brightness-95',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-[var(--color-success)]',
  ),
  danger: cn(
    'bg-[var(--color-danger)] text-[var(--color-text-inverse,#fff)]',
    'hover:brightness-110 active:brightness-95',
    'shadow-sm hover:shadow-md',
    'focus-visible:ring-[var(--color-danger)]',
  ),
  ghost: cn(
    'bg-transparent text-[var(--color-text)]',
    'hover:bg-[var(--color-muted,var(--color-border))]/50',
    'focus-visible:ring-[var(--color-primary)]',
  ),
  outline: cn(
    'bg-transparent text-[var(--color-primary)] border-2 border-[var(--color-primary)]',
    'hover:bg-[var(--color-primary)] hover:text-[var(--color-text-inverse,#fff)]',
    'active:brightness-95',
    'focus-visible:ring-[var(--color-primary)]',
  ),
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'rounded-[var(--radius-md,0.5rem)]',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          'active:scale-[0.98]',
          variantStyles[variant],
          sizeStyles[size],
          loading && 'pointer-events-none',
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sr-only">Chargement en cours</span>
          </>
        )}
        <span aria-hidden={loading || undefined}>{children}</span>
      </button>
    )
  },
)

Button.displayName = 'Button'
