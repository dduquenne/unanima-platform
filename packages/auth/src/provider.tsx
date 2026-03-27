'use client'

import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
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

/**
 * Builds a UserSession from a Supabase profile row.
 */
function profileToUser(profile: {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  metadata: Record<string, unknown> | null
}): UserSession {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    isActive: profile.is_active,
    metadata: profile.metadata ?? {},
  }
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [session, setSession] = useState<unknown>(null)
  // Only show loading state if Supabase is configured — otherwise
  // there is nothing to wait for and the login form should show immediately.
  const [isLoading, setIsLoading] = useState(hasSupabaseConfig)

  const supabase = useMemo(() => getSupabaseClient(), [])

  // Monotonic counter to discard stale onAuthStateChange callbacks.
  // Each new auth event increments the counter; when the async profile
  // fetch completes, it only applies its result if its own capture of
  // the counter still matches the current value — otherwise a newer
  // event has superseded it and this result is stale.
  const authEventSeqRef = useRef(0)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      // Increment sequence so any earlier pending fetch becomes stale.
      const seq = ++authEventSeqRef.current

      setSession(authSession)

      if (authSession?.user) {
        // Set loading true while we resolve the profile — this prevents
        // downstream consumers from rendering with stale/null user.
        setIsLoading(true)

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authSession.user.id)
          .maybeSingle()

        // Discard this result if a newer auth event has fired while we
        // were awaiting the profile query.
        if (authEventSeqRef.current !== seq) return

        if (profile) {
          setUser(profileToUser(profile))
        } else {
          // Profile absent — use metadata fallback ONLY if no user is
          // already set for this auth user (prevents overwriting a valid
          // role set by signIn's eager fetch with a 'beneficiaire' fallback).
          const authUser = authSession.user
          setUser((currentUser) => {
            if (currentUser && currentUser.id === authUser.id) {
              // Keep the existing user — don't downgrade to fallback.
              return currentUser
            }
            // Truly first time seeing this user — use metadata fallback.
            return {
              id: authUser.id,
              email: authUser.email ?? '',
              fullName:
                (authUser.user_metadata?.full_name as string) ??
                authUser.email?.split('@')[0] ??
                '',
              role: (authUser.user_metadata?.role as string) ?? config.defaultRole,
              isActive: true,
              metadata: {},
            }
          })

          // Tenter la création automatique du profil en arrière-plan,
          // puis re-fetch pour obtenir le rôle définitif.
          fetch('/api/auth/ensure-profile', { method: 'POST' })
            .then(async () => {
              // Re-fetch the profile now that ensure-profile may have created it
              if (authEventSeqRef.current !== seq) return
              const { data: retryProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle()
              if (authEventSeqRef.current !== seq) return
              if (retryProfile) {
                setUser(profileToUser(retryProfile))
              }
            })
            .catch(() => {
              // Silencieux — le profil sera recréé à la prochaine connexion
            })
        }
      } else {
        setUser(null)
      }

      // Only clear loading if this is still the latest event
      if (authEventSeqRef.current === seq) {
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, config.defaultRole])

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error('Supabase client not initialized') }

      setIsLoading(true)

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setIsLoading(false)
        return { error: new Error(error.message) }
      }

      // Profile resolution is handled exclusively by onAuthStateChange
      // (triggered by signInWithPassword above). This avoids the race
      // condition where both signIn and onAuthStateChange competed to
      // increment the sequence counter, causing both to discard their
      // results and leaving the user with a stale/fallback role.
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
