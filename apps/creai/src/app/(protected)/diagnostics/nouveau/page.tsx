'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Input, Spinner, Stepper, Textarea } from '@unanima/core'
import { StatusBadge } from '@unanima/dashboard'
import type { StatusConfig } from '@unanima/dashboard'

import type { Etablissement, Recommandation } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DiagnosticDraft {
  etablissement_id: string
  synthese: string
  observations: string
  indicateurs: IndicateurDraft[]
  recommandations: RecommandationDraft[]
}

interface IndicateurDraft {
  categorie: string
  nom: string
  valeur: string
  unite: string
}

interface RecommandationDraft {
  priorite: Recommandation['priorite']
  description: string
  echeance: string
}

const STEPS = [
  { id: 'info', label: 'Informations générales' },
  { id: 'observations', label: 'Observations' },
  { id: 'indicateurs', label: 'Indicateurs' },
  { id: 'recommandations', label: 'Recommandations' },
  { id: 'synthese', label: 'Synthèse' },
]

const PRIORITE_CONFIG: Record<string, StatusConfig> = {
  critique: { label: 'Critique', color: 'danger' },
  haute: { label: 'Haute', color: 'warning' },
  moyenne: { label: 'Moyenne', color: 'info' },
  basse: { label: 'Basse', color: 'success' },
}

const CATEGORIE_OPTIONS = [
  { value: 'qualite', label: 'Qualité' },
  { value: 'rh', label: 'Ressources humaines' },
  { value: 'financier', label: 'Financier' },
  { value: 'activite', label: 'Activité' },
  { value: 'satisfaction', label: 'Satisfaction' },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function NouveauDiagnosticPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])

  const [draft, setDraft] = useState<DiagnosticDraft>({
    etablissement_id: searchParams.get('etablissement_id') ?? '',
    synthese: '',
    observations: '',
    indicateurs: [],
    recommandations: [],
  })

  useEffect(() => {
    async function fetchEtablissements() {
      try {
        const res = await fetch('/api/etablissements?limit=100&statut=actif')
        if (res.ok) {
          const json = await res.json()
          setEtablissements(json.data ?? [])
        }
      } catch {
        // silent
      }
    }
    if (!authLoading) fetchEtablissements()
  }, [authLoading])

  const updateDraft = useCallback(
    (patch: Partial<DiagnosticDraft>) => setDraft((prev) => ({ ...prev, ...patch })),
    [],
  )

  function addIndicateur() {
    updateDraft({
      indicateurs: [
        ...draft.indicateurs,
        { categorie: 'qualite', nom: '', valeur: '', unite: '' },
      ],
    })
  }

  function removeIndicateur(idx: number) {
    updateDraft({
      indicateurs: draft.indicateurs.filter((_, i) => i !== idx),
    })
  }

  function updateIndicateur(idx: number, field: keyof IndicateurDraft, value: string) {
    const next = draft.indicateurs.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item,
    )
    updateDraft({ indicateurs: next })
  }

  function addRecommandation() {
    updateDraft({
      recommandations: [
        ...draft.recommandations,
        { priorite: 'moyenne' as const, description: '', echeance: '' },
      ],
    })
  }

  function removeRecommandation(idx: number) {
    updateDraft({
      recommandations: draft.recommandations.filter((_, i) => i !== idx),
    })
  }

  function updateRecommandation(idx: number, field: keyof RecommandationDraft, value: string) {
    const next = draft.recommandations.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item,
    )
    updateDraft({ recommandations: next })
  }

  async function handleSubmit() {
    if (!user || !draft.etablissement_id) return
    setIsSaving(true)
    setError(null)

    try {
      // 1. Create diagnostic
      const diagRes = await fetch('/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          etablissement_id: draft.etablissement_id,
          auteur_id: user.id,
          date_diagnostic: new Date().toISOString().split('T')[0],
          statut: 'en_cours',
          synthese: draft.synthese || null,
        }),
      })

      if (!diagRes.ok) throw new Error('Erreur lors de la création du diagnostic')
      const diagnostic = await diagRes.json()
      const diagnosticId = diagnostic.id ?? diagnostic.data?.id

      // 2. Create indicateurs
      for (const ind of draft.indicateurs) {
        if (!ind.nom || !ind.valeur) continue
        await fetch('/api/indicateurs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            etablissement_id: draft.etablissement_id,
            categorie: ind.categorie,
            nom: ind.nom,
            valeur: parseFloat(ind.valeur),
            unite: ind.unite || null,
            periode: new Date().toISOString().split('T')[0],
          }),
        })
      }

      // 3. Create recommandations
      for (const rec of draft.recommandations) {
        if (!rec.description) continue
        await fetch('/api/recommandations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diagnostic_id: diagnosticId,
            priorite: rec.priorite,
            description: rec.description,
            echeance: rec.echeance || null,
          }),
        })
      }

      router.push(`/diagnostics/${diagnosticId}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
      setIsSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const canProceed = currentStep === 0 ? !!draft.etablissement_id : true

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Nouveau diagnostic</h2>
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
      </div>

      <Stepper
        steps={STEPS}
        currentStep={currentStep}
        orientation="horizontal"
        onStepClick={(idx) => idx < currentStep && setCurrentStep(idx)}
      />

      <Card padding="lg">
        {/* Step 1: Informations */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              Informations générales
            </h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text)]">
                Établissement <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                value={draft.etablissement_id}
                onChange={(e) => updateDraft({ etablissement_id: e.target.value })}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
              >
                <option value="">Sélectionner un établissement</option>
                {etablissements.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom} ({e.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Observations */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Observations</h3>
            <Textarea
              label="Observations terrain"
              value={draft.observations}
              onChange={(e) => updateDraft({ observations: e.target.value })}
              maxLength={5000}
            />
          </div>
        )}

        {/* Step 3: Indicateurs */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Indicateurs</h3>
              <Button variant="outline" size="sm" onClick={addIndicateur}>
                Ajouter
              </Button>
            </div>
            {draft.indicateurs.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Aucun indicateur ajouté. Cliquez sur « Ajouter » pour en créer.
              </p>
            )}
            {draft.indicateurs.map((ind, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Indicateur {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIndicateur(idx)}
                    className="text-xs text-[var(--color-danger)] hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                      Catégorie
                    </label>
                    <select
                      value={ind.categorie}
                      onChange={(e) => updateIndicateur(idx, 'categorie', e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                    >
                      {CATEGORIE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Nom"
                    value={ind.nom}
                    onChange={(e) => updateIndicateur(idx, 'nom', e.target.value)}
                  />
                  <Input
                    label="Valeur"
                    type="number"
                    value={ind.valeur}
                    onChange={(e) => updateIndicateur(idx, 'valeur', e.target.value)}
                  />
                  <Input
                    label="Unité"
                    value={ind.unite}
                    onChange={(e) => updateIndicateur(idx, 'unite', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 4: Recommandations */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">Recommandations</h3>
              <Button variant="outline" size="sm" onClick={addRecommandation}>
                Ajouter
              </Button>
            </div>
            {draft.recommandations.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                Aucune recommandation ajoutée. Cliquez sur « Ajouter » pour en créer.
              </p>
            )}
            {draft.recommandations.map((rec, idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Recommandation {idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRecommandation(idx)}
                    className="text-xs text-[var(--color-danger)] hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-[var(--color-text-muted)]">
                      Priorité
                    </label>
                    <select
                      value={rec.priorite}
                      onChange={(e) => updateRecommandation(idx, 'priorite', e.target.value)}
                      className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)]"
                    >
                      {Object.entries(PRIORITE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                          {config.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Échéance"
                    type="date"
                    value={rec.echeance}
                    onChange={(e) => updateRecommandation(idx, 'echeance', e.target.value)}
                  />
                </div>
                <Textarea
                  label="Description"
                  value={rec.description}
                  onChange={(e) => updateRecommandation(idx, 'description', e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Synthèse */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Synthèse</h3>
            <Textarea
              label="Synthèse du diagnostic"
              value={draft.synthese}
              onChange={(e) => updateDraft({ synthese: e.target.value })}
              maxLength={5000}
            />

            {/* Preview */}
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <h4 className="mb-2 text-sm font-semibold text-[var(--color-text)]">Récapitulatif</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Établissement</dt>
                  <dd className="text-[var(--color-text)]">
                    {etablissements.find((e) => e.id === draft.etablissement_id)?.nom ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Indicateurs</dt>
                  <dd className="text-[var(--color-text)]">{draft.indicateurs.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Recommandations</dt>
                  <dd className="text-[var(--color-text)]">{draft.recommandations.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          Précédent
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            onClick={() => setCurrentStep((s) => s + 1)}
            disabled={!canProceed}
          >
            Suivant
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSaving || !draft.etablissement_id}>
            {isSaving ? 'Création...' : 'Créer le diagnostic'}
          </Button>
        )}
      </div>
    </div>
  )
}
