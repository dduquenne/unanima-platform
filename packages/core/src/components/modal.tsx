import { type ReactNode, useEffect, useRef } from 'react'
import { cn } from '../utils/cn'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, actions, className }: ModalProps) {
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
        'rounded-lg border border-[var(--color-border)] bg-white p-0 shadow-xl',
        'backdrop:bg-black/50',
        'max-w-lg w-full',
        className,
      )}
      aria-labelledby="modal-title"
    >
      <div className="p-6">
        <h2
          id="modal-title"
          className="text-lg font-semibold text-[var(--color-text)] mb-4"
        >
          {title}
        </h2>
        <div className="text-[var(--color-text)]">{children}</div>
        {actions && (
          <div className="mt-6 flex justify-end gap-3">{actions}</div>
        )}
      </div>
    </dialog>
  )
}
