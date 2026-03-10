import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '../utils/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export function Modal({ open, onClose, title, children, actions, size = 'md', className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleCancel = (e: Event) => {
      e.preventDefault()
      onClose()
    }

    dialog.addEventListener('cancel', handleCancel)
    return () => dialog.removeEventListener('cancel', handleCancel)
  }, [onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={cn(
        'rounded-[var(--radius-xl,1rem)]',
        'border border-[var(--color-border-light,var(--color-border))]',
        'bg-[var(--color-surface,#fff)] p-0',
        'shadow-xl',
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
        'w-full',
        'animate-scale-in',
        sizeStyles[size],
        className,
      )}
      aria-labelledby="modal-title"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-[var(--color-text)]"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'rounded-[var(--radius-md,0.5rem)] p-1.5',
              'text-[var(--color-text-muted,var(--color-text))]/60',
              'hover:bg-[var(--color-muted,#f1f5f9)] hover:text-[var(--color-text)]',
              'transition-colors duration-150',
            )}
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-[var(--color-text-secondary,var(--color-text))]">{children}</div>
        {actions && (
          <div className="mt-6 flex justify-end gap-3 border-t border-[var(--color-border-light,var(--color-border))] pt-4">
            {actions}
          </div>
        )}
      </div>
    </dialog>
  )
}
