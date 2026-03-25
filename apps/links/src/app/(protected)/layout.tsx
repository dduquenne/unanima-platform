'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth, useRequireRole } from '@unanima/auth'
import { LogOut, LayoutDashboard, Users, FileText, FolderOpen, Menu, X } from 'lucide-react'
import { SimulationBanner } from '@/components/simulation-banner'

const SESSION_MAX_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours
const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // Check every minute

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const consultantNav: NavItem[] = [
  { label: 'Dashboard', href: '/consultant/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Bénéficiaires', href: '/consultant/beneficiaires', icon: <Users className="h-5 w-5" /> },
  { label: 'Documents', href: '/documents', icon: <FolderOpen className="h-5 w-5" /> },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: <Users className="h-5 w-5" /> },
  { label: 'Documents', href: '/documents', icon: <FolderOpen className="h-5 w-5" /> },
]

const beneficiaireTabs: NavItem[] = [
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

  const role = user?.role ?? 'beneficiaire'
  const hasSidebar = role === 'consultant' || role === 'super_admin'
  const navItems = role === 'super_admin'
    ? adminNav
    : role === 'consultant'
      ? consultantNav
      : beneficiaireTabs

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const isAdmin = role === 'super_admin'

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-background)]">
      {/* Bandeau Mode Simulation (Sprint 12) */}
      <SimulationBanner />

      {/* Skip link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-[var(--radius-md)] focus:bg-[var(--color-surface)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--color-primary)] focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        Aller au contenu principal
      </a>

      {/* ═══ HEADER ═══ */}
      <header className="bg-[var(--color-primary-dark)] text-[var(--color-text-inverse)]">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-[var(--radius-md)] p-1.5 text-[var(--color-text-inverse)]/70 hover:text-[var(--color-text-inverse)] transition-colors md:hidden"
              aria-label="Menu de navigation"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <img
              src="/Links-logo.png"
              alt="Link's Accompagnement"
              className="h-8 sm:h-9"
            />
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
                  {getRoleLabel(role)}
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

        {/* ═══ HORIZONTAL TABS — bénéficiaire only (MAQ-02/04) ═══ */}
        {!hasSidebar && (
          <nav
            aria-label="Navigation principale"
            className="hidden border-t border-[var(--color-text-inverse)]/10 bg-[var(--color-surface)] sm:block"
          >
            <div className="flex gap-0 px-4 sm:px-6">
              {navItems.map((item) => {
                const active = isItemActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    {active && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm bg-[var(--color-primary)]" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      {/* ═══ MOBILE NAV DRAWER (all roles) ═══ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className={`fixed inset-y-16 left-0 z-40 w-64 shadow-lg md:hidden ${
              hasSidebar && isAdmin
                ? 'bg-[var(--color-primary-dark)]'
                : 'bg-[var(--color-surface)]'
            }`}
            aria-label="Navigation mobile"
          >
            <ul className="flex flex-col gap-0.5 p-3">
              {navItems.map((item) => {
                const active = isItemActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors ${
                        hasSidebar && isAdmin
                          ? active
                            ? 'bg-white/15 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                          : active
                            ? 'bg-[var(--color-surface-active)] text-[var(--color-primary)]'
                            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </>
      )}

      {/* ═══ BODY: sidebar + main ═══ */}
      <div className="flex flex-1">
        {/* ═══ DESKTOP SIDEBAR — consultant & admin (MAQ-06/07) ═══ */}
        {hasSidebar && (
          <aside
            className={`hidden w-60 flex-shrink-0 flex-col md:flex ${
              isAdmin
                ? 'bg-[var(--color-primary-dark)]'
                : 'bg-[var(--color-surface)] border-r border-[var(--color-border)]'
            }`}
            aria-label="Navigation principale"
          >
            {/* Nav items */}
            <nav className="flex-1 px-3 py-4">
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isItemActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isAdmin
                            ? active
                              ? 'bg-white/15 text-white'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                            : active
                              ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Sidebar footer — role indicator */}
            <div className={`px-4 py-3 text-xs ${
              isAdmin
                ? 'border-t border-white/10 text-white/40'
                : 'border-t border-[var(--color-border)] text-[var(--color-text-muted)]'
            }`}>
              {getRoleLabel(role)}
            </div>
          </aside>
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-hover)] py-3">
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Link&apos;s Accompagnement — Extranet {getRoleLabel(role).toLowerCase()} — &copy; {new Date().getFullYear()} Unanima
        </p>
      </footer>
    </div>
  )
}
