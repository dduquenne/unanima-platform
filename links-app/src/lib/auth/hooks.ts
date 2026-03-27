'use client'

import { useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContext, AuthConfigContext } from './provider'
import { hasPermission } from './rbac'
import type { AuthContextValue } from './types'

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthConfig() {
  const config = useContext(AuthConfigContext)
  if (!config) {
    throw new Error('useAuthConfig must be used within an AuthProvider')
  }
  return config
}

export function useRequireRole(role: string | string[]) {
  const { user, session, isLoading } = useAuth()
  const config = useAuthConfig()
  const router = useRouter()
  const roles = Array.isArray(role) ? role : [role]

  const profilePending = !!session && !user

  useEffect(() => {
    if (isLoading || profilePending) return
    if (!user || !roles.includes(user.role)) {
      router.replace(config.redirects.unauthorized)
    }
  }, [user, session, isLoading, profilePending, roles, config.redirects.unauthorized, router])

  return {
    isAuthorized: user ? roles.includes(user.role) : false,
    isLoading: isLoading || profilePending,
  }
}

export function usePermission(permission: string): boolean {
  const { user } = useAuth()
  const config = useAuthConfig()

  if (!user) return false
  return hasPermission(user.role, permission, config)
}
