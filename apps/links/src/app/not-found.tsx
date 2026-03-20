'use client'

import Link from 'next/link'
import { Card } from '@unanima/core'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card padding="lg" className="max-w-md w-full text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="text-6xl font-bold text-[var(--color-primary)]">404</p>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">
            Page introuvable
          </h1>
          <p className="text-sm text-[var(--color-text-muted,var(--color-text))]/60">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center font-medium rounded-[var(--radius-md,0.5rem)] px-4 py-2 text-base bg-[var(--color-primary)] text-[var(--color-text-inverse,#fff)] hover:bg-[var(--color-primary-dark)] transition-all duration-200 ease-out shadow-sm hover:shadow-md"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </Card>
    </div>
  )
}
