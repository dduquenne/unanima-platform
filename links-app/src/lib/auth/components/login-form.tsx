'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '../hooks'
import type { AuthPageConfig } from '../types'
import { AuthLayout } from './auth-layout'

const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  compte_desactive: 'Votre compte a été désactivé. Contactez votre administrateur.',
  auth: "Erreur d'authentification. Veuillez réessayer.",
  config: 'Erreur de configuration du serveur.',
  session_expiree: 'Votre session a expiré. Reconnectez-vous.',
}

interface LoginResponse {
  error?: string
  success?: boolean
  role?: string
  locked?: boolean
  disabled?: boolean
  attemptsRemaining?: number
  session?: {
    access_token: string
    refresh_token: string
  }
}

interface LoginFormProps {
  config: AuthPageConfig
  errorMessages?: Record<string, string>
  onResetPassword?: () => void
  className?: string
}

export function LoginForm({ config, errorMessages, onResetPassword, className }: LoginFormProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mergedErrors = useMemo(
    () => ({ ...DEFAULT_ERROR_MESSAGES, ...errorMessages }),
    [errorMessages],
  )

  const urlError = useMemo(() => {
    const errorCode = searchParams.get('error')
    return errorCode ? mergedErrors[errorCode] ?? null : null
  }, [searchParams, mergedErrors])

  const redirectPath = useMemo(() => searchParams.get('redirect'), [searchParams])

  const defaultRedirect = config.roleRedirects
    ? undefined
    : '/dashboard'

  useEffect(() => {
    if (!isLoading && user) {
      const dest = redirectPath ?? config.roleRedirects?.[user.role] ?? defaultRedirect ?? '/dashboard'
      router.replace(dest)
    }
  }, [user, isLoading, router, redirectPath, config.roleRedirects, defaultRedirect])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const endpoint = config.loginEndpoint ?? '/api/auth/login'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erreur de connexion.')
        setIsLocked(data.locked === true)
        setIsSubmitting(false)
        return
      }

      if (data.success && data.session) {
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        if (sessionError) {
          setError("Erreur lors de l'établissement de la session.")
          setIsSubmitting(false)
          return
        }
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setIsSubmitting(false)
    }
  }

  if (isLoading || user) {
    return (
      <AuthLayout config={config}>
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-[3px] border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
            role="status"
            aria-label="Chargement"
          />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout config={config}>
      <div className={className}>
        <h2 className="text-center text-lg font-bold text-[var(--color-text)] sm:text-xl">
          Connexion
        </h2>
        <p className="mt-1 mb-6 text-center text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
          Accédez à votre espace sécurisé
        </p>

        {urlError && (
          <div
            className="mb-4 flex items-center gap-2.5 rounded-xl border border-[var(--color-danger)]/20 bg-[var(--color-danger-light,var(--color-danger))]/5 p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {urlError}
          </div>
        )}

        {error && (
          <div
            className={`mb-4 flex items-center gap-2.5 rounded-xl border p-3 text-sm ${
              isLocked
                ? 'border-[var(--color-warning)]/20 bg-[var(--color-warning-light,var(--color-warning))]/5 text-[var(--color-warning)]'
                : 'border-[var(--color-danger)]/20 bg-[var(--color-danger-light,var(--color-danger))]/5 text-[var(--color-danger)]'
            }`}
            role="alert"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/15 text-[10px] font-bold">
              !
            </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
              >
                Adresse email
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
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLocked}
                  placeholder="votre@email.fr"
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface,#fff)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted,var(--color-text-secondary))]/50 transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
              >
                Mot de passe
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <Input
                  id="login-password"
                  variant="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLocked}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={onResetPassword ?? (() => router.push('/reset-password'))}
                className="text-sm font-medium text-[var(--color-primary)] underline-offset-2 transition-colors hover:text-[var(--color-primary-dark,var(--color-primary))] hover:underline"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full rounded-xl"
              disabled={isLocked}
            >
              {isLocked ? 'Compte verrouillé' : 'Se connecter'}
            </Button>
          </div>
        </form>

        {config.supportEmail && (
          <>
            <div className="my-6 flex items-center gap-3" aria-hidden="true">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-muted,var(--color-text-secondary))]">ou</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-secondary,var(--color-text-muted))]">
                Besoin d&apos;aide ?
              </p>
              <a
                href={`mailto:${config.supportEmail}`}
                className="mt-1 inline-block text-sm font-medium text-[var(--color-primary)] underline-offset-2 transition-colors hover:text-[var(--color-primary-dark,var(--color-primary))] hover:underline"
              >
                Contacter le support
              </a>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}
