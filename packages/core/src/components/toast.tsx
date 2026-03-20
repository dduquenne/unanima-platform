'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '../utils/cn'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onDismiss: (id: string) => void
  action?: ToastAction
}

const iconsByType: Record<ToastType, JSX.Element> = {
  success: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  ),
}

const colorsByType: Record<ToastType, string> = {
  success: 'border-l-[var(--color-success)] text-[var(--color-success)]',
  error: 'border-l-[var(--color-danger)] text-[var(--color-danger)]',
  warning: 'border-l-[var(--color-warning)] text-[var(--color-warning)]',
  info: 'border-l-[var(--color-primary)] text-[var(--color-primary)]',
}

const progressColorsByType: Record<ToastType, string> = {
  success: 'bg-[var(--color-success)]',
  error: 'bg-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning)]',
  info: 'bg-[var(--color-primary)]',
}

export function Toast({ id, type, title, message, duration = 5000, onDismiss, action }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())

  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismissRef.current(id), 200)
  }

  useEffect(() => {
    if (duration <= 0) return

    startTimeRef.current = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        setIsExiting(true)
        setTimeout(() => onDismissRef.current(id), 200)
      }
    }, 50)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [duration, id])

  const isAlertType = type === 'error' || type === 'warning'

  return (
    <div
      role={isAlertType ? 'alert' : 'status'}
      aria-live={isAlertType ? 'assertive' : 'polite'}
      className={cn(
        'pointer-events-auto w-80 overflow-hidden rounded-[var(--radius-md,0.5rem)]',
        'border border-[var(--color-border)] border-l-4',
        'bg-[var(--color-surface,#fff)] shadow-lg',
        'transition-all duration-200 ease-out',
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100',
        !isExiting && 'animate-[slideIn_0.3s_ease-out]',
        colorsByType[type],
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={colorsByType[type]}>{iconsByType[type]}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-[var(--color-text-muted,var(--color-text))]/60">
              {message}
            </p>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded p-0.5 text-[var(--color-text-muted,var(--color-text))]/40 hover:text-[var(--color-text)] transition-colors"
          aria-label="Fermer la notification"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {duration > 0 && (
        <div className="h-1 w-full bg-[var(--color-border)]/20">
          <div
            className={cn('h-full transition-[width] duration-100 ease-linear', progressColorsByType[type])}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}
