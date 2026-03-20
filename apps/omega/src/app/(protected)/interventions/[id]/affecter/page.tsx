'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner, Textarea } from '@unanima/core'
import { StatusBadge } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'

import type { Intervention } from '@/lib/types'

const STATUT_CONFIG: Record<string, StatusConfig> = {
  planifiee: { label: 'Planifiée', color: 'info' },
  en_cours: { label: 'En cours', color: 'warning' },
  en_attente_pieces: { label: 'Attente pièces', color: 'danger' },
  terminee: { label: 'Terminée', color: 'success' },
  annulee: { label: 'Annulée', color: 'danger' },
}

interface Technicien {
  id: string
  full_name: string
  role: string
}

export default function AffecterPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [intervention, setIntervention] = useState<Intervention | null>(null)
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [selectedTechnicien, setSelectedTechnicien] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canAffect = user?.role === 'admin' || user?.role === 'responsable_sav'

  useEffect(() => {
    if (authLoading || !params.id) return

    async function fetchData() {
      setIsLoading(true)
      try {
        const [intRes] = await Promise.all([
          fetch(`/api/interventions/${params.id}`),
        ])

        if (intRes.ok) {
          const data = await intRes.json()
          setIntervention(data.data ?? data)
        }

        // Mock techniciens list (in production, fetch from profiles where role = 'technicien')
        setTechniciens([
          { id: 'tech-001', full_name: 'Jean Dupont', role: 'technicien' },
          { id: 'tech-002', full_name: 'Marie Martin', role: 'technicien' },
          { id: 'tech-003', full_name: 'Pierre Durand', role: 'technicien' },
        ])
      } catch {
        setError('Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [authLoading, params.id])

  async function handleSubmit() {
    if (!user || !selectedTechnicien || !params.id) return
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Create affectation
      const affRes = await fetch('/api/affectations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intervention_id: params.id,
          technicien_id: selectedTechnicien,
          responsable_id: user.id,
          commentaire: commentaire || null,
        }),
      })

      if (!affRes.ok) throw new Error('Erreur lors de l\'affectation')

      // 2. Update intervention status to affectée (en_cours)
      await fetch(`/api/interventions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut: 'en_cours',
          technicien_id: selectedTechnicien,
        }),
      })

      // 3. Send notification email to technician
      try {
        const technicien = techniciens.find((t) => t.id === selectedTechnicien)
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'affectation',
            to: `${technicien?.full_name ?? 'technicien'}@omega-automotive.fr`,
            data: {
              technicienName: technicien?.full_name,
              interventionId: params.id,
              commentaire,
            },
          }),
        })
      } catch {
        // Email failure shouldn't block the affectation
      }

      setSuccess(true)
      setTimeout(() => router.push(`/interventions/${params.id}`), 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!canAffect) {
    return (
      <Card padding="lg">
        <p className="text-sm text-[var(--color-danger)]">
          Seuls les responsables SAV peuvent affecter des techniciens.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
        <Link href="/interventions" className="hover:text-[var(--color-primary)]">
          Interventions
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/interventions/${params.id}`} className="hover:text-[var(--color-primary)]">
          Intervention
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">Affecter</span>
      </nav>

      <h2 className="text-2xl font-semibold text-[var(--color-text)]">Affecter un technicien</h2>

      {intervention && (
        <Card padding="md">
          <div className="flex items-center gap-4">
            <StatusBadge status={intervention.statut} statusConfig={STATUT_CONFIG} />
            <span className="text-sm text-[var(--color-text)]">
              {intervention.type} — Priorité {intervention.priorite}
            </span>
          </div>
          {intervention.description && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{intervention.description}</p>
          )}
        </Card>
      )}

      {success ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-lg font-semibold text-[var(--color-success)]">
              Technicien affecté avec succès
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">Redirection en cours...</p>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text)]">
                Technicien <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                value={selectedTechnicien}
                onChange={(e) => setSelectedTechnicien(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
              >
                <option value="">Sélectionner un technicien</option>
                {techniciens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Commentaire (optionnel)"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              maxLength={500}
            />

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedTechnicien || isSubmitting}
              >
                {isSubmitting ? 'Affectation...' : 'Affecter'}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
