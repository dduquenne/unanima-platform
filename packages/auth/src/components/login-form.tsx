'use client'

import { useState, type FormEvent } from 'react'
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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-sm font-medium text-[var(--color-text)]">
            E-mail
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-sm font-medium text-[var(--color-text)]">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </button>

        {onResetPassword && (
          <button
            type="button"
            onClick={onResetPassword}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Mot de passe oublié ?
          </button>
        )}
      </div>
    </form>
  )
}
