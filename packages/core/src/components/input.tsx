import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '../utils/cn'

interface BaseInputProps {
  label?: string
  error?: string
  hint?: string
}

export interface InputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  variant?: 'text' | 'email' | 'password'
}

export interface TextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCount?: boolean
}

const baseInputStyles = cn(
  'w-full rounded-[var(--radius-md,0.5rem)]',
  'border border-[var(--color-border)] bg-[var(--color-surface,#fff)] px-3 py-2.5',
  'text-[var(--color-text)] placeholder:text-[var(--color-text-muted,var(--color-text))]/50',
  'transition-all duration-150 ease-out',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,var(--color-primary))]/30 focus:border-[var(--color-border-focus,var(--color-primary))]',
  'hover:border-[var(--color-border-focus,var(--color-primary))]/50',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-muted,#f1f5f9)]',
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'text', label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          type={variant}
          className={cn(
            baseInputStyles,
            error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)]',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-sm text-[var(--color-text-muted,var(--color-text))]/60">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="flex items-center gap-1 text-sm text-[var(--color-danger)]" role="alert">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxLength, showCount = false, className, id, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0)
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const isNearLimit = maxLength ? charCount / maxLength > 0.9 : false

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            baseInputStyles,
            'min-h-[100px] resize-y',
            error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]/30 focus:border-[var(--color-danger)]',
            className,
          )}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />
        <div className="flex justify-between">
          <div>
            {hint && !error && (
              <p id={`${textareaId}-hint`} className="text-sm text-[var(--color-text-muted,var(--color-text))]/60">
                {hint}
              </p>
            )}
            {error && (
              <p id={`${textareaId}-error`} className="flex items-center gap-1 text-sm text-[var(--color-danger)]" role="alert">
                <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <span className={cn(
              'ml-auto text-xs transition-colors duration-150',
              isNearLimit ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted,var(--color-text))]/60',
            )}>
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
