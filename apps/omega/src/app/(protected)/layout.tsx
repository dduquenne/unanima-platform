'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Layout, type NavItem } from '@unanima/dashboard'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Button } from '@unanima/core'

const responsableNav: NavItem[] = [
  { label: 'Dashboard SAV', href: '/dashboard' },
  { label: 'Interventions', href: '/interventions' },
  { label: 'Pi\u00e8ces d\u00e9tach\u00e9es', href: '/pieces' },
  { label: 'Alertes stock', href: '/alertes' },
  { label: 'KPIs', href: '/kpis' },
]

const technicienNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mes interventions', href: '/interventions' },
  { label: 'Pi\u00e8ces d\u00e9tach\u00e9es', href: '/pieces' },
]

const operateurNav: NavItem[] = [
  { label: 'Mon espace', href: '/dashboard' },
  { label: 'Pi\u00e8ces d\u00e9tach\u00e9es', href: '/pieces' },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()
  const { isAuthorized } = useRequireRole(['admin', 'responsable_sav', 'technicien', 'operateur'])

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

  function getNavItems(): NavItem[] {
    if (user?.role === 'admin' || user?.role === 'responsable_sav') return responsableNav
    if (user?.role === 'technicien') return technicienNav
    return operateurNav
  }

  const navItems = getNavItems().map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(item.href + '/'),
  }))

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <Layout
      sidebar={navItems}
      header={{
        title: 'Omega Automotive',
        actions: (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profile')}
              className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
            >
              {user?.fullName}
            </button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              D\u00e9connexion
            </Button>
          </div>
        ),
      }}
    >
      {children}
    </Layout>
  )
}
