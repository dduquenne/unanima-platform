'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Modal, Spinner, Tabs } from '@unanima/core'
import { DataTable, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Beneficiaire, Bilan, Document } from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const STATUT_CONFIG: Record<Beneficiaire['statut'], StatusConfig> = {
  actif: { label: 'Actif', color: 'success' },
  en_pause: { label: 'En pause', color: 'warning' },
  termine: { label: 'Terminé', color: 'info' },
  abandonne: { label: 'Abandonné', color: 'danger' },
}

const BILAN_STATUT_CONFIG: Record<Bilan['statut'], StatusConfig> = {
  brouillon: { label: 'Brouillon', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  termine: { label: 'Terminé', color: 'success' },
  valide: { label: 'Validé', color: 'primary' },
}

const BILAN_TYPE_LABELS: Record<Bilan['type'], string> = {
  initial: 'Initial',
  intermediaire: 'Intermédiaire',
  final: 'Final',
}

const DOCUMENT_TYPE_LABELS: Record<Document['type'], string> = {
  cv: 'CV',
  lettre_motivation: 'Lettre de motivation',
  synthese: 'Synthèse',
  attestation: 'Attestation',
  autre: 'Autre',
}

const TABS = [
  { id: 'infos', label: 'Informations personnelles' },
  { id: 'bilans', label: 'Bilans' },
  { id: 'documents', label: 'Documents' },
]

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
  return row.id.slice(0, 8) + '…'
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
  return row.consultant_id.slice(0, 8) + '…'
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---------------------------------------------------------------------------
// Bilan columns
// ---------------------------------------------------------------------------

const bilanColumns: ColumnDef<Bilan>[] = [
  {
    key: 'type',
    header: 'Type',
    render: (row) => (
      <span className="font-medium text-[var(--color-text)]">
        {BILAN_TYPE_LABELS[row.type]}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'statut',
    header: 'Statut',
    render: (row) => (
      <StatusBadge status={row.statut} statusConfig={BILAN_STATUT_CONFIG} />
    ),
    sortable: true,
  },
  {
    key: 'date_debut',
    header: 'Date de début',
    render: (row) => (
      <span className="text-[var(--color-text-secondary)]">
        {formatDate(row.date_debut)}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'date_fin',
    header: 'Date de fin',
    render: (row) => (
      <span className="text-[var(--color-text-secondary)]">
        {formatDate(row.date_fin)}
      </span>
    ),
    sortable: true,
  },
  {
    key: 'created_at',
    header: 'Création',
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

export default function BeneficiaireDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user } = useAuth()

  const [beneficiaire, setBeneficiaire] = useState<Beneficiaire | null>(null)
  const [bilans, setBilans] = useState<Bilan[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('infos')
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)

  const canEdit = user?.role === 'consultant' || user?.role === 'super_admin'

  // --- Fetch beneficiaire ---

  useEffect(() => {
    if (!params.id) return

    const controller = new AbortController()

    async function fetchData() {
      setIsLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const res = await fetch(`/api/beneficiaires/${params.id}`, {
          signal: controller.signal,
        })

        if (res.status === 404) {
          setNotFound(true)
          return
        }

        if (!res.ok) {
          throw new Error(
            `Erreur lors du chargement du bénéficiaire (${res.status})`,
          )
        }

        const data: Beneficiaire = await res.json()
        setBeneficiaire(data)
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

    fetchData()

    return () => {
      controller.abort()
    }
  }, [params.id])

  // --- Fetch bilans ---

  useEffect(() => {
    if (!params.id) return

    const controller = new AbortController()

    async function fetchBilans() {
      try {
        const res = await fetch(
          `/api/bilans?beneficiaire_id=${params.id}`,
          { signal: controller.signal },
        )
        if (!res.ok) return

        const json: unknown = await res.json()
        if (Array.isArray(json)) {
          setBilans(json as Bilan[])
        } else if (
          json !== null &&
          typeof json === 'object' &&
          'data' in json &&
          Array.isArray((json as Record<string, unknown>).data)
        ) {
          setBilans((json as { data: Bilan[] }).data)
        }
      } catch {
        // Non-blocking — bilans tab will show empty
      }
    }

    fetchBilans()

    return () => {
      controller.abort()
    }
  }, [params.id])

  // --- Fetch documents ---

  useEffect(() => {
    if (!params.id) return

    const controller = new AbortController()

    async function fetchDocuments() {
      try {
        const res = await fetch(
          `/api/documents?beneficiaire_id=${params.id}`,
          { signal: controller.signal },
        )
        if (!res.ok) return

        const json: unknown = await res.json()
        if (Array.isArray(json)) {
          setDocuments(json as Document[])
        } else if (
          json !== null &&
          typeof json === 'object' &&
          'data' in json &&
          Array.isArray((json as Record<string, unknown>).data)
        ) {
          setDocuments((json as { data: Document[] }).data)
        }
      } catch {
        // Non-blocking — documents tab will show empty
      }
    }

    fetchDocuments()

    return () => {
      controller.abort()
    }
  }, [params.id])

  // --- Deactivate handler ---

  const handleDeactivate = useCallback(async () => {
    if (!beneficiaire) return

    setIsDeactivating(true)
    try {
      const res = await fetch(`/api/beneficiaires/${beneficiaire.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'abandonne' }),
      })

      if (!res.ok) {
        throw new Error('Erreur lors de la désactivation')
      }

      const updated: Beneficiaire = await res.json()
      setBeneficiaire(updated)
      setShowDeactivateModal(false)
    } catch {
      // Keep modal open on error
    } finally {
      setIsDeactivating(false)
    }
  }, [beneficiaire])

  // --- Loading ---

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // --- Not Found ---

  if (notFound) {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
          <Link
            href="/beneficiaires"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            Bénéficiaires
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Introuvable</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-text-secondary,var(--color-text))]">
              Ce bénéficiaire n&apos;existe pas ou a été supprimé.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/beneficiaires')}
            >
              Retour aux bénéficiaires
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Error ---

  if (error || !beneficiaire) {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
          <Link
            href="/beneficiaires"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            Bénéficiaires
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Erreur</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-danger)]">
              {error ?? 'Une erreur inattendue est survenue.'}
            </p>
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

  // --- Tab content ---

  function renderTabContent() {
    if (!beneficiaire) return null
    switch (activeTab) {
      case 'infos':
        return (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Informations personnelles
            </h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Nom complet
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {getBeneficiaireName(beneficiaire)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {getBeneficiaireEmail(beneficiaire)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Statut
                </dt>
                <dd className="mt-1">
                  <StatusBadge
                    status={beneficiaire.statut}
                    statusConfig={STATUT_CONFIG}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Consultant
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {getConsultantName(beneficiaire)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Date d&apos;inscription
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDate(beneficiaire.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Dernière modification
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDateTime(beneficiaire.updated_at)}
                </dd>
              </div>
              {(() => {
                const meta = beneficiaire.metadata as Record<string, unknown> | undefined
                if (!meta?.notes) return null
                return (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                      Notes
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">
                      {String(meta.notes)}
                    </dd>
                  </div>
                )
              })()}
            </dl>
          </Card>
        )

      case 'bilans':
        return (
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Bilans
              </h3>
              {canEdit && (
                <Link
                  href={`/beneficiaires/${beneficiaire.id}/bilans/nouveau`}
                >
                  <Button variant="primary" size="sm">
                    Créer un bilan
                  </Button>
                </Link>
              )}
            </div>
            {bilans.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                Aucun bilan pour ce bénéficiaire.
              </p>
            ) : (
              <DataTable<Bilan>
                columns={bilanColumns}
                data={bilans}
                paginated
                pageSize={10}
                onRowClick={(row) => router.push(`/bilans/${row.id}`)}
                emptyMessage="Aucun bilan trouvé."
              />
            )}
          </Card>
        )

      case 'documents':
        return (
          <Card padding="lg">
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Documents
            </h3>
            {documents.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
                Aucun document pour ce bénéficiaire.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--color-border-light,var(--color-border))]">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-text)]">
                        {doc.nom}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {DOCUMENT_TYPE_LABELS[doc.type]} &middot;{' '}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(doc.storage_path, '_blank')
                      }
                    >
                      Télécharger
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )

      default:
        return null
    }
  }

  // --- Render ---

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
        <Link
          href="/beneficiaires"
          className="transition-colors hover:text-[var(--color-primary)]"
        >
          Bénéficiaires
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">
          {getBeneficiaireName(beneficiaire)}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            {getBeneficiaireName(beneficiaire)}
          </h2>
          <StatusBadge
            status={beneficiaire.statut}
            statusConfig={STATUT_CONFIG}
          />
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() =>
                router.push(`/beneficiaires/${beneficiaire.id}/modifier`)
              }
            >
              Modifier
            </Button>
            <Link
              href={`/beneficiaires/${beneficiaire.id}/bilans/nouveau`}
            >
              <Button variant="outline">Créer un bilan</Button>
            </Link>
            {beneficiaire.statut !== 'abandonne' && (
              <Button
                variant="ghost"
                onClick={() => setShowDeactivateModal(true)}
                className="text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"
              >
                Désactiver
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main layout: content + sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Tabs */}
        <div>
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
          >
            {renderTabContent()}
          </Tabs>
        </div>

        {/* Right: Sidebar */}
        <aside className="space-y-4">
          <Card padding="md">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary,var(--color-text))]/60">
              Résumé
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Statut
                </dt>
                <dd className="mt-1">
                  <StatusBadge
                    status={beneficiaire.statut}
                    statusConfig={STATUT_CONFIG}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Consultant assigné
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {getConsultantName(beneficiaire)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Date d&apos;inscription
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDate(beneficiaire.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Dernière modification
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDateTime(beneficiaire.updated_at)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Bilans
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {bilans.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Documents
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {documents.length}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>

      {/* Deactivate confirmation modal */}
      <Modal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        title="Désactiver le bénéficiaire"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateModal(false)}
              disabled={isDeactivating}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/90"
            >
              {isDeactivating ? 'Désactivation…' : 'Confirmer la désactivation'}
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Êtes-vous sûr de vouloir désactiver{' '}
          <strong>{getBeneficiaireName(beneficiaire)}</strong>&nbsp;? Cette
          action changera son statut en «&nbsp;Abandonné&nbsp;».
        </p>
      </Modal>
    </div>
  )
}
