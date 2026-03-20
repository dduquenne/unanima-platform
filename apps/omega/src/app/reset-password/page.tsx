'use client'

import { useRouter } from 'next/navigation'
import { ResetPasswordForm } from '@unanima/auth'
import { Card } from '@unanima/core'

export default function ResetPasswordPage() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            R&eacute;initialiser le mot de passe
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Saisissez votre adresse e-mail pour recevoir un lien de r&eacute;initialisation.
          </p>
        </div>
        <Card padding="lg">
          <ResetPasswordForm onBack={() => router.push('/login')} />
        </Card>
      </div>
    </main>
  )
}
