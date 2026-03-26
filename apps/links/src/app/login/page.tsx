'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '@unanima/auth'
import { Users, LayoutDashboard, Shield } from 'lucide-react'

import { LoginBrandPanel } from './components/login-brand-panel'
import { LoginCard, FooterLinks } from './components/login-card'
import { isSimulationMode } from '@/lib/simulation/config'
import { SIMULATION_ROLE_COOKIE } from '@/lib/simulation/auth'

const ROLE_HOME: Record<string, string> = {
  beneficiaire: '/dashboard',
  consultant: '/consultant/dashboard',
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
      const dest = redirectPath ?? ROLE_HOME[user.role] ?? '/dashboard'
      router.replace(dest)
    }
  }, [user, isLoading, router, redirectPath])

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
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })

        if (sessionError) {
          setError("Erreur lors de l'établissement de la session.")
          setIsSubmitting(false)
          return
        }

        // La navigation est gérée par le useEffect qui surveille `user`
        // (déclenché par onAuthStateChange après setSession)
      }
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion.')
      setIsSubmitting(false)
    }
  }

  // ═══ MODE SIMULATION — Sélecteur de profil ═══
  if (isSimulationMode()) {
    return <SimulationProfileSelector />
  }

  if (isLoading || user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-4"
          style={{ borderColor: 'rgb(42 127 212 / 0.2)', borderTopColor: '#2A7FD4' }}
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

        {/* Carte formulaire centrée */}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4">
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
        </div>

        {/* Footer desktop */}
        <footer className="relative z-10 hidden py-4 text-center lg:block">
          <FooterLinks />
        </footer>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 *  Sélecteur de profil — Mode Simulation
 * ═══════════════════════════════════════════════════════ */

const SIMULATION_PROFILES = [
  {
    role: 'beneficiaire',
    label: 'Bénéficiaire',
    name: 'Lucas Petit',
    email: 'lucas.petit@demo.fr',
    description: 'Bilan en cours (3/6 phases)',
    home: '/dashboard',
    icon: Users,
    color: '#2A7FD4',
    bgColor: '#EFF6FF',
  },
  {
    role: 'consultant',
    label: 'Consultante',
    name: 'Marie Dupont',
    email: 'marie.dupont@links-demo.fr',
    description: '3 bénéficiaires suivis',
    home: '/consultant/dashboard',
    icon: LayoutDashboard,
    color: '#F28C5A',
    bgColor: '#FFF5EF',
  },
  {
    role: 'super_admin',
    label: 'Administrateur',
    name: 'Sophie Martin',
    email: 'admin@links-demo.fr',
    description: 'Gestion complète',
    home: '/admin/dashboard',
    icon: Shield,
    color: '#0D3B6E',
    bgColor: '#EFF6FF',
  },
] as const

function SimulationProfileSelector() {
  const handleSelectProfile = (role: string, home: string) => {
    document.cookie = `${SIMULATION_ROLE_COOKIE}=${encodeURIComponent(role)};path=/;max-age=86400;SameSite=Lax`
    window.location.href = home
  }

  return (
    <div className="flex min-h-screen">
      <LoginBrandPanel />

      <main
        className="relative flex flex-1 flex-col"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        {/* Blobs décoratifs */}
        <div className="pointer-events-none absolute" style={{ top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', backgroundColor: 'var(--color-primary)', opacity: 0.02 }} />
        <div className="pointer-events-none absolute" style={{ top: -40, right: -20, width: 240, height: 240, borderRadius: '50%', backgroundColor: 'var(--color-secondary)', opacity: 0.03 }} />

        {/* Logo mobile */}
        <div className="relative z-10 pt-10 text-center lg:hidden">
          <div className="mx-auto flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: 'var(--color-primary)' }}>
            <span className="text-2xl font-extrabold text-white" style={{ letterSpacing: -1 }}>L</span>
          </div>
          <h1 className="mt-4 font-bold" style={{ fontSize: 22, color: 'var(--color-primary-dark)' }}>
            Link{"'"}s Accompagnement
          </h1>
        </div>

        {/* Selecteur de profil */}
        <div className="relative z-10 flex flex-1 items-center justify-center p-4">
          <div className="w-full" style={{ maxWidth: 480 }}>
            {/* Bandeau simulation */}
            <div
              className="mb-6 flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
            >
              <span aria-hidden="true">&#9888;</span>
              Mode Simulation — Données fictives
            </div>

            {/* Carte */}
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 16px 40px rgba(212, 149, 106, 0.10)',
              }}
            >
              <div style={{ padding: '36px 32px 28px' }}>
                <h2 className="text-center text-2xl font-bold" style={{ color: '#1A2332' }}>
                  Choisir un profil
                </h2>
                <p className="mt-1.5 text-center text-sm" style={{ color: '#8492A6' }}>
                  Sélectionnez le rôle avec lequel vous souhaitez explorer l{"'"}application
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {SIMULATION_PROFILES.map((profile) => {
                    const Icon = profile.icon
                    return (
                      <button
                        key={profile.role}
                        onClick={() => handleSelectProfile(profile.role, profile.home)}
                        className="group flex items-center gap-4 text-left transition-all"
                        style={{
                          padding: '16px 20px',
                          borderRadius: 16,
                          border: '1.5px solid #E8D5CA',
                          backgroundColor: '#FFFFFF',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = profile.color
                          e.currentTarget.style.backgroundColor = profile.bgColor
                          e.currentTarget.style.boxShadow = `0 4px 12px ${profile.color}20`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E8D5CA'
                          e.currentTarget.style.backgroundColor = '#FFFFFF'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {/* Icone */}
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                          style={{ backgroundColor: profile.bgColor }}
                        >
                          <Icon className="h-5 w-5" style={{ color: profile.color }} />
                        </div>

                        {/* Infos */}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                              {profile.name}
                            </span>
                            <span
                              className="rounded-full px-2 py-0.5 text-xs font-medium"
                              style={{ backgroundColor: profile.bgColor, color: profile.color }}
                            >
                              {profile.label}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs" style={{ color: '#8492A6' }}>
                            {profile.description}
                          </p>
                        </div>

                        {/* Fleche */}
                        <span className="text-lg" style={{ color: '#E8D5CA' }} aria-hidden="true">&#8594;</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="mt-6 text-center text-xs" style={{ color: '#B0A09A' }}>
              Vous pourrez changer de profil à tout moment via le bandeau de simulation.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
