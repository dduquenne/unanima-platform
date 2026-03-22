'use client'

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { AuthConfig, AuthContextValue, UserSession } from './types'

export const AuthContext = createContext<AuthContextValue | null>(null)
export const AuthConfigContext = createContext<AuthConfig | null>(null)

interface AuthProviderProps {
  config: AuthConfig
  children: ReactNode
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return null
  }

  return createClient(url, anonKey)
}

export function AuthProvider({ config, children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null)
  const [session, setSession] = useState<unknown>(null)
  const [isLoading, setIsLoading] = useState(true)

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
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            role: profile.role,
            isActive: profile.is_active,
            metadata: profile.metadata ?? {},
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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? new Error(error.message) : null }
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
