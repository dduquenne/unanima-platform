'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@unanima/auth'
import { Button, Card, Input } from '@unanima/core'

const ROLE_HOME: Record<string, string> = {
  beneficiaire: '/dashboard',
  consultant: '/beneficiaires',
  super_admin: '/admin',
}

const ERROR_MESSAGES: Record<string, string> = {
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

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const urlError = useMemo(() => {
    const errorCode = searchParams.get('error')
    return errorCode ? ERROR_MESSAGES[errorCode] ?? null : null
  }, [searchParams])

  const redirectPath = useMemo(() => {
    return searchParams.get('redirect') ?? null
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && user) {
      const dest = ROLE_HOME[user.role] ?? '/dashboard'
      router.replace(dest)
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
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
        // Set the session client-side via Supabase
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        // Redirect based on role
        const dest = redirectPath ?? ROLE_HOME[data.role ?? 'beneficiaire'] ?? '/dashboard'
        router.replace(dest)
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setIsSubmitting(false)
    }
  }

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
            className="mb-4 rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {urlError}
          </div>
        )}

        <Card padding="lg">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {error && (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    isLocked
                      ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                      : 'border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                  }`}
                  role="alert"
                >
                  {error}
                </div>
              )}

              <Input
                variant="email"
                label="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLocked}
              />

              <Input
                variant="password"
                label="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLocked}
              />

              <Button
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
                disabled={isLocked}
              >
                {isLocked ? 'Compte verrouillé' : 'Se connecter'}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => router.push('/reset-password')}
              >
                Mot de passe oublié ?
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  )
}
