'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from './cn'

export interface SearchBarProps {
  placeholder?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
}

export function SearchBar({
  placeholder = 'Rechercher...',
  onSearch,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(value)
    }, debounceMs)

    return () => clearTimeout(timerRef.current)
  }, [value, debounceMs, onSearch])

  return (
    <div className={cn('relative group', className)}>
      <svg
        className={cn(
          'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
          'transition-colors duration-150',
          focused
            ? 'text-[var(--color-border-focus,var(--color-primary))]'
            : 'text-[var(--color-text-muted,var(--color-text))]/40',
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-[var(--radius-md,0.5rem)]',
          'border border-[var(--color-border)] bg-[var(--color-surface,#fff)]',
          'py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)]',
          'placeholder:text-[var(--color-text-muted,var(--color-text))]/50',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,var(--color-primary))]/30',
          'focus:border-[var(--color-border-focus,var(--color-primary))]',
          'hover:border-[var(--color-border-focus,var(--color-primary))]/50',
        )}
        aria-label={placeholder}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'rounded-[var(--radius-full,9999px)] p-0.5',
            'text-[var(--color-text-muted,var(--color-text))]/40',
            'hover:bg-[var(--color-muted,#f1f5f9)] hover:text-[var(--color-text)]',
            'transition-colors duration-150',
          )}
          aria-label="Effacer la recherche"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
