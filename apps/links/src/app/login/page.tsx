'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@unanima/auth'
import { Button, Card, Input } from '@unanima/core'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'

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
        const { createBrowserClient } = await import('@supabase/ssr')
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {/* Top gradient overlay (MAQ-01) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background: 'linear-gradient(to bottom, rgba(30,111,192,0.07), transparent)',
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center p-4">
        {/* ═══ LOGO + HEADLINE (MAQ-01) ═══ */}
        <div className="mb-8 text-center">
          {/* Logo circle */}
          <div className="relative mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--color-primary)]">
            <span className="text-3xl font-bold text-[var(--color-text-inverse)]">L</span>
            <span className="absolute -top-0.5 right-1 h-2 w-2 rounded-full bg-[var(--color-warning)]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-primary-dark)]">
            Link&apos;s Accompagnement
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Votre espace de suivi personnalis&eacute;
          </p>
        </div>

        {/* ═══ LOGIN CARD (MAQ-01) ═══ */}
        <div className="w-full max-w-md">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
            {/* Blue accent bar */}
            <div className="h-[5px] bg-[var(--color-primary)]" />

            <div className="p-8">
              {/* Title */}
              <h2 className="text-center text-xl font-bold text-[var(--color-primary-dark)]">
                Connexion
              </h2>
              {/* Separator line */}
              <div className="mx-auto mt-2 mb-6 h-px w-20 bg-[var(--color-border)]" />

              {/* URL error alert */}
              {urlError && (
                <div
                  className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] p-3 text-sm text-[var(--color-danger)]"
                  role="alert"
                >
                  {urlError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  {/* Form error */}
                  {error && (
                    <div
                      className={`flex items-center gap-2 rounded-[var(--radius-md)] border p-3 text-sm ${
                        isLocked
                          ? 'border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                          : 'border-[var(--color-danger)]/30 bg-[var(--color-danger-light)] text-[var(--color-danger)]'
                      }`}
                      role="alert"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-[var(--color-text-inverse)]">
                        !
                      </span>
                      {error}
                    </div>
                  )}

                  {/* Email input with icon */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        disabled={isLocked}
                        placeholder="votre@email.fr"
                        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Password input with icon */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-[var(--color-text)]">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <Input
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

                  {/* Forgot password link */}
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => router.push('/reset-password')}
                      className="text-sm text-[var(--color-primary)] underline-offset-2 hover:underline"
                    >
                      Mot de passe oubli&eacute; ?
                    </button>
                  </div>

                  {/* Submit button */}
                  <Button
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full"
                    disabled={isLocked}
                  >
                    {isLocked ? 'Compte verrouillé' : 'Se connecter'}
                  </Button>
                </div>
              </form>

              {/* ═══ SEPARATOR "OU" (MAQ-01) ═══ */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--color-border)]" />
                <span className="text-xs text-[var(--color-text-muted)]">ou</span>
                <div className="h-px flex-1 bg-[var(--color-border)]" />
              </div>

              {/* Help section */}
              <div className="text-center">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Besoin d&apos;aide ?
                </p>
                <a
                  href="mailto:support@links-accompagnement.fr"
                  className="mt-1 inline-block text-sm text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  Contacter le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER (MAQ-01) ═══ */}
      <footer className="py-4 text-center">
        <p className="text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} Link&apos;s Accompagnement — Unanima Platform
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]/70">
          <Link href="/mentions-legales" className="hover:underline">
            Mentions l&eacute;gales
          </Link>
          {' · '}
          <Link href="/confidentialite" className="hover:underline">
            Politique de confidentialit&eacute;
          </Link>
          {' · '}
          <Link href="/cookies" className="hover:underline">
            RGPD
          </Link>
        </p>
      </footer>
    </main>
  )
}
