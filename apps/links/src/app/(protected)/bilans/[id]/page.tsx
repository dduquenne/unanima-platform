'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Card, Textarea, Button, Modal } from '@unanima/core'

const AUTOSAVE_INTERVAL_MS = 30_000 // 30 seconds
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 5_000

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase préliminaire',
  2: 'Investigation — Parcours personnel',
  3: 'Investigation — Parcours professionnel',
  4: 'Investigation — Projet professionnel',
  5: 'Conclusion',
  6: 'Suivi à 6 mois',
}

interface QuestionData {
  id: string
  text: string
  sort_order: number
}

interface ResponseData {
  question_id: string
  response_text: string | null
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

async function saveWithRetry(
  questionId: string,
  responseText: string | null,
  phaseNumber: number,
  retries = MAX_RETRIES,
): Promise<{ success: boolean; saved_at?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch('/api/phase-responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          response_text: responseText,
          phase_number: phaseNumber,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        return { success: true, saved_at: data.saved_at }
      }
    } catch {
      // Network error — retry
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
    }
  }
  return { success: false }
}

export default function PhaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const phaseNumber = Number(params.id)
  const phaseTitle = PHASE_LABELS[phaseNumber] ?? `Phase ${phaseNumber}`

  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [persistentError, setPersistentError] = useState(false)
  const [phaseStatus, setPhaseStatus] = useState<'libre' | 'en_cours' | 'validee'>('libre')
  const [showValidateModal, setShowValidateModal] = useState(false)
  const [showDevalidateModal, setShowDevalidateModal] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationToast, setValidationToast] = useState<string | null>(null)

  // Dirty state tracking per question
  const dirtyRef = useRef<Set<string>>(new Set())
  const responsesRef = useRef<Record<string, string>>({})

  // Keep ref in sync
  useEffect(() => {
    responsesRef.current = responses
  }, [responses])

  // Load questions and existing responses
  useEffect(() => {
    async function loadData() {
      if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
        setIsLoading(false)
        return
      }

      const [questRes, respRes, validRes] = await Promise.allSettled([
        fetch(`/api/questionnaires?phase_number=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/phase-responses?phase=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/phase-validations').then((r) => r.ok ? r.json() : null),
      ])

      if (questRes.status === 'fulfilled' && questRes.value?.data) {
        const quests = questRes.value.data as Array<{ id: string; questions: QuestionData[] }>
        const allQuestions = quests.flatMap((q) => q.questions ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
        setQuestions(allQuestions)
      }

      if (respRes.status === 'fulfilled' && respRes.value?.data) {
        const respMap: Record<string, string> = {}
        for (const r of respRes.value.data as ResponseData[]) {
          respMap[r.question_id] = r.response_text ?? ''
        }
        setResponses(respMap)
        responsesRef.current = respMap
      }

      if (validRes.status === 'fulfilled' && validRes.value?.data) {
        const thisPhase = (validRes.value.data as Array<{ phase_number: number; status: string }>)
          .find((v) => v.phase_number === phaseNumber)
        if (thisPhase) {
          setPhaseStatus(thisPhase.status as 'libre' | 'en_cours' | 'validee')
        }
      }

      setIsLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user, phaseNumber])

  // Autosave on 30s timer
  useEffect(() => {
    const interval = setInterval(() => {
      saveDirtyResponses()
    }, AUTOSAVE_INTERVAL_MS)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseNumber])

  const saveDirtyResponses = useCallback(async () => {
    const dirty = Array.from(dirtyRef.current)
    if (dirty.length === 0) return

    setSaveStatus('saving')
    setPersistentError(false)

    let allSucceeded = true
    for (const questionId of dirty) {
      const text = responsesRef.current[questionId] ?? null
      const result = await saveWithRetry(questionId, text, phaseNumber)
      if (result.success) {
        dirtyRef.current.delete(questionId)
        if (result.saved_at) {
          setLastSavedAt(result.saved_at)
        }
      } else {
        allSucceeded = false
      }
    }

    if (allSucceeded) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } else {
      setSaveStatus('error')
      setPersistentError(true)
    }
  }, [phaseNumber])

  const handleBlur = useCallback(
    (questionId: string) => {
      if (dirtyRef.current.has(questionId)) {
        saveDirtyResponses()
      }
    },
    [saveDirtyResponses],
  )

  const handleChange = useCallback((questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
    dirtyRef.current.add(questionId)
  }, [])

  const handleManualSave = useCallback(() => {
    // Mark all questions as dirty to force save
    questions.forEach((q) => dirtyRef.current.add(q.id))
    saveDirtyResponses()
  }, [questions, saveDirtyResponses])

  const handleValidatePhase = useCallback(async () => {
    setIsValidating(true)

    // RG-BEN-20: Step 1 — Force save all responses
    questions.forEach((q) => dirtyRef.current.add(q.id))
    await saveDirtyResponses()

    // RG-BEN-21: If save failed, abort validation
    if (dirtyRef.current.size > 0) {
      setIsValidating(false)
      setShowValidateModal(false)
      setValidationToast('Échec de la sauvegarde. Validation annulée.')
      setTimeout(() => setValidationToast(null), 5000)
      return
    }

    // Step 2 — Change status to 'validee'
    try {
      const res = await fetch('/api/phase-validations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase_number: phaseNumber, status: 'validee' }),
      })

      if (!res.ok) {
        setIsValidating(false)
        setShowValidateModal(false)
        setValidationToast('Erreur lors de la validation.')
        setTimeout(() => setValidationToast(null), 5000)
        return
      }

      setPhaseStatus('validee')
      setShowValidateModal(false)
      setIsValidating(false)

      // Step 3 — Toast + redirect
      setValidationToast(`Phase ${phaseNumber} validée !`)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch {
      setIsValidating(false)
      setShowValidateModal(false)
      setValidationToast('Erreur réseau. Validation annulée.')
      setTimeout(() => setValidationToast(null), 5000)
    }
  }, [phaseNumber, questions, saveDirtyResponses, router])

  const handleDevalidatePhase = useCallback(async () => {
    setIsValidating(true)

    try {
      const res = await fetch('/api/phase-validations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase_number: phaseNumber, status: 'en_cours' }),
      })

      if (res.ok) {
        setPhaseStatus('en_cours')
        setValidationToast('Phase dé-validée.')
        setTimeout(() => setValidationToast(null), 3000)
      }
    } catch {
      setValidationToast('Erreur réseau.')
      setTimeout(() => setValidationToast(null), 5000)
    }

    setShowDevalidateModal(false)
    setIsValidating(false)
  }, [phaseNumber])

  if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-[var(--color-danger)]">Phase invalide.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Chargement"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-[var(--color-text-secondary)]" aria-label="Fil d'Ariane">
        <button onClick={() => router.push('/dashboard')} className="hover:underline">
          Mon bilan
        </button>
        <span className="mx-2">&gt;</span>
        <span className="font-medium text-[var(--color-text)]">Phase {phaseNumber} &mdash; {phaseTitle}</span>
      </nav>

      {/* Phase header */}
      <div className="rounded-lg bg-[#1E6FC0] p-4 text-white">
        <h1 className="text-xl font-bold">Phase {phaseNumber} &mdash; {phaseTitle}</h1>
        <p className="mt-1 text-sm text-blue-100">
          {questions.length > 0
            ? `${questions.length} question${questions.length > 1 ? 's' : ''}`
            : 'Aucune question pour cette phase'}
        </p>
      </div>

      {/* Save status indicator */}
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {saveStatus === 'saving' && (
            <span className="text-[#A0AAB9]">Sauvegarde en cours...</span>
          )}
          {saveStatus === 'saved' && lastSavedAt && (
            <span className="text-[#A0AAB9]">
              Sauvegard&eacute; &agrave; {new Date(lastSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {persistentError && (
            <span className="text-[#FF6B35] font-medium">
              Erreur de sauvegarde. V&eacute;rifiez votre connexion.
            </span>
          )}
        </div>
      </div>

      {/* Questions */}
      {questions.length === 0 ? (
        <Card padding="lg">
          <p className="text-[var(--color-text-secondary)]">
            Aucune question n&apos;a encore &eacute;t&eacute; ajout&eacute;e pour cette phase.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} padding="md">
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-text)]">
                  Question {index + 1} / {questions.length}
                </span>
                <p className="mt-1 text-sm text-[var(--color-text)]">{question.text}</p>
                <Textarea
                  value={responses[question.id] ?? ''}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  onBlur={() => handleBlur(question.id)}
                  className="mt-2"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  aria-label={`Réponse à la question ${index + 1}`}
                />
              </label>
            </Card>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          onClick={handleManualSave}
          loading={saveStatus === 'saving'}
        >
          Enregistrer
        </Button>
        {phaseStatus !== 'validee' ? (
          <Button
            variant="success"
            onClick={() => setShowValidateModal(true)}
          >
            Valider la phase
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={() => setShowDevalidateModal(true)}
          >
            D&eacute;-valider
          </Button>
        )}
      </div>

      {/* Validation toast */}
      {validationToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
            validationToast.includes('Erreur') || validationToast.includes('Échec')
              ? 'bg-[#FF6B35]'
              : 'bg-[#28A745]'
          }`}
          role="status"
        >
          {validationToast}
        </div>
      )}

      {/* Validate modal */}
      <Modal
        open={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        title="Valider la phase"
        size="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowValidateModal(false)}>
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleValidatePhase}
              loading={isValidating}
            >
              Confirmer
            </Button>
          </>
        }
      >
        <p className="text-sm">
          &Ecirc;tes-vous s&ucirc;r de vouloir valider cette phase ?
          Vous pourrez toujours modifier vos r&eacute;ponses apr&egrave;s validation.
        </p>
      </Modal>

      {/* De-validate modal */}
      <Modal
        open={showDevalidateModal}
        onClose={() => setShowDevalidateModal(false)}
        title="Dé-valider la phase"
        size="sm"
        actions={
          <>
            <Button variant="ghost" onClick={() => setShowDevalidateModal(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDevalidatePhase}
              loading={isValidating}
            >
              D&eacute;-valider
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Le statut de la phase repassera &agrave; &laquo; En cours &raquo;.
          Voulez-vous continuer ?
        </p>
      </Modal>
    </div>
  )
}
