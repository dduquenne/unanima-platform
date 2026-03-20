'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { Button, Card, Input, Spinner, Textarea } from '@unanima/core'

import type { Beneficiaire } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormErrors {
  full_name?: string
  email?: string
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
  return row.id.slice(0, 8) + '…'
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ModifierBeneficiairePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [beneficiaire, setBeneficiaire] = useState<Beneficiaire | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [statut, setStatut] = useState<Beneficiaire['statut']>('actif')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // --- Fetch existing beneficiaire ---

  useEffect(() => {
    if (!params.id) return

    const controller = new AbortController()

    async function fetchBeneficiaire() {
      setIsLoading(true)
      setLoadError(null)
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

        // Pre-fill form fields
        const meta = data.metadata as Record<string, unknown> | undefined
        if (meta?.full_name && typeof meta.full_name === 'string') {
          setFullName(meta.full_name)
        } else if (meta?.nom && typeof meta.nom === 'string') {
          const prenom = typeof meta.prenom === 'string' ? meta.prenom : ''
          setFullName(prenom ? `${prenom} ${meta.nom}` : meta.nom)
        }
        if (meta?.email && typeof meta.email === 'string') {
          setEmail(meta.email)
        }
        if (meta?.notes && typeof meta.notes === 'string') {
          setNotes(meta.notes)
        }
        setStatut(data.statut)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message =
          err instanceof Error
            ? err.message
            : 'Une erreur inattendue est survenue.'
        setLoadError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBeneficiaire()

    return () => {
      controller.abort()
    }
  }, [params.id])

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

    if (!validate() || !beneficiaire) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch(`/api/beneficiaires/${beneficiaire.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statut,
          metadata: {
            ...(beneficiaire.metadata as Record<string, unknown>),
            full_name: fullName.trim(),
            email: email.trim(),
            notes: notes.trim() || undefined,
          },
        }),
      })

      if (!res.ok) {
        throw new Error(
          `Erreur lors de la mise à jour du bénéficiaire (${res.status})`,
        )
      }

      router.push(`/beneficiaires/${beneficiaire.id}`)
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

  // --- Load Error ---

  if (loadError || !beneficiaire) {
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
              {loadError ?? 'Une erreur inattendue est survenue.'}
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
        <Link
          href={`/beneficiaires/${beneficiaire.id}`}
          className="transition-colors hover:text-[var(--color-primary)]"
        >
          {getBeneficiaireName(beneficiaire)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">Modifier</span>
      </nav>

      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Modifier le bénéficiaire
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
                setStatut(e.target.value as Beneficiaire['statut'])
              }
              className="w-full rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] bg-[var(--color-surface,#fff)] px-3 py-2.5 text-[var(--color-text)] transition-all duration-150 ease-out focus:border-[var(--color-border-focus,var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,var(--color-primary))]/30"
            >
              <option value="actif">Actif</option>
              <option value="en_pause">En pause</option>
              <option value="termine">Terminé</option>
              <option value="abandonne">Abandonné</option>
            </select>
          </div>

          {/* Notes */}
          <Textarea
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes ou commentaires…"
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
              {isSubmitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </Button>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() =>
                router.push(`/beneficiaires/${beneficiaire.id}`)
              }
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
