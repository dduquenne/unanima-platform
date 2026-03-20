'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Modal, Spinner } from '@unanima/core'
import { ProgressBar, StatusBadge } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'

import type { Bilan } from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<Bilan['type'], string> = {
  initial: 'Initial',
  intermediaire: 'Intermédiaire',
  final: 'Final',
}

const STATUT_CONFIG: Record<Bilan['statut'], StatusConfig> = {
  brouillon: { label: 'Brouillon', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  termine: { label: 'Terminé', color: 'success' },
  valide: { label: 'Validé', color: 'primary' },
}

const STATUT_PROGRESS: Record<Bilan['statut'], number> = {
  brouillon: 25,
  en_cours: 50,
  termine: 75,
  valide: 100,
}

const STATUT_PROGRESS_COLOR: Record<Bilan['statut'], 'warning' | 'primary' | 'success'> = {
  brouillon: 'warning',
  en_cours: 'primary',
  termine: 'success',
  valide: 'success',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
// Page
// ---------------------------------------------------------------------------

export default function BilanDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [bilan, setBilan] = useState<Bilan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const canEdit =
    user?.role === 'consultant' || user?.role === 'super_admin'

  useEffect(() => {
    if (authLoading || !params.id) return

    const controller = new AbortController()

    async function fetchBilan() {
      setIsLoading(true)
      setError(null)
      setNotFound(false)

      try {
        const res = await fetch(`/api/bilans/${params.id}`, {
          signal: controller.signal,
        })

        if (res.status === 404) {
          setNotFound(true)
          return
        }

        if (!res.ok) {
          throw new Error(
            `Erreur lors du chargement du bilan (${res.status})`,
          )
        }

        const data: Bilan = await res.json()
        setBilan(data)
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

    fetchBilan()

    return () => {
      controller.abort()
    }
  }, [authLoading, params.id])

  // --- Loading ---

  if (authLoading || isLoading) {
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
            href="/bilans"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            Bilans
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Introuvable</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-text-secondary,var(--color-text))]">
              Ce bilan n&apos;existe pas ou a été supprimé.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/bilans')}
            >
              Retour aux bilans
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Error ---

  if (error || !bilan) {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
          <Link
            href="/bilans"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            Bilans
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

  // --- Render ---

  const progress = STATUT_PROGRESS[bilan.statut]
  const progressColor = STATUT_PROGRESS_COLOR[bilan.statut]

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <div className="space-y-4">
        <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
          <Link
            href="/bilans"
            className="transition-colors hover:text-[var(--color-primary)]"
          >
            Bilans
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">
            Bilan {TYPE_LABELS[bilan.type]}
          </span>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">
              Bilan {TYPE_LABELS[bilan.type]}
            </h2>
            <StatusBadge status={bilan.statut} statusConfig={STATUT_CONFIG} />
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button onClick={() => setShowStatusModal(true)}>
                Modifier le statut
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push('/bilans')}
            >
              Retour aux bilans
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <Card padding="lg">
        <div className="space-y-6">
          {/* Informations générales */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Informations générales
            </h3>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Type */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Type
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {TYPE_LABELS[bilan.type]}
                </dd>
              </div>

              {/* Bénéficiaire */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Bénéficiaire
                </dt>
                <dd className="mt-1 text-sm">
                  <Link
                    href={`/beneficiaires/${bilan.beneficiaire_id}`}
                    className="text-[var(--color-primary)] underline-offset-2 transition-colors hover:text-[var(--color-primary-dark)] hover:underline"
                  >
                    {bilan.beneficiaire_id.slice(0, 8)}…
                  </Link>
                </dd>
              </div>

              {/* Statut */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Statut
                </dt>
                <dd className="mt-1">
                  <StatusBadge
                    status={bilan.statut}
                    statusConfig={STATUT_CONFIG}
                  />
                </dd>
              </div>

              {/* Date de début */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Date de début
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDate(bilan.date_debut)}
                </dd>
              </div>

              {/* Date de fin */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Date de fin
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDate(bilan.date_fin)}
                </dd>
              </div>

              {/* Création */}
              <div>
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Création
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDateTime(bilan.created_at)}
                </dd>
              </div>

              {/* Dernière modification */}
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-[var(--color-text-secondary,var(--color-text))]/60">
                  Dernière modification
                </dt>
                <dd className="mt-1 text-sm text-[var(--color-text)]">
                  {formatDateTime(bilan.updated_at)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Progression */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Progression globale
            </h3>
            <ProgressBar
              value={progress}
              label={STATUT_CONFIG[bilan.statut].label}
              showPercentage
              color={progressColor}
              animated
            />
          </section>
        </div>
      </Card>

      {/* Status change modal */}
      {showStatusModal && (
        <Modal
          open
          title="Modifier le statut"
          onClose={() => setShowStatusModal(false)}
        >
          <div className="space-y-3">
            {(
              Object.entries(STATUT_CONFIG) as [Bilan['statut'], StatusConfig][]
            ).map(([key, config]) => (
              <button
                key={key}
                type="button"
                disabled={key === bilan.statut}
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/bilans/${bilan.id}`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ statut: key }),
                    })
                    if (!res.ok) {
                      throw new Error('Erreur lors de la mise à jour')
                    }
                    const updated: Bilan = await res.json()
                    setBilan(updated)
                    setShowStatusModal(false)
                  } catch {
                    // Keep modal open on error — user can retry
                  }
                }}
                className={`
                  flex w-full items-center gap-3 rounded-[var(--radius-md,0.5rem)] border
                  border-[var(--color-border)] px-4 py-3 text-left text-sm
                  transition-colors
                  ${
                    key === bilan.statut
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-[var(--color-background)]'
                  }
                `}
              >
                <StatusBadge status={key} statusConfig={STATUT_CONFIG} />
                <span className="text-[var(--color-text)]">
                  {config.label}
                </span>
                {key === bilan.statut && (
                  <span className="ml-auto text-xs text-[var(--color-text-secondary,var(--color-text))]/60">
                    Statut actuel
                  </span>
                )}
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  )
}
