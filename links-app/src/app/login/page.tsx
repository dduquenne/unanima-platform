'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'

import { LoginBrandPanel } from './components/login-brand-panel'
import { LoginCard, FooterLinks } from './components/login-card'
import { SimulationProfileSelector } from './components/simulation-profile-selector'
import { isSimulationMode } from '@/lib/simulation/config'

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
}

export default function LoginPage() {
  const { user, isLoading, signIn } = useAuth()
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

  const simulationMode = isSimulationMode()

  useEffect(() => {
    if (simulationMode) return // In simulation mode, login page shows the profile selector
    if (!isLoading && user) {
      // Redirect to / — the server-side middleware determines the
      // correct role-based home page from the profiles table.
      // This eliminates client-side role routing which was the source
      // of the bug where stale/fallback roles caused wrong redirects.
      router.replace(redirectPath ?? '/')
    }
  }, [user, isLoading, router, redirectPath, simulationMode])

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

      if (data.success) {
        // Établir la session côté client via l'AuthProvider (même instance
        // Supabase) pour que onAuthStateChange se déclenche correctement.
        const { error: signInError } = await signIn(email, password)

        if (signInError) {
          setError("Erreur lors de l'établissement de la session.")
          setIsSubmitting(false)
          return
        }

        // Redirect to / — middleware handles role-based routing
        // server-side using the profiles table (no client-side race).
        router.replace(redirectPath ?? '/')
        return
      }

      // Fall-through : réponse 200 inattendue sans succès
      setError('Réponse inattendue du serveur.')
      setIsSubmitting(false)
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setIsSubmitting(false)
    }
  }

  if (!simulationMode && (isLoading || user)) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* ═══ PANNEAU GAUCHE — Illustratif (desktop) ═══ */}
      <LoginBrandPanel />

      {/* ═══ PANNEAU DROIT — Formulaire ═══ */}
      <main
        className="relative flex flex-1 flex-col"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Blobs décoratifs */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            opacity: 0.02,
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: -40,
            right: -20,
            width: 240,
            height: 240,
            borderRadius: '50%',
            backgroundColor: 'var(--color-secondary)',
            opacity: 0.03,
          }}
        />

        {/* Logo + titre mobile (visible < lg) */}
        <div className="relative z-10 pt-10 text-center lg:hidden">
          <div
            className="mx-auto flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: 'var(--color-primary)',
            }}
          >
            <span className="text-2xl font-extrabold text-white" style={{ letterSpacing: -1 }}>
              L
            </span>
          </div>
          <h1
            className="mt-4 font-bold"
            style={{ fontSize: 22, color: 'var(--color-primary-dark)', letterSpacing: -0.5 }}
          >
            Link{"'"}s Accompagnement
          </h1>
          <p
            className="mt-1"
            style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}
          >
            Votre espace de suivi personnalisé
          </p>
        </div>

        {/* Carte formulaire centrée (ou sélecteur de profils en mode simulation) */}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4">
          {isSimulationMode() ? (
            <SimulationProfileSelector />
          ) : (
            <LoginCard
              email={email}
              password={password}
              showPassword={showPassword}
              error={error}
              urlError={urlError}
              isLocked={isLocked}
              isSubmitting={isSubmitting}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onSubmit={handleSubmit}
              onForgotPassword={() => router.push('/reset-password')}
            />
          )}
        </div>

        {/* Footer desktop */}
        <footer className="relative z-10 hidden py-4 text-center lg:block">
          <FooterLinks />
        </footer>
      </main>
    </div>
  )
}
