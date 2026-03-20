'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Card, Input, Spinner, Textarea } from '@unanima/core'

import type { Etablissement } from '@/lib/types'

const TYPE_OPTIONS: { value: Etablissement['type']; label: string }[] = [
  { value: 'ehpad', label: 'EHPAD' },
  { value: 'ime', label: 'IME' },
  { value: 'esat', label: 'ESAT' },
  { value: 'mecs', label: 'MECS' },
  { value: 'savs', label: 'SAVS' },
  { value: 'sessad', label: 'SESSAD' },
  { value: 'foyer', label: 'Foyer' },
  { value: 'autre', label: 'Autre' },
]

interface FormData {
  nom: string
  type: Etablissement['type']
  adresse: string
  siret: string
  capacite: string
  notes: string
}

const INITIAL_FORM: FormData = {
  nom: '',
  type: 'ehpad',
  adresse: '',
  siret: '',
  capacite: '',
  notes: '',
}

export default function NouvelEtablissementPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const payload: Record<string, unknown> = {
        nom: form.nom.trim(),
        type: form.type,
        adresse: form.adresse.trim() || null,
        siret: form.siret.trim() || null,
        capacite: form.capacite ? Number(form.capacite) : null,
        metadata: form.notes.trim() ? { notes: form.notes.trim() } : {},
      }

      const response = await fetch('/api/etablissements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string
        }
        throw new Error(
          data.message ?? 'Erreur lors de la création de l\u2019établissement.'
        )
      }

      const data = (await response.json()) as { etablissement: Etablissement }
      router.push(`/etablissements/${data.etablissement.id}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
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
        <span style={{ color: 'var(--color-text)' }}>Nouveau</span>
      </nav>

      <h2
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text)' }}
      >
        Nouvel établissement
      </h2>

      <Card padding="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom */}
          <div>
            <label
              htmlFor="nom"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Nom <span style={{ color: 'var(--color-danger, #dc2626)' }}>*</span>
            </label>
            <Input
              id="nom"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Nom de l'établissement"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Type <span style={{ color: 'var(--color-danger, #dc2626)' }}>*</span>
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full rounded border px-3 py-2 text-sm"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-background)',
              }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adresse */}
          <div>
            <label
              htmlFor="adresse"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Adresse
            </label>
            <Input
              id="adresse"
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              placeholder="Adresse de l'établissement"
            />
          </div>

          {/* SIRET */}
          <div>
            <label
              htmlFor="siret"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              SIRET
            </label>
            <Input
              id="siret"
              name="siret"
              value={form.siret}
              onChange={handleChange}
              placeholder="Numéro SIRET"
            />
          </div>

          {/* Capacité */}
          <div>
            <label
              htmlFor="capacite"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Capacité
            </label>
            <Input
              id="capacite"
              name="capacite"
              type="number"
              value={form.capacite}
              onChange={handleChange}
              placeholder="Nombre de places"
              min="0"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="mb-1 block text-sm font-medium"
              style={{ color: 'var(--color-text)' }}
            >
              Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Notes ou informations complémentaires"
              rows={4}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-sm"
              style={{ color: 'var(--color-danger, #dc2626)' }}
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Création en cours...
                </span>
              ) : (
                'Créer l\u2019établissement'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/etablissements')}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
