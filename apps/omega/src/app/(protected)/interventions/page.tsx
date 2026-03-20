'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Card, Spinner, Button } from '@unanima/core'
import { DataTable, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'

import type { Intervention } from '@/lib/types'

interface ApiResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number }
}

const typeLabels: Record<Intervention['type'], string> = {
  garantie: 'Garantie',
  maintenance: 'Maintenance',
  reparation: 'Réparation',
  rappel: 'Rappel',
  diagnostic: 'Diagnostic',
}

const statutConfig: Record<string, StatusConfig> = {
  planifiee: { label: 'Planifiée', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  en_attente_pieces: { label: 'En attente pièces', color: 'danger' },
  terminee: { label: 'Terminée', color: 'success' },
  annulee: { label: 'Annulée', color: 'info' },
}

const prioriteConfig: Record<string, StatusConfig> = {
  critique: { label: 'Critique', color: 'danger' },
  haute: { label: 'Haute', color: 'warning' },
  normale: { label: 'Normale', color: 'info' },
  basse: { label: 'Basse', color: 'success' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id
  return `${id.slice(0, length)}…`
}

export default function InterventionsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate =
    user?.role === 'admin' || user?.role === 'responsable_sav'

  const fetchInterventions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/interventions?limit=100')
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des interventions')
      }
      const json: ApiResponse<Intervention> = await res.json()
      setInterventions(json.data ?? [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInterventions()
  }, [fetchInterventions])

  const columns: ColumnDef<Intervention>[] = [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text)' }}>
          {typeLabels[row.type] ?? row.type}
        </span>
      ),
    },
    {
      key: 'client_vehicule_id',
      header: 'Client / Véhicule',
      sortable: true,
      render: (row) => (
        <span
          title={row.client_vehicule_id}
          style={{ color: 'var(--color-text-secondary, var(--color-text))' }}
        >
          {truncateId(row.client_vehicule_id)}
        </span>
      ),
    },
    {
      key: 'priorite',
      header: 'Priorité',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.priorite} statusConfig={prioriteConfig} />
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.statut} statusConfig={statutConfig} />
      ),
    },
    {
      key: 'date_planifiee',
      header: 'Date planifiée',
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text)' }}>
          {formatDate(row.date_planifiee)}
        </span>
      ),
    },
    {
      key: 'technicien_id',
      header: 'Technicien',
      sortable: true,
      render: (row) => (
        <span
          style={{
            color: row.technicien_id
              ? 'var(--color-text)'
              : 'var(--color-text-muted, var(--color-text))',
          }}
        >
          {row.technicien_id ? truncateId(row.technicien_id) : 'Non affecté'}
        </span>
      ),
    },
  ]

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Interventions
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--color-danger, #dc2626)' }}
            >
              {error}
            </p>
            <button
              onClick={fetchInterventions}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Réessayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Interventions
        </h2>
        {canCreate && (
          <Button onClick={() => router.push('/interventions/new')}>
            Nouvelle intervention
          </Button>
        )}
      </div>

      <DataTable<Intervention>
        columns={columns}
        data={interventions}
        searchable
        paginated
        pageSize={10}
        onRowClick={(row) => router.push(`/interventions/${row.id}`)}
        emptyMessage="Aucune intervention trouvée"
      />
    </div>
  )
}
