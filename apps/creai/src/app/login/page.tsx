'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoginForm, useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            CREAI &Icirc;le-de-France
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Plateforme d&apos;appui &agrave; la transformation de l&apos;offre m&eacute;dico-sociale
          </p>
        </div>
        <Card padding="lg">
          <LoginForm
            onResetPassword={() => router.push('/reset-password')}
          />
        </Card>
      </div>
    </main>
  )
}
