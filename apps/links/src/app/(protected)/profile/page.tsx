'use client'

import { useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Mon profil
      </h2>
      <Card padding="lg" className="max-w-2xl">
        <dl className="divide-y divide-[var(--color-border-light)]">
          <div className="flex justify-between py-3">
            <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Nom complet</dt>
            <dd className="text-sm text-[var(--color-text)]">{user?.fullName}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Adresse e-mail</dt>
            <dd className="text-sm text-[var(--color-text)]">{user?.email}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Rôle</dt>
            <dd className="text-sm text-[var(--color-text)] capitalize">{user?.role}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-sm font-medium text-[var(--color-text-secondary)]">Statut</dt>
            <dd className="text-sm">
              <span className={user?.isActive
                ? 'text-[var(--color-success)]'
                : 'text-[var(--color-danger)]'
              }>
                {user?.isActive ? 'Actif' : 'Inactif'}
              </span>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
