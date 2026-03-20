'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { DataTable, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Bilan } from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<Bilan['type'], string> = {
  initial: 'Initial',
  intermediaire: 'Interm\u00e9diaire',
  final: 'Final',
}

const STATUT_CONFIG: Record<Bilan['statut'], StatusConfig> = {
  brouillon: { label: 'Brouillon', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  termine: { label: 'Termin\u00e9', color: 'success' },
  valide: { label: 'Valid\u00e9', color: 'primary' },
}

// ---------------------------------------------------------------------------
// Colonnes
// ---------------------------------------------------------------------------

function buildColumns(
  onVoir: (bilan: Bilan) => void,
): ColumnDef<Bilan>[] {
  return [
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row) => TYPE_LABELS[row.type] ?? row.type,
    },
    {
      key: 'beneficiaire_id',
      header: 'B\u00e9n\u00e9ficiaire',
      render: (row) => row.beneficiaire_id.slice(0, 8) + '\u2026',
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
      key: 'date_debut',
      header: 'Date d\u00e9but',
      sortable: true,
      render: (row) =>
        row.date_debut
          ? new Date(row.date_debut).toLocaleDateString('fr-FR')
          : '\u2014',
    },
    {
      key: 'date_fin',
      header: 'Date fin',
      sortable: true,
      render: (row) =>
        row.date_fin
          ? new Date(row.date_fin).toLocaleDateString('fr-FR')
          : '\u2014',
    },
    {
      key: 'created_at',
      header: 'Cr\u00e9\u00e9 le',
      sortable: true,
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('fr-FR'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onVoir(row)
          }}
        >
          Voir
        </Button>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BilansPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [bilans, setBilans] = useState<Bilan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate =
    user?.role === 'consultant' || user?.role === 'super_admin'

  useEffect(() => {
    if (authLoading) return

    const controller = new AbortController()

    async function fetchBilans() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/bilans?limit=100', {
          signal: controller.signal,
        })

        if (!res.ok) {
          throw new Error(
            `Erreur lors du chargement des bilans (${res.status})`,
          )
        }

        const data: Bilan[] = await res.json()
        setBilans(data)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message =
          err instanceof Error
            ? err.message
            : 'Une erreur inattendue est survenue.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBilans()

    return () => {
      controller.abort()
    }
  }, [authLoading])

  const navigateToBilan = (bilan: Bilan) => {
    router.push(`/bilans/${bilan.id}`)
  }

  const columns = buildColumns(navigateToBilan)

  // --- Loading ---

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // --- Error ---

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Bilans
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-[var(--radius-md,0.5rem)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              R\u00e9essayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Bilans
        </h2>
        {canCreate && (
          <Button onClick={() => router.push('/bilans/nouveau')}>
            Nouveau bilan
          </Button>
        )}
      </div>

      <DataTable<Bilan>
        columns={columns}
        data={bilans}
        searchable
        paginated
        pageSize={10}
        onRowClick={navigateToBilan}
        emptyMessage="Aucun bilan trouv\u00e9."
      />
    </div>
  )
}
