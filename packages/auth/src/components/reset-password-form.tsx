'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '../hooks'

interface ResetPasswordFormProps {
  onBack?: () => void
  className?: string
}

export function ResetPasswordForm({ onBack, className }: ResetPasswordFormProps) {
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
      <div className={className}>
        <p className="text-[var(--color-text)]">
          Un e-mail de réinitialisation a été envoyé à <strong>{email}</strong>.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
          >
            Retour à la connexion
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reset-email" className="text-sm font-medium text-[var(--color-text)]">
            E-mail
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Envoi…' : 'Réinitialiser le mot de passe'}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Retour à la connexion
          </button>
        )}
      </div>
    </form>
  )
}
