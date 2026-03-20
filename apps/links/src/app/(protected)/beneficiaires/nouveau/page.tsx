'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button, Card, Input, Textarea } from '@unanima/core'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormErrors {
  full_name?: string
  email?: string
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NouveauBeneficiairePage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState<'actif' | 'en_pause'>('actif')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // --- Validation ---

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) {
      newErrors.full_name = 'Le nom complet est requis.'
    }

    if (!email.trim()) {
      newErrors.email = "L'adresse email est requise."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "L'adresse email n'est pas valide."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // --- Submit ---

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/beneficiaires', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut,
          metadata: {
            full_name: fullName.trim(),
            email: email.trim(),
            notes: notes.trim() || undefined,
          },
        }),
      })

      if (!res.ok) {
        throw new Error(
          `Erreur lors de la création du bénéficiaire (${res.status})`,
        )
      }

      const created = (await res.json()) as { id: string }
      router.push(`/beneficiaires/${created.id}`)
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Une erreur inattendue est survenue.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
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
        <span className="text-[var(--color-text)]">Nouveau</span>
      </nav>

      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Nouveau bénéficiaire
      </h2>

      <Card padding="lg" className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom complet */}
          <Input
            label="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jean Dupont"
            required
            error={errors.full_name}
          />

          {/* Email */}
          <Input
            label="Email"
            variant="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jean.dupont@exemple.fr"
            required
            error={errors.email}
          />

          {/* Statut */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="statut"
              className="text-sm font-medium text-[var(--color-text)]"
            >
              Statut
            </label>
            <select
              id="statut"
              value={statut}
              onChange={(e) =>
                setStatut(e.target.value as 'actif' | 'en_pause')
              }
              className="w-full rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] bg-[var(--color-surface,#fff)] px-3 py-2.5 text-[var(--color-text)] transition-all duration-150 ease-out focus:border-[var(--color-border-focus,var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,var(--color-primary))]/30"
            >
              <option value="actif">Actif</option>
              <option value="en_pause">En pause</option>
            </select>
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes ou commentaires sur le bénéficiaire…"
            maxLength={2000}
            showCount
          />

          {/* Submit error */}
          {submitError && (
            <p className="text-sm text-[var(--color-danger)]" role="alert">
              {submitError}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-[var(--color-border-light,var(--color-border))] pt-5">
            <Button
              variant="primary"
              disabled={isSubmitting}
              onClick={() => undefined}
            >
              {isSubmitting ? 'Création en cours…' : 'Créer le bénéficiaire'}
            </Button>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push('/beneficiaires')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
