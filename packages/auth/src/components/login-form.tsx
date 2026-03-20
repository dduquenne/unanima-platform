'use client'

import { useState, type FormEvent } from 'react'
import { Button, Input } from '@unanima/core'
import { useAuth } from '../hooks'

interface LoginFormProps {
  onResetPassword?: () => void
  className?: string
}

export function LoginForm({ onResetPassword, className }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: signInError } = await signIn(email, password)
    if (signInError) {
      setError(signInError.message)
    }

    setIsSubmitting(false)
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

        <Input
          variant="password"
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <Button variant="primary" size="lg" loading={isSubmitting} className="w-full">
          Se connecter
        </Button>

        {onResetPassword && (
          <Button variant="ghost" size="sm" type="button" onClick={onResetPassword}>
            Mot de passe oublié ?
          </Button>
        )}
      </div>
    </form>
  )
}
