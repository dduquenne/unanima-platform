'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth, useRequireRole } from '@unanima/auth'
import { LogOut, LayoutDashboard, Users, FileText, FolderOpen, Menu, X, User, ChevronRight } from 'lucide-react'
import { SimulationBanner } from '@/components/simulation-banner'

const SESSION_MAX_DURATION_MS = 8 * 60 * 60 * 1000 // 8 hours
const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // Check every minute

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const beneficiaireNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Mon bilan', href: '/bilans', icon: <FileText className="h-5 w-5" /> },
  { label: 'Documents', href: '/documents', icon: <FolderOpen className="h-5 w-5" /> },
  { label: 'Profil', href: '/profil', icon: <User className="h-5 w-5" /> },
]

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

function getBreadcrumb(pathname: string, role: string): { parent: string; current: string } {
  const segments = pathname.split('/').filter(Boolean)
  const roleLabel = getRoleLabel(role)

  if (segments.length === 0) return { parent: roleLabel, current: 'Accueil' }

  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    bilans: 'Mon bilan',
    documents: 'Documents',
    profil: 'Profil',
    consultant: 'Consultant',
    admin: 'Administration',
    utilisateurs: 'Utilisateurs',
    beneficiaires: 'Bénéficiaires',
  }

  const lastSegment = segments[segments.length - 1] ?? ''
  const current = routeLabels[lastSegment] ?? lastSegment

  return { parent: roleLabel, current }
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
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div
          className="h-10 w-10 animate-spin rounded-full"
          style={{ borderWidth: 4, borderColor: 'rgb(42 127 212 / 0.2)', borderTopColor: '#2A7FD4' }}
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  const role = user?.role ?? 'beneficiaire'
  const navItems = role === 'super_admin'
    ? adminNav
    : role === 'consultant'
      ? consultantNav
      : beneficiaireNav

  const isItemActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  const breadcrumb = getBreadcrumb(pathname, role)

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Bandeau Mode Simulation (Sprint 12) — pleine largeur en haut */}
      <SimulationBanner />

      {/* Skip link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-2xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2"
        style={{ color: 'var(--color-primary)' }}
      >
        Aller au contenu principal
      </a>

      <div className="flex flex-1">
      {/* ═══ SIDEBAR — all roles (MAQ-02 chaleureux) ═══ */}
      <aside
        className="hidden w-[220px] flex-shrink-0 flex-col md:flex"
        style={{ background: 'var(--gradient-sidebar)' }}
        aria-label="Navigation principale"
      >
        {/* Warm overlay */}
        <div className="pointer-events-none absolute inset-0 w-[220px]" style={{ backgroundColor: '#FF6B35', opacity: 0.04 }} />

        {/* Logo */}
        <div className="relative px-6 pb-3 pt-5">
          <div className="flex items-baseline gap-0">
            <span className="text-base font-bold text-white">Link{"'"}s</span>
            {/* Orange polygon accent */}
            <svg width="10" height="16" viewBox="0 0 10 16" className="-ml-0.5 -mt-3" aria-hidden="true">
              <polygon points="0,0 10,0 8,16 2,16" fill="#F28C5A" />
            </svg>
          </div>
          <p className="text-xs" style={{ color: '#C4D8EC' }}>Accompagnement</p>
        </div>

        {/* Separator */}
        <div className="mx-5 mb-3" style={{ height: 1, backgroundColor: '#1A4F80', opacity: 0.5 }} />

        {/* Nav items */}
        <nav className="relative flex-1 px-2.5">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{
                      borderRadius: 16,
                      color: active ? '#FFFFFF' : '#C4D8EC',
                      backgroundColor: active ? 'rgba(42, 127, 212, 0.2)' : 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2"
                        style={{ width: 4, height: '60%', borderRadius: 2, backgroundColor: '#FFFFFF' }}
                      />
                    )}
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="relative px-5 py-3" style={{ borderTop: '1px solid rgba(26, 79, 128, 0.5)' }}>
          <Link href="/profil" className="text-xs hover:underline" style={{ color: '#C4D8EC' }}>
            Mes données
          </Link>
          <p className="mt-1 text-[10px]" style={{ color: '#6E8FAB' }}>v3.0.0</p>
        </div>
      </aside>

      {/* ═══ MOBILE NAV DRAWER ═══ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav
            className="fixed inset-y-0 left-0 z-40 w-64 md:hidden"
            style={{ background: 'var(--gradient-sidebar)' }}
            aria-label="Navigation mobile"
          >
            {/* Mobile logo */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <span className="text-base font-bold text-white">Link{"'"}s</span>
                <p className="text-xs" style={{ color: '#C4D8EC' }}>Accompagnement</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-1.5 text-white/70 hover:text-white"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-5 mb-3" style={{ height: 1, backgroundColor: '#1A4F80', opacity: 0.5 }} />

            <ul className="flex flex-col gap-1 px-2.5">
              {navItems.map((item) => {
                const active = isItemActive(item.href)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className="relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                      style={{
                        borderRadius: 16,
                        color: active ? '#FFFFFF' : '#C4D8EC',
                        backgroundColor: active ? 'rgba(42, 127, 212, 0.2)' : 'transparent',
                      }}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2"
                          style={{ width: 4, height: '60%', borderRadius: 2, backgroundColor: '#FFFFFF' }}
                        />
                      )}
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

      {/* ═══ MAIN AREA (header + content) ═══ */}
      <div className="flex flex-1 flex-col">
        {/* ═══ HEADER (MAQ-02 chaleureux) ═══ */}
        <header
          className="flex h-16 items-center justify-between px-4 sm:px-6"
          style={{
            backgroundColor: 'var(--color-surface)',
            boxShadow: '0 1px 3px rgb(212 160 138 / 0.08)',
          }}
        >
          {/* Left: mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-1.5 transition-colors md:hidden"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Menu de navigation"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb */}
            <nav aria-label="Fil d'ariane" className="flex items-center gap-1.5 text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>{breadcrumb.parent}</span>
              <ChevronRight className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
              <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{breadcrumb.current}</span>
            </nav>
          </div>

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3">
            {/* User info (hidden on small screens) */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{user?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{getRoleLabel(role)}</p>
            </div>

            {/* Avatar */}
            <button
              onClick={() => router.push('/profil')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#2A7FD4' }}
              aria-label="Mon profil"
            >
              {getInitials(user?.fullName ?? '')}
            </button>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center rounded-xl transition-colors"
              style={{
                width: 34,
                height: 26,
                backgroundColor: '#FFF0E8',
                border: '1px solid #F2D5C4',
              }}
              aria-label="Déconnexion"
            >
              <LogOut className="h-3.5 w-3.5" style={{ color: '#F28C5A' }} />
            </button>
          </div>
        </header>

        {/* ═══ MAIN CONTENT ═══ */}
        <main id="main-content" className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {children}
        </main>

        {/* ═══ FOOTER ═══ */}
        <footer style={{ borderTop: '1px solid var(--color-border-light)' }} className="py-3">
          <p className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Link{"'"}s Accompagnement — Extranet {getRoleLabel(role).toLowerCase()} — © {new Date().getFullYear()} Unanima
          </p>
        </footer>
      </div>
      </div>
    </div>
  )
}
