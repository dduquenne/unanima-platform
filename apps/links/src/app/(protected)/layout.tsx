'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Layout, type NavItem } from '@unanima/dashboard'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Button } from '@unanima/core'

const consultantNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/dashboard' },
  { label: 'B\u00e9n\u00e9ficiaires', href: '/beneficiaires' },
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
  const { user, signOut, isLoading } = useAuth()
  const { isAuthorized } = useRequireRole(['beneficiaire', 'consultant', 'super_admin'])

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

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

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
