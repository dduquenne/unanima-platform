'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Modal } from '@unanima/core'
import { Check, Download, Video, ChevronRight } from 'lucide-react'
import { PHASE_LABELS, PHASE_DESCRIPTIONS, TOTAL_PHASES } from '@/config/phases.config'

const AUTOSAVE_DEBOUNCE_MS = 2000
const MAX_CHARS = 2000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 5000

interface QuestionData {
  id: string
  text: string
  sort_order: number
}

interface ResponseData {
  question_id: string
  response_text: string | null
}

interface PhaseDocumentData {
  id: string
  display_name: string
  file_type: 'pdf' | 'docx'
}

interface PhaseValidation {
  phase_number: number
  status: 'libre' | 'en_cours' | 'validee'
}

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
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

// ---------------------------------------------------------------------------
// Phase Selector Bar (horizontal)
// ---------------------------------------------------------------------------

function PhaseSelector({
  phaseNumber,
  allPhases,
  onNavigatePhase,
}: {
  phaseNumber: number
  allPhases: PhaseValidation[]
  onNavigatePhase: (phase: number) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: TOTAL_PHASES }, (_, i) => {
        const num = i + 1
        const phase = allPhases.find((p) => p.phase_number === num)
        const status = phase?.status ?? 'libre'
        const isActive = num === phaseNumber
        const label = PHASE_LABELS[num] ?? `Phase ${num}`

        let pillClass: string
        if (isActive) {
          pillClass = 'bg-[var(--color-primary)] text-white'
        } else if (status === 'validee') {
          pillClass = 'bg-[#E8F5E9] text-[#2E7D32]'
        } else {
          pillClass = 'bg-[#F5EDE8] text-[var(--color-text-muted)] opacity-60'
        }

        return (
          <button
            key={num}
            onClick={() => onNavigatePhase(num)}
            className={`inline-flex items-center gap-2 rounded-[21px] px-4 py-2 text-xs font-medium transition-all hover:opacity-100 ${pillClass}`}
          >
            {status === 'validee' && !isActive ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-success)] text-white">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white text-[var(--color-primary)]'
                    : 'bg-[var(--color-text-muted)] text-white'
                }`}
              >
                {num}
              </span>
            )}
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right Sidebar
// ---------------------------------------------------------------------------

function RightSidebar({
  phaseNumber,
  nextSession,
  documents,
  allPhases,
  onDownload,
  downloadingDocId,
}: {
  phaseNumber: number
  nextSession: SessionData | null
  documents: PhaseDocumentData[]
  allPhases: PhaseValidation[]
  onDownload: (docId: string) => void
  downloadingDocId: string | null
}) {
  const validatedCount = allPhases.filter((p) => p.status === 'validee').length
  const progressPct = Math.round((validatedCount / TOTAL_PHASES) * 100)

  return (
    <aside className="hidden w-[280px] shrink-0 space-y-4 xl:block">
      {/* Prochaine séance */}
      {nextSession && nextSession.scheduled_at && (
        <div className="overflow-hidden rounded-[16px] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
          <div className="bg-[var(--color-warning-light)] px-5 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C07030]">
              Prochaine séance
            </p>
          </div>
          <div className="p-5 pt-3">
            <p className="text-[15px] font-semibold text-[var(--color-text)]">
              {new Date(nextSession.scheduled_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}{' '}
              à{' '}
              {new Date(nextSession.scheduled_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {nextSession.visio_url && (
              <a
                href={nextSession.visio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-[17px] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
              >
                <Video className="h-3.5 w-3.5" />
                Rejoindre la visio
              </a>
            )}
          </div>
        </div>
      )}

      {/* Documents de phase */}
      {documents.length > 0 && (
        <div className="overflow-hidden rounded-[16px] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
          <div className="bg-[var(--color-warning-light)] px-5 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#C07030]">
              Documents de phase
            </p>
          </div>
          <div className="space-y-2 p-5 pt-3">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onDownload(doc.id)}
                disabled={downloadingDocId === doc.id}
                className="flex w-full items-center gap-2 text-left transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                <span className="flex h-[18px] shrink-0 items-center rounded bg-[var(--color-warning-light)] px-1.5 text-[7px] font-bold uppercase text-[var(--color-accent)]">
                  {doc.file_type === 'pdf' ? 'PDF' : 'DOC'}
                </span>
                <span className="truncate text-[13px] text-[var(--color-primary)]">
                  {doc.display_name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progression */}
      <div className="overflow-hidden rounded-[16px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]">
        <p className="text-xs font-bold uppercase tracking-wider text-[#C07030]">
          Progression
        </p>
        <p className="mt-2 text-[15px] font-semibold text-[var(--color-primary)]">
          Phase {phaseNumber} sur {TOTAL_PHASES}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-warning-light)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PhaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const phaseNumber = Number(params.id)
  const phaseLabel = PHASE_LABELS[phaseNumber] ?? `Phase ${phaseNumber}`
  const phaseDescription = PHASE_DESCRIPTIONS[phaseNumber] ?? ''

  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [persistentError, setPersistentError] = useState(false)
  const [phaseStatus, setPhaseStatus] = useState<'libre' | 'en_cours' | 'validee'>('libre')
  const [showValidateModal, setShowValidateModal] = useState(false)
  const [showDevalidateModal, setShowDevalidateModal] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationToast, setValidationToast] = useState<string | null>(null)
  const [documents, setDocuments] = useState<PhaseDocumentData[]>([])
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)
  const [allPhases, setAllPhases] = useState<PhaseValidation[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])

  const dirtyRef = useRef<Set<string>>(new Set())
  const responsesRef = useRef<Record<string, string>>({})
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    responsesRef.current = responses
  }, [responses])

  // Load data
  useEffect(() => {
    async function loadData() {
      if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
        setIsLoading(false)
        return
      }

      const [questRes, respRes, validRes, docsRes, sessionsRes] = await Promise.allSettled([
        fetch(`/api/questionnaires?phase_number=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/phase-responses?phase=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/phase-validations').then((r) => r.ok ? r.json() : null),
        fetch(`/api/documents?phase_number=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/sessions').then((r) => r.ok ? r.json() : null),
      ])

      if (questRes.status === 'fulfilled' && questRes.value?.data) {
        const quests = questRes.value.data as Array<{ id: string; questions: QuestionData[] }>
        const allQuestions = quests
          .flatMap((q) => q.questions ?? [])
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
        const validations = validRes.value.data as PhaseValidation[]
        setAllPhases(validations)
        const thisPhase = validations.find((v) => v.phase_number === phaseNumber)
        if (thisPhase) setPhaseStatus(thisPhase.status)
      }

      if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
        setDocuments(docsRes.value.data as PhaseDocumentData[])
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setSessions(sessionsRes.value.data as SessionData[])
      }

      setIsLoading(false)
    }

    if (user) loadData()
  }, [user, phaseNumber])

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
      } else {
        allSucceeded = false
      }
    }

    if (allSucceeded) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 4000)
    } else {
      setSaveStatus('error')
      setPersistentError(true)
    }
  }, [phaseNumber])

  const handleChange = useCallback(
    (questionId: string, value: string) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }))
      dirtyRef.current.add(questionId)

      // Debounced autosave
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = setTimeout(() => {
        saveDirtyResponses()
      }, AUTOSAVE_DEBOUNCE_MS)
    },
    [saveDirtyResponses],
  )

  const handleBlur = useCallback(
    (questionId: string) => {
      if (dirtyRef.current.has(questionId)) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
        saveDirtyResponses()
      }
    },
    [saveDirtyResponses],
  )

  const handleManualSave = useCallback(() => {
    questions.forEach((q) => dirtyRef.current.add(q.id))
    saveDirtyResponses()
  }, [questions, saveDirtyResponses])

  const handleValidatePhase = useCallback(async () => {
    setIsValidating(true)

    // Force save all
    questions.forEach((q) => dirtyRef.current.add(q.id))
    await saveDirtyResponses()

    if (dirtyRef.current.size > 0) {
      setIsValidating(false)
      setShowValidateModal(false)
      setValidationToast('Échec de la sauvegarde. Validation annulée.')
      setTimeout(() => setValidationToast(null), 5000)
      return
    }

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
      setAllPhases((prev) =>
        prev.map((p) =>
          p.phase_number === phaseNumber ? { ...p, status: 'validee' as const } : p,
        ),
      )
      setShowValidateModal(false)
      setIsValidating(false)

      setValidationToast(`Phase ${phaseNumber} validée !`)
      setTimeout(() => router.push('/dashboard'), 1500)
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
        setAllPhases((prev) =>
          prev.map((p) =>
            p.phase_number === phaseNumber ? { ...p, status: 'en_cours' as const } : p,
          ),
        )
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

  const handleDownloadDocument = useCallback(async (docId: string) => {
    try {
      setDownloadingDocId(docId)
      const res = await fetch(`/api/documents/${docId}/download`)
      if (!res.ok) throw new Error('Erreur de téléchargement')

      const json = await res.json()
      const { url, filename } = json.data

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      setValidationToast('Erreur lors du téléchargement du document')
      setTimeout(() => setValidationToast(null), 5000)
    } finally {
      setDownloadingDocId(null)
    }
  }, [])

  const handleNavigatePhase = useCallback(
    (phase: number) => router.push(`/bilans/${phase}`),
    [router],
  )

  const answeredCount = questions.filter(
    (q) => (responses[q.id] ?? '').trim().length > 0,
  ).length

  const nextSession =
    sessions
      .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > new Date())
      .sort(
        (a, b) =>
          new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime(),
      )[0] ?? null

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
    <div>
      {/* Phase selector bar */}
      <div className="mb-6 border-b border-[var(--color-border-light)] pb-4">
        <PhaseSelector
          phaseNumber={phaseNumber}
          allPhases={allPhases}
          onNavigatePhase={handleNavigatePhase}
        />
      </div>

      {/* 2-column layout: main + right sidebar */}
      <div className="flex gap-8">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Phase title + autosave indicator */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Phase {phaseNumber} — {phaseLabel}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {phaseDescription}
              </p>
            </div>
            {/* Autosave status pill */}
            <div className="shrink-0">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1.5 rounded-[14px] bg-[var(--color-info-light)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-primary)]">
                  <span className="h-2 w-2 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                  Sauvegarde...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1.5 rounded-[14px] bg-[#E8F5E9] px-3 py-1.5 text-[11px] font-medium text-[#2E7D32]">
                  <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[var(--color-success)]">
                    <Check className="h-1.5 w-1.5 text-white" />
                  </span>
                  Tout est sauvé !
                </span>
              )}
              {persistentError && (
                <span className="inline-flex items-center gap-1.5 rounded-[14px] bg-[var(--color-danger-light)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-danger)]">
                  Erreur de sauvegarde
                </span>
              )}
            </div>
          </div>

          {/* Questions */}
          {questions.length === 0 ? (
            <div className="rounded-[16px] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[var(--color-text-muted)]">
                Aucune question n&apos;a encore été ajoutée pour cette phase.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {questions.map((question, index) => {
                const charCount = (responses[question.id] ?? '').length

                return (
                  <div
                    key={question.id}
                    className="rounded-[16px] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-md)]"
                  >
                    {/* Question header */}
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-warning-light)] text-[15px] font-bold text-[var(--color-accent)]">
                        {index + 1}
                      </span>
                      <p className="text-[15px] font-semibold text-[var(--color-text)]">
                        {question.text}
                      </p>
                    </div>

                    {/* Textarea */}
                    <textarea
                      value={responses[question.id] ?? ''}
                      onChange={(e) => handleChange(question.id, e.target.value)}
                      onBlur={() => handleBlur(question.id)}
                      maxLength={MAX_CHARS}
                      placeholder="Prenez le temps de réfléchir... Exprimez-vous librement."
                      className="w-full resize-y rounded-[16px] border border-[var(--color-border-light)] bg-[#FFFBF8] p-4 text-sm text-[var(--color-text)] placeholder:italic placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      style={{ minHeight: '120px' }}
                      aria-label={`Réponse à la question ${index + 1}`}
                    />

                    {/* Character count */}
                    <p className="mt-1.5 text-right text-[11px] text-[var(--color-text-muted)]">
                      {charCount} / {MAX_CHARS} caractères
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Action buttons */}
          {questions.length > 0 && (
            <div className="flex items-center justify-end gap-3 pb-6">
              <button
                onClick={handleManualSave}
                disabled={saveStatus === 'saving'}
                className="rounded-[22px] border-[1.5px] border-[var(--color-primary)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-info-light)] disabled:opacity-50"
              >
                Enregistrer
              </button>
              {phaseStatus !== 'validee' ? (
                <button
                  onClick={() => setShowValidateModal(true)}
                  className="rounded-[22px] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                >
                  Valider la phase
                </button>
              ) : (
                <button
                  onClick={() => setShowDevalidateModal(true)}
                  className="rounded-[22px] bg-[var(--color-danger)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-danger)]/90"
                >
                  Dé-valider
                </button>
              )}
            </div>
          )}

          {questions.length > 0 && (
            <p className="text-center text-[10px] italic text-[var(--color-text-muted)]">
              La validation soumet vos réponses à votre consultante
            </p>
          )}
        </div>

        {/* Right sidebar (desktop) */}
        <RightSidebar
          phaseNumber={phaseNumber}
          nextSession={nextSession}
          documents={documents}
          allPhases={allPhases}
          onDownload={handleDownloadDocument}
          downloadingDocId={downloadingDocId}
        />
      </div>

      {/* Validation toast */}
      {validationToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-[var(--radius-md)] px-4 py-3 text-sm font-medium text-white shadow-lg ${
            validationToast.includes('Erreur') || validationToast.includes('Échec')
              ? 'bg-[var(--color-warning)]'
              : 'bg-[var(--color-success)]'
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
            <button
              onClick={() => setShowValidateModal(false)}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Annuler
            </button>
            <button
              onClick={handleValidatePhase}
              disabled={isValidating}
              className="rounded-[var(--radius-md)] bg-[var(--color-success)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-success)]/90 disabled:opacity-50"
            >
              {isValidating ? 'Validation...' : 'Confirmer'}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Êtes-vous sûr de vouloir valider cette phase ? Vous pourrez toujours
          modifier vos réponses après validation.
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
            <button
              onClick={() => setShowDevalidateModal(false)}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Annuler
            </button>
            <button
              onClick={handleDevalidatePhase}
              disabled={isValidating}
              className="rounded-[var(--radius-md)] bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-danger)]/90 disabled:opacity-50"
            >
              {isValidating ? 'En cours...' : 'Dé-valider'}
            </button>
          </>
        }
      >
        <p className="text-sm">
          Le statut de la phase repassera à « En cours ». Voulez-vous continuer ?
        </p>
      </Modal>
    </div>
  )
}
