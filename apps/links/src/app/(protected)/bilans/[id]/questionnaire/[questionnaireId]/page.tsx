'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Button, Card, Input, Spinner, Stepper, Textarea } from '@unanima/core'
import { useDebounce } from '@unanima/core'
import { ProgressBar } from '@unanima/dashboard'

import type { Bilan, Question, Response as QuestionResponse } from '@/lib/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionnaireWithQuestions {
  id: string
  titre: string
  description: string | null
  version: number
  is_active: boolean
  created_at: string
  questions: Question[]
}

// ---------------------------------------------------------------------------
// Question renderers
// ---------------------------------------------------------------------------

interface QuestionFieldProps {
  question: Question
  value: unknown
  onChange: (value: unknown) => void
}

function TextQuestion({ question, value, onChange }: QuestionFieldProps) {
  return (
    <Input
      label={question.texte}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      required={question.required}
    />
  )
}

function TextareaQuestion({ question, value, onChange }: QuestionFieldProps) {
  return (
    <Textarea
      label={question.texte}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value)}
      required={question.required}
      maxLength={2000}
    />
  )
}

function SelectQuestion({ question, value, onChange }: QuestionFieldProps) {
  const options = question.options as string[]
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[var(--color-text)]">
        {question.texte}
        {question.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </label>
      <select
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
      >
        <option value="">Sélectionner...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

function RadioQuestion({ question, value, onChange }: QuestionFieldProps) {
  const options = question.options as string[]
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[var(--color-text)]">
        {question.texte}
        {question.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </legend>
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm transition-colors hover:bg-[var(--color-background)]"
        >
          <input
            type="radio"
            name={question.id}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          <span className="text-[var(--color-text)]">{opt}</span>
        </label>
      ))}
    </fieldset>
  )
}

function CheckboxQuestion({ question, value, onChange }: QuestionFieldProps) {
  const options = question.options as string[]
  const selected = Array.isArray(value) ? (value as string[]) : []

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((v) => v !== opt)
      : [...selected, opt]
    onChange(next)
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[var(--color-text)]">
        {question.texte}
        {question.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </legend>
      {options.map((opt) => (
        <label
          key={opt}
          className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm transition-colors hover:bg-[var(--color-background)]"
        >
          <input
            type="checkbox"
            value={opt}
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="h-4 w-4 rounded accent-[var(--color-primary)]"
          />
          <span className="text-[var(--color-text)]">{opt}</span>
        </label>
      ))}
    </fieldset>
  )
}

function MultiselectQuestion({ question, value, onChange }: QuestionFieldProps) {
  return <CheckboxQuestion question={question} value={value} onChange={onChange} />
}

function ScaleQuestion({ question, value, onChange }: QuestionFieldProps) {
  const options = question.options as unknown[]
  const min = typeof options[0] === 'number' ? options[0] : 1
  const max = typeof options[1] === 'number' ? options[1] : 10
  const currentValue = typeof value === 'number' ? value : min

  const points = useMemo(() => {
    const arr: number[] = []
    for (let i = min; i <= max; i++) arr.push(i)
    return arr
  }, [min, max])

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--color-text)]">
        {question.texte}
        {question.required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(point)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
              currentValue === point
                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10'
            }`}
          >
            {point}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

const QUESTION_RENDERERS: Record<Question['type'], React.FC<QuestionFieldProps>> = {
  text: TextQuestion,
  textarea: TextareaQuestion,
  select: SelectQuestion,
  multiselect: MultiselectQuestion,
  radio: RadioQuestion,
  checkbox: CheckboxQuestion,
  scale: ScaleQuestion,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isQuestionAnswered(question: Question, value: unknown): boolean {
  if (!question.required) return true
  if (value === null || value === undefined) return false
  if (typeof value === 'string' && value.trim() === '') return false
  if (Array.isArray(value) && value.length === 0) return false
  return true
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function QuestionnairePage() {
  const router = useRouter()
  const params = useParams<{ id: string; questionnaireId: string }>()
  const { user, isLoading: authLoading } = useAuth()

  const [bilan, setBilan] = useState<Bilan | null>(null)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null)
  const [existingResponses, setExistingResponses] = useState<QuestionResponse[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const debouncedAnswers = useDebounce(answers, 1500)
  const lastSavedRef = useRef<string>('')

  // --- Data fetching ---

  useEffect(() => {
    if (authLoading || !params.id || !params.questionnaireId) return

    const controller = new AbortController()

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [bilanRes, questionnaireRes, responsesRes] = await Promise.all([
          fetch(`/api/bilans/${params.id}`, { signal: controller.signal }),
          fetch(`/api/questionnaires/${params.questionnaireId}`, { signal: controller.signal }),
          fetch(`/api/responses?bilan_id=${params.id}&limit=100`, { signal: controller.signal }),
        ])

        if (!bilanRes.ok || !questionnaireRes.ok) {
          throw new Error('Erreur lors du chargement des données')
        }

        const bilanData: Bilan = await bilanRes.json()
        const questionnaireData: QuestionnaireWithQuestions = await questionnaireRes.json()
        const responsesData = await responsesRes.json()

        setBilan(bilanData)
        setQuestionnaire(questionnaireData)

        const responses: QuestionResponse[] = responsesData.data ?? []
        setExistingResponses(responses)

        const initialAnswers: Record<string, unknown> = {}
        for (const response of responses) {
          initialAnswers[response.question_id] = response.valeur
        }
        setAnswers(initialAnswers)
        lastSavedRef.current = JSON.stringify(initialAnswers)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [authLoading, params.id, params.questionnaireId])

  // --- Auto-save on debounced answers change ---

  const saveAnswers = useCallback(
    async (answersToSave: Record<string, unknown>) => {
      if (!params.id || !questionnaire) return

      const serialized = JSON.stringify(answersToSave)
      if (serialized === lastSavedRef.current) return

      setSaveStatus('saving')

      try {
        for (const [questionId, value] of Object.entries(answersToSave)) {
          if (value === null || value === undefined) continue

          const existing = existingResponses.find((r) => r.question_id === questionId)
          if (existing) {
            await fetch(`/api/responses/${existing.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ valeur: value }),
            })
          } else {
            const res = await fetch('/api/responses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bilan_id: params.id,
                question_id: questionId,
                valeur: value,
              }),
            })
            if (res.ok) {
              const newResponse: QuestionResponse = await res.json()
              setExistingResponses((prev) => [...prev, newResponse])
            }
          }
        }

        lastSavedRef.current = serialized
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    },
    [params.id, questionnaire, existingResponses],
  )

  useEffect(() => {
    saveAnswers(debouncedAnswers)
  }, [debouncedAnswers, saveAnswers])

  // --- Event handlers ---

  const questions = questionnaire?.questions ?? []
  const currentQuestion = questions[currentStep]

  function setAnswer(questionId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function goNext() {
    if (currentStep < questions.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      setShowSummary(true)
    }
  }

  function goPrev() {
    if (showSummary) {
      setShowSummary(false)
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  async function handleSubmit() {
    setIsSaving(true)
    try {
      await saveAnswers(answers)
      router.push(`/bilans/${params.id}`)
    } catch {
      setIsSaving(false)
    }
  }

  const answeredCount = questions.filter((q) =>
    isQuestionAnswered(q, answers[q.id]),
  ).length
  const requiredUnanswered = questions.filter(
    (q) => q.required && !isQuestionAnswered(q, answers[q.id]),
  )
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0

  // --- Loading ---

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // --- Error ---

  if (error || !questionnaire || !bilan) {
    return (
      <div className="space-y-6">
        <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
          <Link href="/bilans" className="transition-colors hover:text-[var(--color-primary)]">
            Bilans
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--color-text)]">Erreur</span>
        </nav>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-danger)]">
              {error ?? 'Une erreur inattendue est survenue.'}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Summary view ---

  if (showSummary) {
    return (
      <div className="space-y-6">
        <Breadcrumb bilanId={params.id} questionnaireTitre={questionnaire.titre} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            Récapitulatif des réponses
          </h2>
          <SaveIndicator status={saveStatus} />
        </div>

        <ProgressBar
          value={progressPercent}
          label={`${answeredCount}/${questions.length} questions`}
          showPercentage
          color="primary"
        />

        <Card padding="lg">
          <div className="divide-y divide-[var(--color-border)]">
            {questions.map((question, idx) => {
              const val = answers[question.id]
              const answered = isQuestionAnswered(question, val)
              return (
                <div key={question.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {idx + 1}. {question.texte}
                        {question.required && (
                          <span className="ml-1 text-[var(--color-danger)]">*</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary,var(--color-text))]">
                        {answered ? formatAnswer(val) : 'Non répondu'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSummary(false)
                        setCurrentStep(idx)
                      }}
                      className="shrink-0 text-sm text-[var(--color-primary)] hover:underline"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {requiredUnanswered.length > 0 && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
            <p className="text-sm font-medium text-[var(--color-warning)]">
              {requiredUnanswered.length} question(s) obligatoire(s) sans réponse
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goPrev}>
            Retour aux questions
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requiredUnanswered.length > 0 || isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Valider et terminer'}
          </Button>
        </div>
      </div>
    )
  }

  // --- Question view ---

  const Renderer = currentQuestion ? QUESTION_RENDERERS[currentQuestion.type] : null
  const isCurrentAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion, answers[currentQuestion.id])
    : false
  const canProceed = !currentQuestion?.required || isCurrentAnswered

  const stepperSteps = questions.map((q, idx) => ({
    id: q.id,
    label: `Question ${idx + 1}`,
  }))

  return (
    <div className="space-y-6">
      <Breadcrumb bilanId={params.id} questionnaireTitre={questionnaire.titre} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text)]">
            {questionnaire.titre}
          </h2>
          {questionnaire.description && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary,var(--color-text))]">
              {questionnaire.description}
            </p>
          )}
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      <ProgressBar
        value={progressPercent}
        label={`${answeredCount}/${questions.length} questions`}
        showPercentage
        color="primary"
      />

      {questions.length > 1 && (
        <Stepper
          steps={stepperSteps}
          currentStep={currentStep}
          onStepClick={(idx) => setCurrentStep(idx)}
        />
      )}

      {currentQuestion && Renderer && (
        <Card padding="lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
              <span>
                Question {currentStep + 1} sur {questions.length}
              </span>
              {currentQuestion.required && (
                <span className="text-[var(--color-danger)]">Obligatoire</span>
              )}
            </div>

            <Renderer
              question={currentQuestion}
              value={answers[currentQuestion.id]}
              onChange={(value) => setAnswer(currentQuestion.id, value)}
            />
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          Précédent
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(`/bilans/${params.id}`)}>
            Enregistrer et quitter
          </Button>
          <Button onClick={goNext} disabled={!canProceed}>
            {currentStep < questions.length - 1 ? 'Suivant' : 'Voir le récapitulatif'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Breadcrumb({ bilanId, questionnaireTitre }: { bilanId: string; questionnaireTitre: string }) {
  return (
    <nav className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
      <Link href="/bilans" className="transition-colors hover:text-[var(--color-primary)]">
        Bilans
      </Link>
      <span className="mx-2">/</span>
      <Link
        href={`/bilans/${bilanId}`}
        className="transition-colors hover:text-[var(--color-primary)]"
      >
        Bilan
      </Link>
      <span className="mx-2">/</span>
      <span className="text-[var(--color-text)]">{questionnaireTitre}</span>
    </nav>
  )
}

function SaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' }) {
  if (status === 'idle') return null
  return (
    <span
      className={`text-xs ${
        status === 'saving'
          ? 'text-[var(--color-text-muted)]'
          : 'text-[var(--color-success)]'
      }`}
    >
      {status === 'saving' ? 'Sauvegarde...' : 'Sauvegardé'}
    </span>
  )
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  return String(value)
}
