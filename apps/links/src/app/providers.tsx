'use client'

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthProvider, AuthContext, AuthConfigContext } from '@unanima/auth'
import type { AuthContextValue, UserSession } from '@unanima/auth'
import { authConfig } from '../config/auth.config'
import { isSimulationMode } from '../lib/simulation/config'
import { getSimulationSession, SIMULATION_ROLE_COOKIE, DEFAULT_SIMULATION_ROLE } from '../lib/simulation/auth'
import type { SimulationRole } from '../lib/simulation/auth'

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match?.[1]
}

/**
 * Provider spécifique au mode simulation.
 * Fournit un utilisateur fictif directement, sans Supabase.
 */
function SimulationAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<SimulationRole>(DEFAULT_SIMULATION_ROLE)

  useEffect(() => {
    const cookieRole = getCookie(SIMULATION_ROLE_COOKIE) as SimulationRole | undefined
    if (cookieRole && ['beneficiaire', 'consultant', 'super_admin'].includes(cookieRole)) {
      setRole(cookieRole)
    }

    // Re-read cookie on storage/cookie changes (role switcher)
    const interval = setInterval(() => {
      const current = getCookie(SIMULATION_ROLE_COOKIE) as SimulationRole | undefined
      if (current && current !== role && ['beneficiaire', 'consultant', 'super_admin'].includes(current)) {
        setRole(current)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [role])

  const session = useMemo(() => getSimulationSession(role), [role])

  const simulatedUser: UserSession = useMemo(() => ({
    id: session.profile.id,
    email: session.profile.email,
    fullName: session.profile.full_name,
    role: session.profile.role,
    isActive: session.profile.is_active,
    metadata: session.profile.metadata ?? {},
  }), [session])

  const signOut = useCallback(async () => {
    // In simulation mode, just redirect to login
    window.location.href = '/login'
  }, [])

  const signIn = useCallback(async () => ({ error: null }), [])
  const resetPassword = useCallback(async () => ({ error: null }), [])

  const value = useMemo<AuthContextValue>(() => ({
    user: simulatedUser,
    session: null,
    isLoading: false,
    signIn,
    signOut,
    resetPassword,
  }), [simulatedUser, signIn, signOut, resetPassword])

  return (
    <AuthConfigContext.Provider value={authConfig}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </AuthConfigContext.Provider>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  if (isSimulationMode()) {
    return (
      <SimulationAuthProvider>
        {children}
      </SimulationAuthProvider>
    )
  }

  return (
    <AuthProvider config={authConfig}>
      {children}
    </AuthProvider>
  )
}
