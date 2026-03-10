import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef, useState } from 'react'
import { cn } from '../utils/cn'

interface BaseInputProps {
  label?: string
  error?: string
}

export interface InputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  variant?: 'text' | 'email' | 'password'
}

export interface TextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCount?: boolean
}

const baseInputStyles = cn(
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2',
  'text-[var(--color-text)] placeholder:text-[var(--color-text)]/50',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'text', label, error, className, id, ...props }, ref) => {
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
          className={cn(baseInputStyles, error && 'border-[var(--color-danger)]', className)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, showCount = false, className, id, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0)
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

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
          className={cn(baseInputStyles, 'min-h-[80px] resize-y', error && 'border-[var(--color-danger)]', className)}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        <div className="flex justify-between">
          {error && (
            <p id={`${textareaId}-error`} className="text-sm text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}
          {showCount && maxLength && (
            <span className="ml-auto text-xs text-[var(--color-text)]/60">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'
