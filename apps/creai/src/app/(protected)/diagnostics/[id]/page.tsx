'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { StatusBadge, DataTable } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Diagnostic, Recommandation } from '@/lib/types'

const STATUT_CONFIG: Record<string, StatusConfig> = {
  brouillon: { label: 'Brouillon', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  finalise: { label: 'Finalisé', color: 'success' },
  valide: { label: 'Validé', color: 'primary' },
}

const PRIORITE_CONFIG: Record<string, StatusConfig> = {
  critique: { label: 'Critique', color: 'danger' },
  haute: { label: 'Haute', color: 'warning' },
  moyenne: { label: 'Moyenne', color: 'info' },
  basse: { label: 'Basse', color: 'success' },
}

const RECO_STATUT_CONFIG: Record<string, StatusConfig> = {
  proposee: { label: 'Proposée', color: 'info' },
  acceptee: { label: 'Acceptée', color: 'primary' },
  en_cours: { label: 'En cours', color: 'warning' },
  realisee: { label: 'Réalisée', color: 'success' },
  rejetee: { label: 'Rejetée', color: 'danger' },
}

export default function DiagnosticDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [recommandations, setRecommandations] = useState<Recommandation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canEdit = user?.role === 'admin_creai' || user?.role === 'coordonnateur'

  useEffect(() => {
    if (authLoading || !params.id) return
    const controller = new AbortController()

    async function fetchData() {
      setIsLoading(true)
      try {
        const [diagRes, recoRes] = await Promise.all([
          fetch(`/api/diagnostics/${params.id}`, { signal: controller.signal }),
          fetch(`/api/recommandations?diagnostic_id=${params.id}&limit=50`, { signal: controller.signal }),
        ])

        if (!diagRes.ok) throw new Error('Diagnostic introuvable')
        setDiagnostic(await diagRes.json())

        if (recoRes.ok) {
          const json = await recoRes.json()
          setRecommandations(json.data ?? [])
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Erreur inattendue')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [authLoading, params.id])

  const recoColumns: ColumnDef<Recommandation>[] = [
    { key: 'description', header: 'Description', sortable: true },
    {
      key: 'priorite',
      header: 'Priorité',
      sortable: true,
      render: (row) => <StatusBadge status={row.priorite} statusConfig={PRIORITE_CONFIG} />,
    },
    {
      key: 'statut',
      header: 'Statut',
      sortable: true,
      render: (row) => <StatusBadge status={row.statut} statusConfig={RECO_STATUT_CONFIG} />,
    },
    {
      key: 'echeance',
      header: 'Échéance',
      render: (row) =>
        row.echeance
          ? new Date(row.echeance).toLocaleDateString('fr-FR')
          : '—',
    },
  ]

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !diagnostic) {
    return (
      <Card padding="lg">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-[var(--color-danger)]">{error ?? 'Diagnostic introuvable'}</p>
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
        <Link href="/etablissements" className="hover:text-[var(--color-primary)]">
          Établissements
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/etablissements/${diagnostic.etablissement_id}`} className="hover:text-[var(--color-primary)]">
          Établissement
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">Diagnostic</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">Diagnostic</h2>
          <StatusBadge status={diagnostic.statut} statusConfig={STATUT_CONFIG} />
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                const nextStatut = diagnostic.statut === 'brouillon' ? 'en_cours'
                  : diagnostic.statut === 'en_cours' ? 'finalise'
                  : diagnostic.statut === 'finalise' ? 'valide'
                  : null
                if (!nextStatut) return
                const res = await fetch(`/api/diagnostics/${diagnostic.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ statut: nextStatut }),
                })
                if (res.ok) setDiagnostic(await res.json())
              }}
              disabled={diagnostic.statut === 'valide'}
            >
              {diagnostic.statut === 'valide' ? 'Validé' : 'Avancer le statut'}
            </Button>
          </div>
        )}
      </div>

      <Card padding="lg">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">Date</dt>
            <dd className="mt-1 text-sm text-[var(--color-text)]">
              {new Date(diagnostic.date_diagnostic).toLocaleDateString('fr-FR')}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-[var(--color-text-muted)]">Créé le</dt>
            <dd className="mt-1 text-sm text-[var(--color-text)]">
              {new Date(diagnostic.created_at).toLocaleDateString('fr-FR')}
            </dd>
          </div>
          {diagnostic.synthese && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-[var(--color-text-muted)]">Synthèse</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">
                {diagnostic.synthese}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">
          Recommandations ({recommandations.length})
        </h3>
        {recommandations.length > 0 ? (
          <DataTable columns={recoColumns} data={recommandations} pageSize={10} />
        ) : (
          <Card padding="md">
            <p className="text-sm text-[var(--color-text-muted)]">Aucune recommandation</p>
          </Card>
        )}
      </div>
    </div>
  )
}
