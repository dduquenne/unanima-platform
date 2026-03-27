'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../hooks'
import type { AuthPageConfig } from '../types'
import { AuthLayout } from './auth-layout'
import { PasswordStrengthIndicator, isPasswordValid } from './password-strength'

interface ResetPasswordFormProps {
  config: AuthPageConfig
  onBack?: () => void
  className?: string
}

export function ResetPasswordForm({ config, onBack, className }: ResetPasswordFormProps) {
  const searchParams = useSearchParams()

  const isChangeMode = useMemo(
    () => searchParams.has('code') || searchParams.has('token'),
    [searchParams],
  )

  if (isChangeMode) {
    return <ChangePasswordView config={config} onBack={onBack} className={className} />
  }

  return <RequestResetView config={config} onBack={onBack} className={className} />
}

function RequestResetView({
  config,
  onBack,
  className,
}: {
  config: AuthPageConfig
  onBack?: () => void
  className?: string
}) {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: resetError } = await resetPassword(email)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
    }

    setIsSubmitting(false)
  }

  const handleBack = onBack ?? (() => router.push('/login'))

  if (success) {
    return (
      <AuthLayout config={config}>
        <div className={className}>
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/10">
              <svg
                className="h-7 w-7 text-[var(--color-success)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-lg font-bold text-[var(--color-text)] sm:text-xl">
            E-mail envoyé
          </h2>
          <p className="mt-2 mb-6 text-center text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
            Vérifiez votre boîte de réception
          </p>

          <div
            className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-light,var(--color-success))]/5 p-4 text-sm text-[var(--color-success)]"
            role="status"
          >
            Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
            un e-mail de réinitialisation a été envoyé.
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={handleBack}
            >
              Retour à la connexion
            </Button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout config={config}>
      <div className={className}>
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <svg
              className="h-7 w-7 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-lg font-bold text-[var(--color-text)] sm:text-xl">
          Réinitialiser le mot de passe
        </h2>
        <p className="mt-1 mb-6 text-center text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
          Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
        </p>

        {error && (
          <div
            className="mb-4 flex items-center gap-2.5 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-light,var(--color-danger))]/5 p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--color-text-muted,var(--color-text-secondary))]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="votre@email.fr"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface,#fff)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted,var(--color-text-secondary))]/50 transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
                />
              </div>
            </div>

            <Button variant="primary" size="lg" loading={isSubmitting} className="w-full rounded-xl">
              Envoyer le lien
            </Button>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleBack}
            >
              Retour à la connexion
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

function ChangePasswordView({
  config,
  onBack,
  className,
}: {
  config: AuthPageConfig
  onBack?: () => void
  className?: string
}) {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const valid = useMemo(() => isPasswordValid(newPassword), [newPassword])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!valid) {
      setError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    const endpoint = config.updatePasswordEndpoint ?? '/api/auth/update-password'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erreur lors de la mise à jour.')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    }

    setIsSubmitting(false)
  }

  const handleBack = onBack ?? (() => router.push('/login'))

  if (success) {
    return (
      <AuthLayout config={config}>
        <div className={className}>
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/10">
              <svg
                className="h-7 w-7 text-[var(--color-success)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-lg font-bold text-[var(--color-text)] sm:text-xl">
            Mot de passe mis à jour
          </h2>
          <p className="mt-2 mb-6 text-center text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
            Votre mot de passe a été modifié avec succès.
          </p>

          <div
            className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-light,var(--color-success))]/5 p-4 text-sm text-[var(--color-success)]"
            role="status"
          >
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </div>

          <div className="mt-6">
            <Button
              variant="primary"
              size="lg"
              className="w-full rounded-xl"
              onClick={() => router.push('/login')}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout config={config}>
      <div className={className}>
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
            <svg
              className="h-7 w-7 text-[var(--color-primary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-lg font-bold text-[var(--color-text)] sm:text-xl">
          Nouveau mot de passe
        </h2>
        <p className="mt-1 mb-6 text-center text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
          Choisissez un nouveau mot de passe sécurisé.
        </p>

        {error && (
          <div
            className="mb-4 flex items-center gap-2.5 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-light,var(--color-danger))]/5 p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <Input
                variant="password"
                label="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            <Input
              variant="password"
              label="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              error={
                confirmPassword.length > 0 && newPassword !== confirmPassword
                  ? 'Les mots de passe ne correspondent pas.'
                  : undefined
              }
            />

            <Button
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full rounded-xl"
              disabled={!valid || newPassword !== confirmPassword}
            >
              Mettre à jour le mot de passe
            </Button>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleBack}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
