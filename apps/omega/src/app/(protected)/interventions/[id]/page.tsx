'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { StatusBadge } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'

import type { Intervention } from '@/lib/types'

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

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateId(id: string, length = 8): string {
  if (id.length <= length) return id
  return `${id.slice(0, length)}…`
}

export default function InterventionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [intervention, setIntervention] = useState<Intervention | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const canEdit =
    user?.role === 'admin' || user?.role === 'responsable_sav'

  const fetchIntervention = useCallback(async () => {
    if (!params.id) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const res = await fetch(`/api/interventions/${params.id}`)
      if (res.status === 404) {
        setNotFound(true)
        return
      }
      if (!res.ok) {
        throw new Error('Erreur lors du chargement de l\u2019intervention')
      }
      const json = await res.json()
      setIntervention(json.data ?? json)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchIntervention()
  }, [fetchIntervention])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <nav
          className="text-sm"
          style={{ color: 'var(--color-text-secondary, var(--color-text))' }}
        >
          <button
            onClick={() => router.push('/interventions')}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Interventions
          </button>
          <span className="mx-2">&gt;</span>
          <span>Introuvable</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Intervention introuvable
            </p>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              L&apos;intervention demand&eacute;e n&apos;existe pas ou a
              &eacute;t&eacute; supprim&eacute;e.
            </p>
            <Button
              onClick={() => router.push('/interventions')}
              className="mt-6"
            >
              Retour aux interventions
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <nav
          className="text-sm"
          style={{ color: 'var(--color-text-secondary, var(--color-text))' }}
        >
          <button
            onClick={() => router.push('/interventions')}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Interventions
          </button>
          <span className="mx-2">&gt;</span>
          <span>Erreur</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--color-danger, #dc2626)' }}
            >
              {error}
            </p>
            <button
              onClick={fetchIntervention}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              R&eacute;essayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!intervention) return null

  const shortId = truncateId(intervention.id)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav
        className="text-sm"
        style={{ color: 'var(--color-text-secondary, var(--color-text))' }}
      >
        <button
          onClick={() => router.push('/interventions')}
          className="hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          Interventions
        </button>
        <span className="mx-2">&gt;</span>
        <span>Intervention #{shortId}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Intervention #{shortId}
        </h2>
        <StatusBadge
          status={intervention.statut}
          statusConfig={statutConfig}
        />
        <StatusBadge
          status={intervention.priorite}
          statusConfig={prioriteConfig}
        />
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/interventions/${intervention.id}/modifier`)
              }
            >
              Modifier
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/interventions/${intervention.id}/affecter`)
              }
            >
              Affecter technicien
            </Button>
            {intervention.statut !== 'terminee' &&
              intervention.statut !== 'annulee' && (
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        `/api/interventions/${intervention.id}`,
                        {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ statut: 'terminee' }),
                        }
                      )
                      if (res.ok) {
                        fetchIntervention()
                      }
                    } catch {
                      // silently ignore
                    }
                  }}
                >
                  Terminer
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Main content */}
      <Card padding="lg">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Type */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Type
            </p>
            <p
              className="mt-1 text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              {typeLabels[intervention.type] ?? intervention.type}
            </p>
          </div>

          {/* Priorite */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Priorit&eacute;
            </p>
            <div className="mt-1">
              <StatusBadge
                status={intervention.priorite}
                statusConfig={prioriteConfig}
              />
            </div>
          </div>

          {/* Client / Vehicule */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Client / V&eacute;hicule
            </p>
            <p
              className="mt-1 text-sm"
              title={intervention.client_vehicule_id}
              style={{ color: 'var(--color-text)' }}
            >
              {truncateId(intervention.client_vehicule_id)}
            </p>
          </div>

          {/* Technicien */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Technicien
            </p>
            <p
              className="mt-1 text-sm"
              title={intervention.technicien_id ?? undefined}
              style={{
                color: intervention.technicien_id
                  ? 'var(--color-text)'
                  : 'var(--color-text-muted, var(--color-text))',
              }}
            >
              {intervention.technicien_id
                ? truncateId(intervention.technicien_id)
                : 'Non affect\u00e9'}
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Description
            </p>
            <p
              className="mt-1 whitespace-pre-wrap text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {intervention.description ?? '—'}
            </p>
          </div>

          {/* Dates */}
          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Date planifi&eacute;e
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDate(intervention.date_planifiee)}
            </p>
          </div>

          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Date de d&eacute;but
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDate(intervention.date_debut)}
            </p>
          </div>

          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Date de fin
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDate(intervention.date_fin)}
            </p>
          </div>

          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Cr&eacute;&eacute; le
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDateTime(intervention.created_at)}
            </p>
          </div>

          <div>
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted, var(--color-text))' }}
            >
              Modifi&eacute; le
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: 'var(--color-text)' }}
            >
              {formatDateTime(intervention.updated_at)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
