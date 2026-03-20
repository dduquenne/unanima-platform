'use client'

import { Spinner } from '@unanima/core'

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-[var(--color-text-muted,var(--color-text))]/60">
        Chargement...
      </p>
    </div>
  )
}
