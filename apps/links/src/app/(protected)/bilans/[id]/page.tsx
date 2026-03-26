'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Card, Textarea, Button, Modal } from '@unanima/core'
import { FileText, Download, Calendar, Mail, Check } from 'lucide-react'
import { PHASE_LABELS, PHASE_DESCRIPTIONS, TOTAL_PHASES } from '@/config/phases.config'

const AUTOSAVE_INTERVAL_MS = 30_000 // 30 seconds
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 5_000

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
// Phase Sidebar Component (MAQ-03)
// ---------------------------------------------------------------------------

function PhaseSidebar({
  phaseNumber,
  allPhases,
  answeredCount,
  totalQuestions,
  consultantName,
  nextSession,
  onNavigatePhase,
}: {
  phaseNumber: number
  allPhases: PhaseValidation[]
  answeredCount: number
  totalQuestions: number
  consultantName: string | null
  nextSession: SessionData | null
  onNavigatePhase: (phase: number) => void
}) {
  return (
    <aside className="hidden w-52 flex-shrink-0 space-y-4 md:block">
      {/* Phase progression indicators */}
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Progression
        </h3>
        <div className="space-y-2">
          {Array.from({ length: TOTAL_PHASES }, (_, i) => {
            const num = i + 1
            const phase = allPhases.find((p) => p.phase_number === num)
            const status = phase?.status ?? 'libre'
            const isActive = num === phaseNumber
            const label = PHASE_LABELS[num] ?? `Phase ${num}`

            return (
              <button
                key={num}
                onClick={() => onNavigatePhase(num)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? 'bg-[var(--color-primary)]/10 font-semibold'
                    : 'hover:bg-[var(--color-background)]'
                }`}
              >
                {/* Status circle */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    status === 'validee'
                      ? 'bg-[var(--color-success)] text-white'
                      : isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : status === 'en_cours'
                          ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                          : 'border-2 border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {status === 'validee' ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    num
                  )}
                </span>
                <span
                  className={`truncate ${
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : status === 'validee'
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Question progress */}
      {totalQuestions > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Phase courante
          </h3>
          <p className="text-sm font-medium text-[var(--color-text)]">
            {answeredCount} / {totalQuestions} questions
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full"
            style={{ backgroundColor: 'var(--color-border)' }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round((answeredCount / totalQuestions) * 100)}%`,
                backgroundColor: 'var(--color-primary)',
              }}
            />
          </div>
        </div>
      )}

      {/* Consultant card */}
      {consultantName && (
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Ma consultante
          </h3>
          <p className="text-sm font-medium text-[var(--color-text)]">{consultantName}</p>
          <button
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white"
          >
            <Mail className="h-3.5 w-3.5" />
            Envoyer un message
          </button>
        </div>
      )}

      {/* Next appointment */}
      {nextSession && nextSession.scheduled_at && (
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-warning)', color: 'white' }}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-80">
            Prochain rendez-vous
          </h3>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <p className="text-sm font-medium">
              {new Date(nextSession.scheduled_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <p className="mt-0.5 text-xs opacity-80">
            {new Date(nextSession.scheduled_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Mobile Phase Bar (stacked above content on mobile)
// ---------------------------------------------------------------------------

function MobilePhaseBar({
  phaseNumber,
  allPhases,
  answeredCount,
  totalQuestions,
}: {
  phaseNumber: number
  allPhases: PhaseValidation[]
  answeredCount: number
  totalQuestions: number
}) {
  return (
    <div className="mb-4 space-y-3 md:hidden">
      {/* Phase indicators row */}
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: TOTAL_PHASES }, (_, i) => {
          const num = i + 1
          const phase = allPhases.find((p) => p.phase_number === num)
          const status = phase?.status ?? 'libre'
          const isActive = num === phaseNumber

          return (
            <span
              key={num}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                status === 'validee'
                  ? 'bg-[var(--color-success)] text-white'
                  : isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : status === 'en_cours'
                      ? 'border-2 border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-2 border-[var(--color-border)] text-[var(--color-text-muted)]'
              }`}
            >
              {status === 'validee' ? <Check className="h-3 w-3" /> : num}
            </span>
          )
        })}
      </div>
      {/* Question progress */}
      {totalQuestions > 0 && (
        <div className="text-center text-xs text-[var(--color-text-muted)]">
          Question {answeredCount} / {totalQuestions}
        </div>
      )}
    </div>
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
  const phaseTitle = PHASE_DESCRIPTIONS[phaseNumber] ?? `Phase ${phaseNumber}`

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
  const [documents, setDocuments] = useState<PhaseDocumentData[]>([])
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null)

  // Sidebar data
  const [allPhases, setAllPhases] = useState<PhaseValidation[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [consultantName, setConsultantName] = useState<string | null>(null)

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

      const [questRes, respRes, validRes, docsRes, sessionsRes] = await Promise.allSettled([
        fetch(`/api/questionnaires?phase_number=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch(`/api/phase-responses?phase=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/phase-validations').then((r) => r.ok ? r.json() : null),
        fetch(`/api/documents?phase_number=${phaseNumber}`).then((r) => r.ok ? r.json() : null),
        fetch('/api/sessions').then((r) => r.ok ? r.json() : null),
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
        const validations = validRes.value.data as PhaseValidation[]
        setAllPhases(validations)
        const thisPhase = validations.find((v) => v.phase_number === phaseNumber)
        if (thisPhase) {
          setPhaseStatus(thisPhase.status)
        }
      }

      if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
        setDocuments(docsRes.value.data as PhaseDocumentData[])
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setSessions(sessionsRes.value.data as SessionData[])
      }

      setIsLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user, phaseNumber])

  // Load consultant name from user metadata
  useEffect(() => {
    if (user?.metadata?.consultant_name) {
      setConsultantName(user.metadata.consultant_name as string)
    }
  }, [user])

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
      setAllPhases((prev) =>
        prev.map((p) => p.phase_number === phaseNumber ? { ...p, status: 'validee' as const } : p),
      )
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
        setAllPhases((prev) =>
          prev.map((p) => p.phase_number === phaseNumber ? { ...p, status: 'en_cours' as const } : p),
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
    (phase: number) => {
      router.push(`/bilans/${phase}`)
    },
    [router],
  )

  // Compute answered questions count
  const answeredCount = questions.filter(
    (q) => (responses[q.id] ?? '').trim().length > 0,
  ).length

  // Find next upcoming session
  const nextSession = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0] ?? null

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
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-[var(--color-text-secondary)]" aria-label="Fil d'Ariane">
        <button onClick={() => router.push('/dashboard')} className="hover:underline">
          Mon bilan
        </button>
        <span className="mx-2">{'>'}</span>
        <span className="font-medium text-[var(--color-text)]">Phase {phaseNumber} — {phaseTitle}</span>
      </nav>

      {/* Mobile phase bar (visible < md) */}
      <MobilePhaseBar
        phaseNumber={phaseNumber}
        allPhases={allPhases}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
      />

      {/* 2-column layout: sidebar + main */}
      <div className="flex gap-6">
        {/* Sidebar (desktop only) */}
        <PhaseSidebar
          phaseNumber={phaseNumber}
          allPhases={allPhases}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
          consultantName={consultantName}
          nextSession={nextSession}
          onNavigatePhase={handleNavigatePhase}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Phase header */}
          <div className="rounded-lg bg-[var(--color-primary)] p-4 text-[var(--color-text-inverse)]">
            <h1 className="text-xl font-bold">Phase {phaseNumber} — {phaseTitle}</h1>
            <p className="mt-1 text-sm text-[var(--color-primary-light)]">
              {questions.length > 0
                ? `${questions.length} question${questions.length > 1 ? 's' : ''}`
                : 'Aucune question pour cette phase'}
            </p>
          </div>

          {/* Save status indicator */}
          <div className="flex items-center justify-between">
            <div className="text-xs">
              {saveStatus === 'saving' && (
                <span className="text-[var(--color-text-muted)]">Sauvegarde en cours...</span>
              )}
              {saveStatus === 'saved' && lastSavedAt && (
                <span className="text-[var(--color-text-muted)]">
                  Sauvegardé à {new Date(lastSavedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {persistentError && (
                <span className="text-[var(--color-warning)] font-medium">
                  Erreur de sauvegarde. Vérifiez votre connexion.
                </span>
              )}
            </div>
          </div>

          {/* Questions */}
          {questions.length === 0 ? (
            <Card padding="lg">
              <p className="text-[var(--color-text-secondary)]">
                Aucune question n{"'"}a encore été ajoutée pour cette phase.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <Card key={question.id} padding="md">
                  <label className="block">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-[var(--color-text-inverse)]">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-[var(--color-text)]">
                        Question {index + 1} / {questions.length}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[var(--color-text)]">{question.text}</p>
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

          {/* Documents section — RG-BEN-27: hidden if no documents */}
          {documents.length > 0 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                <h2 className="text-base font-bold text-[var(--color-primary-dark)]">
                  Documents disponibles
                </h2>
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[#F9FAFB] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-[#6B7280]" />
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text)]">
                          {doc.display_name}
                        </p>
                        <p className="text-xs uppercase text-[#9CA3AF]">
                          {doc.file_type}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(doc.id)}
                      disabled={downloadingDocId === doc.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-50"
                    >
                      {downloadingDocId === doc.id ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
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
                Dé-valider
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Validation toast */}
      {validationToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
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
          Êtes-vous sûr de vouloir valider cette phase ?
          Vous pourrez toujours modifier vos réponses après validation.
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
              Dé-valider
            </Button>
          </>
        }
      >
        <p className="text-sm">
          Le statut de la phase repassera à « En cours ».
          Voulez-vous continuer ?
        </p>
      </Modal>
    </div>
  )
}
