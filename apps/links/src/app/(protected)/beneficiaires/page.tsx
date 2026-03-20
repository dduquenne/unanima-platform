'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { DataTable, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Beneficiaire } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const statutConfig: Record<string, StatusConfig> = {
  actif: { label: 'Actif', color: 'success' },
  en_pause: { label: 'En pause', color: 'warning' },
  termine: { label: 'Terminé', color: 'info' },
  abandonne: { label: 'Abandonné', color: 'danger' },
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBeneficiaireName(row: Beneficiaire): string {
  const meta = row.metadata as Record<string, unknown> | undefined
  if (meta?.full_name && typeof meta.full_name === 'string') {
    return meta.full_name
  }
  if (meta?.nom && typeof meta.nom === 'string') {
    const prenom = typeof meta.prenom === 'string' ? meta.prenom : ''
    return prenom ? `${prenom} ${meta.nom}` : meta.nom
  }
  return row.id.slice(0, 8) + '...'
}

function getBeneficiaireEmail(row: Beneficiaire): string {
  const meta = row.metadata as Record<string, unknown> | undefined
  if (meta?.email && typeof meta.email === 'string') {
    return meta.email
  }
  return '—'
}

function getConsultantName(row: Beneficiaire): string {
  const meta = row.metadata as Record<string, unknown> | undefined
  if (meta?.consultant_name && typeof meta.consultant_name === 'string') {
    return meta.consultant_name
  }
  return row.consultant_id.slice(0, 8) + '...'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: ColumnDef<Beneficiaire>[] = [
  {
    key: 'nom',
    header: 'Nom',
    render: (row) => (
      <span className="font-medium text-[var(--color-text)]">
        {getBeneficiaireName(row)}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'email',
    header: 'Email',
    render: (row) => (
      <span className="text-[var(--color-text-secondary)]">
        {getBeneficiaireEmail(row)}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'consultant_id',
    header: 'Consultant',
    render: (row) => (
      <span className="text-[var(--color-text-secondary)]">
        {getConsultantName(row)}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'statut',
    header: 'Statut',
    render: (row) => (
      <StatusBadge status={row.statut} statusConfig={statutConfig} />
    ),
    sortable: true,
  },
  {
    key: 'created_at',
    header: "Date d'inscription",
    render: (row) => (
      <span className="text-[var(--color-text-secondary)]">
        {formatDate(row.created_at)}
      </span>
    ),
    sortable: true,
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BeneficiairesPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate = user?.role === 'consultant' || user?.role === 'super_admin'

  useEffect(() => {
    const controller = new AbortController()

    async function fetchBeneficiaires() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/beneficiaires?limit=100', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(
            `Erreur lors du chargement des bénéficiaires (${response.status})`,
          )
        }

        const json: unknown = await response.json()

        // Handle both response formats: direct array or { data, meta }
        if (Array.isArray(json)) {
          setBeneficiaires(json as Beneficiaire[])
        } else if (
          json !== null &&
          typeof json === 'object' &&
          'data' in json &&
          Array.isArray((json as Record<string, unknown>).data)
        ) {
          setBeneficiaires(
            (json as { data: Beneficiaire[] }).data,
          )
        } else {
          throw new Error('Format de réponse inattendu')
        }
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

    fetchBeneficiaires()

    return () => {
      controller.abort()
    }
  }, [])

  // --- Actions column ---

  function renderActions(row: Beneficiaire): ReactNode {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            router.push(`/beneficiaires/${row.id}`)
          }}
        >
          Voir
        </Button>
        <Link
          href={`/beneficiaires/${row.id}/bilans/nouveau`}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
        >
          Créer bilan
        </Link>
      </div>
    )
  }

  // --- Loading state ---

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // --- Error state ---

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Bénéficiaires
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <svg
              className="h-12 w-12 text-[var(--color-danger)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-[var(--radius-md,0.5rem)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              Réessayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Empty state ---

  if (beneficiaires.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            Bénéficiaires
          </h2>
          {canCreate && (
            <Link href="/beneficiaires/nouveau">
              <Button variant="primary" size="sm">
                Nouveau bénéficiaire
              </Button>
            </Link>
          )}
        </div>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <svg
              className="h-16 w-16 text-[var(--color-text-muted,var(--color-text))]/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
            <p className="text-lg font-medium text-[var(--color-text)]">
              Aucun bénéficiaire
            </p>
            <p className="max-w-sm text-sm text-[var(--color-text-secondary)]">
              Il n&apos;y a aucun bénéficiaire pour le moment.
              {canCreate &&
                ' Commencez par en créer un pour démarrer le suivi.'}
            </p>
            {canCreate && (
              <Link href="/beneficiaires/nouveau">
                <Button variant="primary" size="md">
                  Créer un bénéficiaire
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // --- Main view ---

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Bénéficiaires
        </h2>
        {canCreate && (
          <Link href="/beneficiaires/nouveau">
            <Button variant="primary" size="sm">
              Nouveau bénéficiaire
            </Button>
          </Link>
        )}
      </div>

      <DataTable<Beneficiaire>
        columns={columns}
        data={beneficiaires}
        searchable
        paginated
        pageSize={10}
        onRowClick={(row) => router.push(`/beneficiaires/${row.id}`)}
        actions={renderActions}
        emptyMessage="Aucun bénéficiaire trouvé pour cette recherche."
      />
    </div>
  )
}
