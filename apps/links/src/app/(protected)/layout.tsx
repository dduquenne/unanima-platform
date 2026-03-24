'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { Layout, type NavItem } from '@unanima/dashboard'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Button } from '@unanima/core'

const SESSION_MAX_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours
const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // Check every minute

const consultantNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard' },
  { label: 'Bénéficiaires', href: '/beneficiaires' },
  { label: 'Bilans', href: '/bilans' },
  { label: 'Documents', href: '/documents' },
]

const beneficiaireNav: NavItem[] = [
  { label: 'Mon espace', href: '/dashboard' },
  { label: 'Mes bilans', href: '/bilans' },
  { label: 'Documents', href: '/documents' },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isLoading, session } = useAuth()
  const { isAuthorized } = useRequireRole(['beneficiaire', 'consultant', 'super_admin'])
  const sessionStartRef = useRef<number>(Date.now())

  // Session expiration check (8h max — RG-AUTH-07)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartRef.current
      if (elapsed >= SESSION_MAX_DURATION_MS) {
        // Session expired — force logout
        fetch('/api/auth/logout', { method: 'POST' })
          .catch(() => {})
          .finally(() => {
            signOut()
            router.push('/login?error=session_expiree')
          })
      }
    }, SESSION_CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [user, signOut, router])

  const handleSignOut = useCallback(async () => {
    // Server-side logout (invalidate refresh token + clear cookies)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Continue with client-side logout even if server call fails
    }
    await signOut()
    router.push('/login')
  }, [signOut, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  const isConsultantOrAdmin = user?.role === 'consultant' || user?.role === 'super_admin'
  const navItems = (isConsultantOrAdmin ? consultantNav : beneficiaireNav).map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(item.href + '/'),
  }))

  return (
    <Layout
      sidebar={navItems}
      header={{
        title: "Link's Accompagnement",
        actions: (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {user?.fullName}
            </button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              D&eacute;connexion
            </Button>
          </div>
        ),
      }}
    >
      {children}
    </Layout>
  )
}
