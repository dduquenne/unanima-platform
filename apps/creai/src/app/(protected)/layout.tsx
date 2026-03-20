'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Layout, type NavItem } from '@unanima/dashboard'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Button } from '@unanima/core'

const directionNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard' },
  { label: '\u00c9tablissements', href: '/etablissements' },
  { label: 'Diagnostics', href: '/diagnostics' },
  { label: 'Indicateurs', href: '/indicateurs' },
  { label: 'Rapports', href: '/rapports' },
]

const professionnelNav: NavItem[] = [
  { label: 'Mon espace', href: '/dashboard' },
  { label: 'Mes \u00e9tablissements', href: '/etablissements' },
]

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, isLoading } = useAuth()
  const { isAuthorized } = useRequireRole(['admin_creai', 'direction', 'coordonnateur', 'professionnel'])

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

  const isDirectionOrAdmin = user?.role === 'admin_creai' || user?.role === 'direction' || user?.role === 'coordonnateur'
  const navItems = (isDirectionOrAdmin ? directionNav : professionnelNav).map((item) => ({
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
        title: 'CREAI \u00cele-de-France',
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
