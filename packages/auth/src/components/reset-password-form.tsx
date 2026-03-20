'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input, Card } from '@unanima/core'
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
      <Card className={className}>
        <p className="text-[var(--color-text)]">
          Un e-mail de réinitialisation a été envoyé à <strong>{email}</strong>.
        </p>
        {onBack && (
          <Button variant="ghost" size="sm" type="button" onClick={onBack} className="mt-4">
            Retour à la connexion
          </Button>
        )}
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
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
          Réinitialiser le mot de passe
        </Button>

        {onBack && (
          <Button variant="ghost" size="sm" type="button" onClick={onBack}>
            Retour à la connexion
          </Button>
        )}
      </div>
    </form>
  )
}
