'use client'

import { useContext, useEffect } from 'react'
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
  const { user, isLoading } = useAuth()
  const config = useAuthConfig()
  const roles = Array.isArray(role) ? role : [role]

  useEffect(() => {
    if (isLoading) return
    if (!user || !roles.includes(user.role)) {
      window.location.href = config.redirects.unauthorized
    }
  }, [user, isLoading, roles, config.redirects.unauthorized])

  return { isAuthorized: user ? roles.includes(user.role) : false, isLoading }
}

export function usePermission(permission: string): boolean {
  const { user } = useAuth()
  const config = useAuthConfig()

  if (!user) return false
  return hasPermission(user.role, permission, config)
}
