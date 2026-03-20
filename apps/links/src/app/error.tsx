'use client'

import { Button, Card } from '@unanima/core'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-16 w-16 text-[var(--color-danger)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Une erreur est survenue
          </h1>
          {process.env.NODE_ENV === 'development' && error.message && (
            <p className="text-sm text-[var(--color-text-muted,var(--color-text))]/60 break-all">
              {error.message}
            </p>
          )}
          <Button variant="primary" onClick={reset}>
            Réessayer
          </Button>
        </div>
      </Card>
    </div>
  )
}
