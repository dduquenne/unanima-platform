'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { LoginForm, useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'

const ERROR_MESSAGES: Record<string, string> = {
  compte_desactive: 'Votre compte a été désactivé. Contactez votre administrateur.',
  auth: 'Erreur d\u2019authentification. Veuillez réessayer.',
  config: 'Erreur de configuration du serveur.',
}

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlError = useMemo(() => {
    const errorCode = searchParams.get('error')
    return errorCode ? ERROR_MESSAGES[errorCode] ?? null : null
  }, [searchParams])

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
            Link&apos;s Accompagnement
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Plateforme de suivi des bilans de comp&eacute;tences
          </p>
        </div>
        {urlError && (
          <div
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {urlError}
          </div>
        )}
        <Card padding="lg">
          <LoginForm
            onResetPassword={() => router.push('/reset-password')}
          />
        </Card>
      </div>
    </main>
  )
}
