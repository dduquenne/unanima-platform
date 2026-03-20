'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { DataTable, StatusBadge, type ColumnDef, type StatusConfig } from '@unanima/dashboard'

import type { Diagnostic, Etablissement } from '@/lib/types'

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

const DIAGNOSTIC_STATUT_CONFIG: Record<string, StatusConfig> = {
  brouillon: { label: 'Brouillon', color: 'info' },
  en_cours: { label: 'En cours', color: 'info' },
  finalise: { label: 'Finalisé', color: 'warning' },
  valide: { label: 'Validé', color: 'success' },
}

const ADMIN_ROLES = ['admin_creai', 'direction', 'coordonnateur']

const diagnosticColumns: ColumnDef<Diagnostic>[] = [
  {
    key: 'date_diagnostic',
    header: 'Date',
    sortable: true,
    render: (row) =>
      new Date(row.date_diagnostic).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
  {
    key: 'statut',
    header: 'Statut',
    sortable: true,
    render: (row) => (
      <StatusBadge status={row.statut} statusConfig={DIAGNOSTIC_STATUT_CONFIG} />
    ),
  },
  {
    key: 'synthese',
    header: 'Synthèse',
    render: (row) =>
      row.synthese
        ? row.synthese.length > 80
          ? `${row.synthese.slice(0, 80)}...`
          : row.synthese
        : '—',
  },
  {
    key: 'created_at',
    header: 'Créé le',
    sortable: true,
    render: (row) =>
      new Date(row.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  },
]

export default function EtablissementDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [etablissement, setEtablissement] = useState<Etablissement | null>(null)
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const canEdit = user?.role != null && ADMIN_ROLES.includes(user.role)

  const fetchEtablissement = useCallback(async () => {
    if (!params.id) return

    setIsLoading(true)
    setError(null)
    setNotFound(false)

    try {
      const [etabRes, diagRes] = await Promise.all([
        fetch(`/api/etablissements/${params.id}`),
        fetch(`/api/diagnostics?etablissement_id=${params.id}`),
      ])

      if (etabRes.status === 404) {
        setNotFound(true)
        return
      }

      if (!etabRes.ok) {
        throw new Error('Erreur lors du chargement de l\u2019établissement.')
      }

      const etabData = (await etabRes.json()) as { etablissement: Etablissement }
      setEtablissement(etabData.etablissement)

      if (diagRes.ok) {
        const diagData = (await diagRes.json()) as { diagnostics: Diagnostic[] }
        setDiagnostics(diagData.diagnostics ?? [])
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchEtablissement()
  }, [fetchEtablissement])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <nav className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <button
            onClick={() => router.push('/etablissements')}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Établissements
          </button>
          <span className="mx-2">&gt;</span>
          <span>Introuvable</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--color-text)' }}>
              Établissement introuvable.
            </p>
            <Button
              onClick={() => router.push('/etablissements')}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <nav className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          <button
            onClick={() => router.push('/etablissements')}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Établissements
          </button>
          <span className="mx-2">&gt;</span>
          <span>Erreur</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--color-danger, #dc2626)' }}>
              {error}
            </p>
            <button
              onClick={fetchEtablissement}
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

  if (!etablissement) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        <button
          onClick={() => router.push('/etablissements')}
          className="hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Établissements
        </button>
        <span className="mx-2">&gt;</span>
        <span style={{ color: 'var(--color-text)' }}>{etablissement.nom}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text)' }}
          >
            {etablissement.nom}
          </h2>
          <StatusBadge
            status={etablissement.statut}
            statusConfig={STATUT_CONFIG}
          />
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                router.push(`/etablissements/${etablissement.id}/modifier`)
              }
            >
              Modifier
            </Button>
            <Button
              onClick={() => {
                /* TODO: implement désactivation */
              }}
              variant="outline"
            >
              Désactiver
            </Button>
          </div>
        )}
      </div>

      {/* Informations générales */}
      <Card padding="lg">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Informations générales
        </h3>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Nom
            </dt>
            <dd className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
              {etablissement.nom}
            </dd>
          </div>
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Type
            </dt>
            <dd className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
              {TYPE_LABELS[etablissement.type] ?? etablissement.type}
            </dd>
          </div>
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Adresse
            </dt>
            <dd className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
              {etablissement.adresse ?? '—'}
            </dd>
          </div>
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              SIRET
            </dt>
            <dd className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
              {etablissement.siret ?? '—'}
            </dd>
          </div>
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Capacité
            </dt>
            <dd className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
              {etablissement.capacite != null ? `${etablissement.capacite} places` : '—'}
            </dd>
          </div>
          <div>
            <dt
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Statut
            </dt>
            <dd className="mt-1">
              <StatusBadge
                status={etablissement.statut}
                statusConfig={STATUT_CONFIG}
              />
            </dd>
          </div>
        </dl>
      </Card>

      {/* Diagnostics */}
      <Card padding="lg">
        <h3
          className="mb-4 text-lg font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Diagnostics
        </h3>
        <DataTable<Diagnostic>
          columns={diagnosticColumns}
          data={diagnostics}
          searchable
          paginated
          pageSize={5}
          onRowClick={(row) => router.push(`/diagnostics/${row.id}`)}
          emptyMessage="Aucun diagnostic pour cet établissement."
        />
      </Card>
    </div>
  )
}
