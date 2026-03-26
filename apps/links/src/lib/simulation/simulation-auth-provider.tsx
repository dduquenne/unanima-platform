'use client'

// SimulationAuthProvider — Injecte un utilisateur fictif dans le contexte Auth
// en mode simulation, pour que useAuth() et useRequireRole() fonctionnent
// sans Supabase.
// Fix: les pages protégées redirigeaient vers /login en mode simulation
// car AuthProvider ne trouvait aucune session Supabase.

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, AuthConfigContext } from '@unanima/auth'
import type { AuthConfig, AuthContextValue, UserSession } from '@unanima/auth'
import { getSimulationProfile } from './fixtures'
import { SIMULATION_ROLE_COOKIE, DEFAULT_SIMULATION_ROLE, type SimulationRole } from './auth'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : undefined
}

interface SimulationAuthProviderProps {
  config: AuthConfig
  children: ReactNode
}

export function SimulationAuthProvider({ config, children }: SimulationAuthProviderProps) {
  const [role, setRole] = useState<SimulationRole>(DEFAULT_SIMULATION_ROLE)

  // Lire le cookie simulation-role au montage et écouter les changements
  useEffect(() => {
    const cookieRole = getCookie(SIMULATION_ROLE_COOKIE) as SimulationRole | undefined
    if (cookieRole && ['beneficiaire', 'consultant', 'super_admin'].includes(cookieRole)) {
      setRole(cookieRole)
    }

    // Polling léger pour détecter le changement de rôle (cookie modifié par le sélecteur)
    const interval = setInterval(() => {
      const current = getCookie(SIMULATION_ROLE_COOKIE) as SimulationRole | undefined
      if (current && current !== role && ['beneficiaire', 'consultant', 'super_admin'].includes(current)) {
        setRole(current)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [role])

  const user = useMemo<UserSession>(() => {
    const profile = getSimulationProfile(role)
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      isActive: true,
      metadata: {},
    }
  }, [role])

  const signIn = useCallback(async () => ({ error: null }), [])
  const signOut = useCallback(async () => {}, [])
  const resetPassword = useCallback(async () => ({ error: null }), [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: { simulation: true },
      isLoading: false,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, signIn, signOut, resetPassword],
  )

  return (
    <AuthConfigContext.Provider value={config}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthConfigContext.Provider>
  )
}
