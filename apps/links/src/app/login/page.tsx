'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@unanima/auth'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  return (
    <main
      className="flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
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
          {/* Logo on blue circle */}
          <div
            className="mx-auto mb-4 flex items-center justify-center rounded-full"
            style={{
              width: 72,
              height: 72,
              backgroundColor: 'var(--color-primary)',
            }}
          >
            <img
              src="/Links-logo.png"
              alt="Link's Accompagnement"
              style={{ height: 36 }}
            />
          </div>
          <h1
            className="font-bold"
            style={{
              fontSize: 26,
              letterSpacing: -0.5,
              color: 'var(--color-primary-dark)',
            }}
          >
            Link&apos;s Accompagnement
          </h1>
          <p
            className="mt-2"
            style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}
          >
            Votre espace de suivi personnalis&eacute;
          </p>
        </div>

        {/* ═══ LOGIN CARD (MAQ-01) ═══ */}
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div
            className="overflow-hidden"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 16,
              boxShadow: '0 4px 32px rgba(13, 59, 110, 0.10)',
            }}
          >
            {/* Blue accent bar (5px) */}
            <div style={{ height: 5, backgroundColor: 'var(--color-primary)' }} />

            <div style={{ padding: '40px 32px 32px' }}>
              {/* Title "Connexion" */}
              <h2
                className="text-center font-bold"
                style={{ fontSize: 22, color: 'var(--color-primary-dark)', letterSpacing: -0.3 }}
              >
                Connexion
              </h2>
              {/* Separator line */}
              <div
                className="mx-auto"
                style={{
                  width: 80,
                  height: 1.5,
                  marginTop: 10,
                  marginBottom: 24,
                  backgroundColor: 'var(--color-border)',
                  borderRadius: 1,
                }}
              />

              {/* URL error alert */}
              {urlError && (
                <div
                  className="mb-4 flex items-center gap-2"
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-danger-light)',
                    border: '1.2px solid var(--color-danger)',
                    fontSize: 12.5,
                    color: 'var(--color-danger)',
                  }}
                  role="alert"
                >
                  <span
                    className="flex shrink-0 items-center justify-center rounded-full font-bold"
                    style={{
                      width: 16,
                      height: 16,
                      fontSize: 11,
                      backgroundColor: 'var(--color-danger)',
                      color: 'var(--color-text-inverse)',
                    }}
                  >
                    !
                  </span>
                  {urlError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col" style={{ gap: 20 }}>
                  {/* Form error */}
                  {error && (
                    <div
                      className="flex items-center gap-2"
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: isLocked
                          ? 'var(--color-warning-light)'
                          : 'var(--color-danger-light)',
                        border: `1.2px solid ${isLocked ? 'var(--color-warning)' : 'var(--color-danger)'}`,
                        fontSize: 12.5,
                        color: isLocked ? 'var(--color-warning)' : 'var(--color-danger)',
                        fontWeight: 500,
                      }}
                      role="alert"
                    >
                      <span
                        className="flex shrink-0 items-center justify-center rounded-full font-bold"
                        style={{
                          width: 16,
                          height: 16,
                          fontSize: 11,
                          backgroundColor: 'var(--color-danger)',
                          color: 'var(--color-text-inverse)',
                        }}
                      >
                        !
                      </span>
                      {error}
                    </div>
                  )}

                  {/* ── Email field (MAQ-01) ── */}
                  <div>
                    <label
                      htmlFor="login-email"
                      className="block font-semibold"
                      style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}
                    >
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute"
                        style={{
                          width: 18,
                          height: 18,
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-muted)',
                        }}
                      />
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        disabled={isLocked}
                        placeholder="votre@email.fr"
                        style={{
                          width: '100%',
                          height: 44,
                          paddingLeft: 42,
                          paddingRight: 14,
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          fontSize: 13.5,
                          color: 'var(--color-text)',
                          outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,192,0.12)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* ── Password field (MAQ-01) ── */}
                  <div>
                    <label
                      htmlFor="login-password"
                      className="block font-semibold"
                      style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}
                    >
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute"
                        style={{
                          width: 18,
                          height: 18,
                          left: 14,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-muted)',
                        }}
                      />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        disabled={isLocked}
                        style={{
                          width: '100%',
                          height: 44,
                          paddingLeft: 42,
                          paddingRight: 42,
                          borderRadius: 8,
                          border: '1.5px solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          fontSize: 13.5,
                          color: 'var(--color-text)',
                          outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,192,0.12)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute"
                        style={{
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: 'var(--color-text-muted)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2,
                        }}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword
                          ? <Eye style={{ width: 18, height: 18 }} />
                          : <EyeOff style={{ width: 18, height: 18 }} />}
                      </button>
                    </div>
                  </div>

                  {/* ── "Mot de passe oublié ?" link (right-aligned) ── */}
                  <div style={{ textAlign: 'right', marginTop: -8 }}>
                    <button
                      type="button"
                      onClick={() => router.push('/reset-password')}
                      style={{
                        fontSize: 12.5,
                        color: 'var(--color-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      }}
                    >
                      Mot de passe oubli&eacute; ?
                    </button>
                  </div>

                  {/* ── Submit button with gradient (MAQ-01) ── */}
                  <button
                    type="submit"
                    disabled={isSubmitting || isLocked}
                    className="relative flex items-center justify-center font-bold"
                    style={{
                      width: '100%',
                      height: 46,
                      borderRadius: 10,
                      background: isLocked
                        ? 'var(--color-text-muted)'
                        : 'linear-gradient(to bottom, #2E7FD0, #1A5FA8)',
                      color: 'var(--color-text-inverse)',
                      fontSize: 15,
                      letterSpacing: 0.3,
                      border: 'none',
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      boxShadow: '0 3px 8px rgba(13, 59, 110, 0.18)',
                      transition: 'opacity 0.15s, box-shadow 0.15s',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <div
                        className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-label="Connexion en cours"
                      />
                    ) : (
                      <>
                        {isLocked ? 'Compte verrouillé' : 'Se connecter'}
                        {!isLocked && (
                          <ArrowRight
                            className="absolute"
                            style={{ right: 16, width: 16, height: 16, opacity: 0.85 }}
                          />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* ═══ SEPARATOR "OU" (MAQ-01) ═══ */}
              <div className="flex items-center" style={{ gap: 12, marginTop: 24, marginBottom: 24 }}>
                <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>ou</span>
                <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
              </div>

              {/* Help section */}
              <div className="text-center">
                <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
                  Besoin d&apos;aide ?
                </p>
                <a
                  href="mailto:support@links-accompagnement.fr"
                  style={{
                    display: 'inline-block',
                    marginTop: 4,
                    fontSize: 12.5,
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                    textUnderlineOffset: 2,
                  }}
                >
                  Contacter le support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER (MAQ-01) ═══ */}
      <footer className="text-center" style={{ padding: '16px 0' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
          &copy; {new Date().getFullYear()} Link&apos;s Accompagnement — Unanima Platform
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.7, marginTop: 4 }}>
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
