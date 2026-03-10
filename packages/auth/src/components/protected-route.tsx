'use client'

import { type ReactNode } from 'react'
import { useRequireRole } from '../hooks'

interface ProtectedRouteProps {
  role: string | string[]
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ role, children, fallback }: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useRequireRole(role)

  if (isLoading) {
    return fallback ?? null
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
