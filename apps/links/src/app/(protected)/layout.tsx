'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth, useRequireRole } from '@unanima/auth'
import { LogOut, LayoutDashboard, Users, FileText, FolderOpen, Menu, X } from 'lucide-react'

const SESSION_MAX_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours
const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // Check every minute

interface NavTab {
  label: string
  href: string
  icon: React.ReactNode
}

const consultantTabs: NavTab[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Bénéficiaires', href: '/beneficiaires', icon: <Users className="h-4 w-4" /> },
  { label: 'Documents', href: '/documents', icon: <FolderOpen className="h-4 w-4" /> },
  { label: 'Bilans', href: '/bilans', icon: <FileText className="h-4 w-4" /> },
]

const beneficiaireTabs: NavTab[] = [
  { label: 'Mon espace', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Mes bilans', href: '/bilans', icon: <FileText className="h-4 w-4" /> },
  { label: 'Documents', href: '/documents', icon: <FolderOpen className="h-4 w-4" /> },
]

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]
  const last = parts.length >= 2 ? parts[parts.length - 1] : undefined
  if (first && last) {
    return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
  }
  return fullName.slice(0, 2).toUpperCase()
}

function getRoleLabel(role: string): string {
  switch (role) {
    case 'beneficiaire': return 'Bénéficiaire'
    case 'consultant': return 'Consultante'
    case 'super_admin': return 'Administrateur'
    default: return role
  }
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()
  const { isAuthorized } = useRequireRole(['beneficiaire', 'consultant', 'super_admin'])
  const sessionStartRef = useRef<number>(Date.now())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Session expiration check (8h max — RG-AUTH-07)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const elapsed = Date.now() - sessionStartRef.current
      if (elapsed >= SESSION_MAX_DURATION_MS) {
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

  // Close mobile menu on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  const handleSignOut = useCallback(async () => {
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  const isConsultantOrAdmin = user?.role === 'consultant' || user?.role === 'super_admin'
  const tabs = isConsultantOrAdmin ? consultantTabs : beneficiaireTabs

  const isTabActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {/* Skip link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-primary)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        Aller au contenu principal
      </a>

      {/* ═══ HEADER (MAQ-02/04) ═══ */}
      <header className="bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)]">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-inverse)]/70 hover:text-[var(--color-text-inverse)] transition-colors sm:hidden"
              aria-label="Menu de navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo icon */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]">
                <span className="text-base font-bold text-[var(--color-text-inverse)]">L</span>
                <span className="absolute -top-0.5 right-0 h-2 w-2 rounded-full bg-[var(--color-warning)]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-bold tracking-wide">Link&apos;s</span>
                <span className="ml-1.5 text-sm font-normal text-[var(--color-text-inverse)]/70">Accompagnement</span>
              </div>
            </div>
          </div>

          {/* Right: User info + logout */}
          <div className="flex items-center gap-3">
            {/* Avatar + info */}
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1 transition-colors hover:bg-[var(--color-text-inverse)]/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--color-text-inverse)]">
                {getInitials(user?.fullName ?? '')}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">{user?.fullName}</p>
                <p className="text-xs leading-tight text-[var(--color-text-inverse)]/60">
                  {getRoleLabel(user?.role ?? '')}
                </p>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-text-inverse)]/20 px-2.5 py-1.5 text-xs text-[var(--color-text-inverse)]/70 transition-colors hover:border-[var(--color-text-inverse)]/40 hover:text-[var(--color-text-inverse)]"
              aria-label="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>

        {/* ═══ SECONDARY NAV (tabs — MAQ-04 consultant / beneficiaire) ═══ */}
        <nav
          aria-label="Navigation principale"
          className="hidden border-t border-[var(--color-text-inverse)]/10 bg-[var(--color-surface)] sm:block"
        >
          <div className="flex gap-0 px-4 sm:px-6">
            {tabs.map((tab) => {
              const active = isTabActive(tab.href)
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm bg-[var(--color-primary)]" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </header>

      {/* ═══ MOBILE NAV MENU ═══ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className="fixed inset-y-16 left-0 z-40 w-64 bg-[var(--color-surface)] shadow-lg sm:hidden"
            aria-label="Navigation mobile"
          >
            <ul className="flex flex-col gap-0.5 p-3">
              {tabs.map((tab) => {
                const active = isTabActive(tab.href)
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[var(--color-surface-active)] text-[var(--color-primary)]'
                          : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        {children}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-hover)] py-3">
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Link&apos;s Accompagnement — Extranet {getRoleLabel(user?.role ?? '').toLowerCase()} — &copy; {new Date().getFullYear()} Unanima
        </p>
      </footer>
    </div>
  )
}
