'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Button, Card } from '@unanima/core'
import { User, ShieldCheck } from 'lucide-react'

type TabKey = 'profil' | 'donnees'

const ROLE_LABELS: Record<string, string> = {
  beneficiaire: 'Bénéficiaire',
  consultant: 'Consultante',
  super_admin: 'Administrateur',
}

export default function ProfilPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabKey>('profil')

  // --- RGPD state ---
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setMessage(null)

    try {
      const res = await fetch('/api/rgpd/export')
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de l\u2019export')
      }

      const { data } = await res.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mes-donnees-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)

      setMessage('Vos données ont été exportées avec succès.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de l\u2019export',
      )
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/rgpd/delete', { method: 'POST' })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors de la suppression')
      }

      await signOut()
      router.push('/login')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur lors de la suppression',
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Mon compte
      </h2>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] p-1">
        <button
          onClick={() => setActiveTab('profil')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'profil'
              ? 'bg-white text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <User className="h-4 w-4" />
          Mon profil
        </button>
        <button
          onClick={() => setActiveTab('donnees')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'donnees'
              ? 'bg-white text-[var(--color-primary)] shadow-sm'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Mes données
        </button>
      </div>

      {/* Tab: Mon profil */}
      {activeTab === 'profil' && (
        <Card padding="lg">
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
              <dd className="text-sm text-[var(--color-text)]">
                {ROLE_LABELS[user?.role ?? ''] ?? user?.role}
              </dd>
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
      )}

      {/* Tab: Mes données */}
      {activeTab === 'donnees' && (
        <div className="space-y-6">
          {error && (
            <Card padding="md">
              <p className="text-sm text-[var(--color-danger)]">{error}</p>
            </Card>
          )}

          {message && (
            <Card padding="md">
              <p className="text-sm text-[var(--color-success)]">{message}</p>
            </Card>
          )}

          {/* Export section */}
          <Card padding="lg">
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
              Exporter mes données
            </h3>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Conformément au RGPD (droit à la portabilité), vous pouvez
              télécharger l{"'"}ensemble de vos données personnelles au format
              JSON.
            </p>
            <Button
              variant="primary"
              size="md"
              loading={exporting}
              onClick={handleExport}
            >
              Exporter mes données
            </Button>
          </Card>

          {/* Delete section */}
          <Card padding="lg">
            <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">
              Supprimer mon compte
            </h3>
            <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
              Conformément au RGPD (droit à l{"'"}effacement), vous pouvez
              demander la suppression définitive de votre compte et de toutes vos
              données. Cette action est irréversible.
            </p>

            {!confirmDelete ? (
              <Button
                variant="danger"
                size="md"
                onClick={() => setConfirmDelete(true)}
              >
                Demander la suppression
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--color-danger)]">
                  Êtes-vous sûr ? Toutes vos données seront définitivement
                  supprimées.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="danger"
                    size="md"
                    loading={deleting}
                    onClick={handleDelete}
                  >
                    Confirmer la suppression
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
