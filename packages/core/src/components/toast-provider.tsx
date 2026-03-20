'use client'

import { type ReactNode, createContext, useCallback, useState } from 'react'
import { Toast, type ToastAction, type ToastType } from './toast'

interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
}

interface ToastOptions {
  message?: string
  duration?: number
  action?: ToastAction
}

export interface ToastContextValue {
  success: (title: string, options?: ToastOptions) => void
  error: (title: string, options?: ToastOptions) => void
  warning: (title: string, options?: ToastOptions) => void
  info: (title: string, options?: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 5

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((type: ToastType, title: string, options?: ToastOptions) => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => {
      const next = [...prev, { id, type, title, ...options }]
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next
    })
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const contextValue: ToastContextValue = {
    success: useCallback((title, options) => addToast('success', title, options), [addToast]),
    error: useCallback((title, options) => addToast('error', title, options), [addToast]),
    warning: useCallback((title, options) => addToast('warning', title, options), [addToast]),
    info: useCallback((title, options) => addToast('info', title, options), [addToast]),
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
