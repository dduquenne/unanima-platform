'use client'

import { useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Bienvenue, {user?.fullName}
      </h2>
      <Card padding="lg">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-[var(--color-text-secondary)]">
            Le tableau de bord est en cours de construction.
          </p>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Les indicateurs et statistiques appara&icirc;tront ici prochainement.
          </p>
        </div>
      </Card>
    </div>
  )
}
