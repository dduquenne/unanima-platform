'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { DataTable } from '@unanima/dashboard'
import type { ColumnDef } from '@unanima/dashboard'
import { StatusBadge } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'
import { Card, Spinner, Button } from '@unanima/core'
import { useAuth } from '@unanima/auth'

import type { Etablissement } from '@/lib/types'

const TYPE_LABELS: Record<Etablissement['type'], string> = {
  ehpad: 'EHPAD',
  ime: 'IME',
  esat: 'ESAT',
  mecs: 'MECS',
  savs: 'SAVS',
  sessad: 'SESSAD',
  foyer: 'Foyer',
  autre: 'Autre',
}

const STATUT_CONFIG: Record<string, StatusConfig> = {
  actif: { label: 'Actif', color: 'success' },
  inactif: { label: 'Inactif', color: 'danger' },
  en_transformation: { label: 'En transformation', color: 'warning' },
}

const ADMIN_ROLES = ['admin_creai', 'direction', 'coordonnateur']

const columns: ColumnDef<Etablissement>[] = [
  {
    key: 'nom',
    header: 'Nom',
    sortable: true,
  },
  {
    key: 'type',
    header: 'Type',
    sortable: true,
    render: (row) => TYPE_LABELS[row.type] ?? row.type,
  },
  {
    key: 'capacite',
    header: 'Capacit\u00e9',
    sortable: true,
  },
  {
    key: 'statut',
    header: 'Statut',
    sortable: true,
    render: (row) => (
      <StatusBadge status={row.statut} statusConfig={STATUT_CONFIG} />
    ),
  },
  {
    key: 'adresse',
    header: 'Adresse',
  },
  {
    key: 'created_at',
    header: 'Date cr\u00e9ation',
    sortable: true,
    render: (row) =>
      new Date(row.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
]

export default function EtablissementsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate = user?.role != null && ADMIN_ROLES.includes(user.role)

  const fetchEtablissements = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/etablissements?limit=100')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des \u00e9tablissements.')
      }

      const data = (await response.json()) as { etablissements: Etablissement[] }
      setEtablissements(data.etablissements ?? [])
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEtablissements()
  }, [fetchEtablissements])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          \u00c9tablissements
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--color-danger, #dc2626)' }}>
              {error}
            </p>
            <button
              onClick={fetchEtablissements}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              R\u00e9essayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          \u00c9tablissements
        </h2>
        {canCreate && (
          <Button onClick={() => router.push('/etablissements/nouveau')}>
            Nouvel \u00e9tablissement
          </Button>
        )}
      </div>

      <Card padding="lg">
        <DataTable<Etablissement>
          columns={columns}
          data={etablissements}
          searchable
          paginated
          pageSize={10}
          onRowClick={(row) => router.push(`/etablissements/${row.id}`)}
          actions={(row) => (
            <Button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                router.push(`/etablissements/${row.id}`)
              }}
            >
              Voir
            </Button>
          )}
          emptyMessage="Aucun \u00e9tablissement trouv\u00e9."
        />
      </Card>
    </div>
  )
}
