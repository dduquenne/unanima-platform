'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, type FormEvent } from 'react'
import { useAuth } from '@unanima/auth'
import { Button, Card, Input } from '@unanima/core'

type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): { strength: PasswordStrength; label: string } {
  if (password.length < 8) return { strength: 'weak', label: 'Faible' }
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (hasUpper && hasDigit && hasSpecial && password.length >= 12) {
    return { strength: 'strong', label: 'Fort' }
  }
  if (hasUpper && hasDigit) {
    return { strength: 'medium', label: 'Moyen' }
  }
  return { strength: 'weak', label: 'Faible' }
}

function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
}

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-orange-400',
  strong: 'bg-green-500',
}

const STRENGTH_TEXT_COLORS: Record<PasswordStrength, string> = {
  weak: 'text-red-600',
  medium: 'text-orange-500',
  strong: 'text-green-600',
}

const STRENGTH_WIDTHS: Record<PasswordStrength, string> = {
  weak: 'w-1/3',
  medium: 'w-2/3',
  strong: 'w-full',
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuth()

  // If there's a code param, this is the password change step
  const isChangeMode = useMemo(() => {
    return searchParams.has('code') || searchParams.has('token')
  }, [searchParams])

  if (isChangeMode) {
    return <ChangePasswordForm />
  }

  return <RequestResetForm />
}

function RequestResetForm() {
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

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">
              E-mail envoy&eacute;
            </h1>
          </div>
          <Card padding="lg">
            <div className="flex flex-col gap-4">
              <div
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                role="status"
              >
                Si un compte existe avec l&apos;adresse <strong>{email}</strong>,
                un e-mail de r&eacute;initialisation a &eacute;t&eacute; envoy&eacute;.
                V&eacute;rifiez votre bo&icirc;te de r&eacute;ception.
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Retour &agrave; la connexion
              </Button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

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
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <p className="text-sm text-[var(--color-danger)]" role="alert">
                  {error}
                </p>
              )}

              <Input
                variant="email"
                label="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Button variant="primary" size="lg" loading={isSubmitting} className="w-full">
                Envoyer le lien
              </Button>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => router.push('/login')}
              >
                Retour &agrave; la connexion
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}

function ChangePasswordForm() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])
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

    try {
      const response = await fetch('/api/auth/update-password', {
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

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">
              Mot de passe mis &agrave; jour
            </h1>
          </div>
          <Card padding="lg">
            <div className="flex flex-col gap-4">
              <div
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                role="status"
              >
                Votre mot de passe a &eacute;t&eacute; modifi&eacute; avec succ&egrave;s.
                Vous pouvez maintenant vous connecter.
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push('/login')}
              >
                Se connecter
              </Button>
            </div>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            Nouveau mot de passe
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Choisissez un nouveau mot de passe s&eacute;curis&eacute;.
          </p>
        </div>
        <Card padding="lg">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <Input
                  variant="password"
                  label="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Force du mot de passe
                      </span>
                      <span className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength.strength]}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${STRENGTH_COLORS[strength.strength]} ${STRENGTH_WIDTHS[strength.strength]}`}
                      />
                    </div>
                    <ul className="mt-2 space-y-0.5 text-xs text-[var(--color-text-secondary)]">
                      <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                        {newPassword.length >= 8 ? '\u2713' : '\u2022'} Au moins 8 caract&egrave;res
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(newPassword) ? '\u2713' : '\u2022'} Au moins 1 majuscule
                      </li>
                      <li className={/\d/.test(newPassword) ? 'text-green-600' : ''}>
                        {/\d/.test(newPassword) ? '\u2713' : '\u2022'} Au moins 1 chiffre
                      </li>
                    </ul>
                  </div>
                )}
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
                className="w-full"
                disabled={!valid || newPassword !== confirmPassword}
              >
                Mettre &agrave; jour le mot de passe
              </Button>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => router.push('/login')}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
