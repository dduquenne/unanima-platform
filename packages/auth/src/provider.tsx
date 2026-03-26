'use client'

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { AuthConfig, AuthContextValue, UserSession } from './types'

export const AuthContext = createContext<AuthContextValue | null>(null)
export const AuthConfigContext = createContext<AuthConfig | null>(null)

interface AuthProviderProps {
  config: AuthConfig
  children: ReactNode
}

function hasSupabaseConfig(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return createBrowserClient(url, anonKey)
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [session, setSession] = useState<unknown>(null)
  // Only show loading state if Supabase is configured — otherwise
  // there is nothing to wait for and the login form should show immediately.
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)

  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      setSession(authSession)

      if (authSession?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authSession.user.id)
          .maybeSingle()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            isActive: profile.is_active,
            metadata: profile.metadata ?? {},
          })
        } else {
          // Profil absent en BDD — fallback sur les métadonnées auth
          // pour éviter que user reste null (boucle de redirection).
          // Le profil sera créé automatiquement via /api/auth/ensure-profile.
          const authUser = authSession.user
          setUser({
            id: authUser.id,
            email: authUser.email ?? '',
            fullName:
              (authUser.user_metadata?.full_name as string) ??
              authUser.email?.split('@')[0] ??
              '',
            role: (authUser.user_metadata?.role as string) ?? 'beneficiaire',
            isActive: true,
            metadata: {},
          })

          // Tenter la création automatique du profil en arrière-plan
          fetch('/api/auth/ensure-profile', { method: 'POST' }).catch(() => {
            // Silencieux — le profil sera recréé à la prochaine connexion
          })
        }
      } else {
        setUser(null)
      }

      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase client not initialized') }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: new Error(error.message) }

      // Eagerly resolve the user profile so downstream guards
      // (useRequireRole, protected layouts) see the correct role
      // immediately when signIn returns — avoids the race condition
      // where onAuthStateChange hasn't finished its async profile
      // fetch yet (#238).
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            isActive: profile.is_active,
            metadata: profile.metadata ?? {},
          })
          setIsLoading(false)
        }
      }

      return { error: null }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [supabase])

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        if (response.status === 429) {
          return { error: new Error('Trop de demandes. Réessayez plus tard.') }
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          return { error: new Error(data.error ?? 'Erreur lors de la réinitialisation') }
        }

        return { error: null }
      } catch {
        return { error: new Error('Erreur réseau') }
      }
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, isLoading, signIn, signOut, resetPassword }),
    [user, session, isLoading, signIn, signOut, resetPassword],
  )

  return (
    <AuthConfigContext.Provider value={config}>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </AuthConfigContext.Provider>
  )
}
