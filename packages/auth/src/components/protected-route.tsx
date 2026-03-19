'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireRole } from '../hooks'

interface ProtectedRouteProps {
  role: string | string[]
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  unauthorizedFallback?: ReactNode
}

export function ProtectedRoute({ role, children, fallback, redirectTo, unauthorizedFallback }: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useRequireRole(role)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || isAuthorized) return
    if (process.env.NODE_ENV === 'development') {
      const required = Array.isArray(role) ? role.join(', ') : role
      console.warn(`[ProtectedRoute] Accès refusé — rôle requis : ${required}, rôle actuel : ${user?.role ?? 'aucun'}`)
    }
    if (redirectTo) {
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthorized, redirectTo, router, role, user?.role])

  if (isLoading) {
    return fallback ?? (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  if (!isAuthorized) {
    if (redirectTo) return null

    if (unauthorizedFallback) return <>{unauthorizedFallback}</>

    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[var(--radius-lg,0.75rem)] border border-[var(--color-border-light,var(--color-border))] bg-[var(--color-surface,#fff)] p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
            Accès non autorisé
          </h2>
          <p className="mb-6 text-sm text-[var(--color-text-secondary,var(--color-text))]/70">
            Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <a
            href="/"
            className="inline-block rounded-[var(--radius-md,0.5rem)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Retour à l&apos;accueil
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
