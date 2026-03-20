'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, Input, Textarea } from '@unanima/core'

export default function NouvelleInterventionPage() {
  const router = useRouter()

  const [type, setType] = useState<string>('maintenance')
  const [priorite, setPriorite] = useState<string>('normale')
  const [clientVehiculeId, setClientVehiculeId] = useState('')
  const [description, setDescription] = useState('')
  const [datePlanifiee, setDatePlanifiee] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          priorite,
          client_vehicule_id: clientVehiculeId,
          description: description || null,
          date_planifiee: datePlanifiee || null,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(
          json?.message ?? 'Erreur lors de la cr\u00e9ation de l\u2019intervention'
        )
      }

      const json = await res.json()
      const created = json.data ?? json
      router.push(`/interventions/${created.id}`)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

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
        <span>Nouvelle</span>
      </nav>

      <h2
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text)' }}
      >
        Nouvelle intervention
      </h2>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div
              className="rounded-md px-4 py-3 text-sm font-medium"
              style={{
                backgroundColor: 'var(--color-danger-light, #fef2f2)',
                color: 'var(--color-danger, #dc2626)',
              }}
            >
              {error}
            </div>
          )}

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            >
              <option value="garantie">Garantie</option>
              <option value="maintenance">Maintenance</option>
              <option value="reparation">R&eacute;paration</option>
              <option value="rappel">Rappel</option>
              <option value="diagnostic">Diagnostic</option>
            </select>
          </div>

          {/* Priorite */}
          <div>
            <label
              htmlFor="priorite"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Priorit&eacute;
            </label>
            <select
              id="priorite"
              value={priorite}
              onChange={(e) => setPriorite(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              }}
            >
              <option value="critique">Critique</option>
              <option value="haute">Haute</option>
              <option value="normale">Normale</option>
              <option value="basse">Basse</option>
            </select>
          </div>

          {/* Client / Vehicule ID */}
          <div>
            <label
              htmlFor="client_vehicule_id"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Client / V&eacute;hicule (ID)
            </label>
            <Input
              id="client_vehicule_id"
              value={clientVehiculeId}
              onChange={(e) => setClientVehiculeId(e.target.value)}
              required
              placeholder="Identifiant client-v\u00e9hicule"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Description de l&apos;intervention (optionnel)"
            />
          </div>

          {/* Date planifiee */}
          <div>
            <label
              htmlFor="date_planifiee"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Date planifi&eacute;e
            </label>
            <Input
              id="date_planifiee"
              type="date"
              value={datePlanifiee}
              onChange={(e) => setDatePlanifiee(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Cr\u00e9ation en cours\u2026' : 'Cr\u00e9er l\u2019intervention'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/interventions')}
              disabled={submitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
