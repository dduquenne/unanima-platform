'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  Save,
  Video,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
}

export interface PlanificationTabProps {
  beneficiaryId: string
  beneficiaryName: string
  sessions: SessionData[]
  onSessionsUpdated?: () => void
}

interface SessionDateEntry {
  session_number: number
  date: string
  time: string
}

interface Toast {
  type: 'success' | 'error'
  message: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_SESSIONS = 6

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isoToDateInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

function isoToTimeInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function dateTimeToIso(date: string, time: string): string | null {
  if (!date) return null
  const timePart = time || '09:00'
  return new Date(`${date}T${timePart}:00`).toISOString()
}

function isDateInFuture(date: string, time: string): boolean {
  if (!date) return true // no date set, nothing to validate
  const timePart = time || '00:00'
  const dt = new Date(`${date}T${timePart}:00`)
  return dt.getTime() > Date.now()
}

function isValidHttpsUrl(url: string): boolean {
  if (!url) return true
  return url.startsWith('https://')
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ToastNotification({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-lg px-5 py-3 shadow-lg transition-all ${
        toast.type === 'success'
          ? 'bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB]'
          : 'bg-[#F8D7DA] text-[#721C24] border border-[#F5C6CB]'
      }`}
    >
      {toast.type === 'success' ? (
        <Check className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
      >
        &times;
      </button>
    </div>
  )
}

function StatusBadgePlanification({ isPlanned }: { isPlanned: boolean }) {
  if (isPlanned) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4EDDA] px-3 py-1 text-xs font-medium text-[#28A745]">
        <Check className="h-3 w-3" />
        Planifiee
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3EE] px-3 py-1 text-xs font-medium text-[#FF6B35]">
      <AlertCircle className="h-3 w-3" />
      A planifier
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PlanificationTab({
  beneficiaryId,
  beneficiaryName,
  sessions,
  onSessionsUpdated,
}: PlanificationTabProps) {
  // ---- State ----

  const [sessionDates, setSessionDates] = useState<SessionDateEntry[]>(() =>
    initSessionDates(sessions),
  )

  const [visioUrl, setVisioUrl] = useState<string>(() => {
    const first = sessions.find((s) => s.visio_url)
    return first?.visio_url ?? ''
  })

  const [isSavingSessions, setIsSavingSessions] = useState(false)
  const [isSavingVisio, setIsSavingVisio] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({})
  const [visioError, setVisioError] = useState<string>('')

  // ---- Derived ----

  const plannedCount = useMemo(
    () => sessionDates.filter((s) => s.date !== '').length,
    [sessionDates],
  )

  // ---- Initialization helper ----

  function initSessionDates(data: SessionData[]): SessionDateEntry[] {
    const entries: SessionDateEntry[] = []
    for (let i = 1; i <= TOTAL_SESSIONS; i++) {
      const existing = data.find((s) => s.session_number === i)
      entries.push({
        session_number: i,
        date: isoToDateInput(existing?.scheduled_at ?? null),
        time: isoToTimeInput(existing?.scheduled_at ?? null),
      })
    }
    return entries
  }

  // ---- Handlers ----

  const handleDateChange = useCallback(
    (sessionNumber: number, date: string) => {
      setSessionDates((prev) =>
        prev.map((s) =>
          s.session_number === sessionNumber ? { ...s, date } : s,
        ),
      )
      // Clear validation error for this session
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[sessionNumber]
        return next
      })
    },
    [],
  )

  const handleTimeChange = useCallback(
    (sessionNumber: number, time: string) => {
      setSessionDates((prev) =>
        prev.map((s) =>
          s.session_number === sessionNumber ? { ...s, time } : s,
        ),
      )
      setValidationErrors((prev) => {
        const next = { ...prev }
        delete next[sessionNumber]
        return next
      })
    },
    [],
  )

  const validateSessions = useCallback((): boolean => {
    const errors: Record<number, string> = {}
    const originalMap = new Map<number, string | null>()
    for (const s of sessions) {
      originalMap.set(s.session_number, s.scheduled_at)
    }

    for (const entry of sessionDates) {
      if (!entry.date) continue

      const wasAlreadySet = originalMap.get(entry.session_number)
      const isUnchanged =
        wasAlreadySet &&
        isoToDateInput(wasAlreadySet) === entry.date &&
        isoToTimeInput(wasAlreadySet) === entry.time

      if (!isUnchanged && !isDateInFuture(entry.date, entry.time)) {
        errors[entry.session_number] =
          'La date doit etre dans le futur'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [sessionDates, sessions])

  const handleSaveSessions = useCallback(async () => {
    if (!validateSessions()) return

    setIsSavingSessions(true)
    try {
      const payload = sessionDates.map((entry) => ({
        session_number: entry.session_number,
        scheduled_at: dateTimeToIso(entry.date, entry.time),
        visio_url: visioUrl || null,
      }))

      const res = await fetch(
        `/api/consultant/beneficiaires/${beneficiaryId}/sessions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`)
      }

      setToast({ type: 'success', message: 'Dates des seances enregistrees' })
      onSessionsUpdated?.()
    } catch {
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement des dates',
      })
    } finally {
      setIsSavingSessions(false)
    }
  }, [sessionDates, visioUrl, beneficiaryId, validateSessions, onSessionsUpdated])

  const handleSaveVisio = useCallback(async () => {
    if (visioUrl && !isValidHttpsUrl(visioUrl)) {
      setVisioError('Le lien doit commencer par https://')
      return
    }
    setVisioError('')

    setIsSavingVisio(true)
    try {
      const payload = sessionDates.map((entry) => ({
        session_number: entry.session_number,
        scheduled_at: dateTimeToIso(entry.date, entry.time),
        visio_url: visioUrl || null,
      }))

      const res = await fetch(
        `/api/consultant/beneficiaires/${beneficiaryId}/sessions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`)
      }

      setToast({
        type: 'success',
        message: 'Lien de visioconference enregistre',
      })
      onSessionsUpdated?.()
    } catch {
      setToast({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement du lien',
      })
    } finally {
      setIsSavingVisio(false)
    }
  }, [sessionDates, visioUrl, beneficiaryId, onSessionsUpdated])

  const dismissToast = useCallback(() => setToast(null), [])

  // ---- Render ----

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && <ToastNotification toast={toast} onDismiss={dismissToast} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ---- Sessions Card ---- */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          {/* Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
              Planification des seances &mdash; {beneficiaryName}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {TOTAL_SESSIONS} seances prevues au total &middot;{' '}
              {plannedCount} planifiee{plannedCount > 1 ? 's' : ''}
            </p>
          </div>

          {/* Section heading */}
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text)]">
              Dates des seances
            </h3>
          </div>

          {/* Column headers */}
          <div className="mb-2 grid grid-cols-[120px_1fr_1fr_140px] items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
            <span>Seance</span>
            <span>Date</span>
            <span>Heure</span>
            <span>Statut</span>
          </div>

          {/* Session rows */}
          <div className="space-y-2">
            {sessionDates.map((entry) => {
              const isPlanned = entry.date !== ''
              const error = validationErrors[entry.session_number]

              return (
                <div key={entry.session_number}>
                  <div className="grid grid-cols-[120px_1fr_1fr_140px] items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[#F9FAFB] px-3 py-3">
                    {/* Session label */}
                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Seance {entry.session_number}
                    </span>

                    {/* Date input */}
                    <div className="relative">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) =>
                          handleDateChange(
                            entry.session_number,
                            e.target.value,
                          )
                        }
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${
                          error
                            ? 'border-red-400'
                            : 'border-[var(--color-border)]'
                        }`}
                      />
                    </div>

                    {/* Time input */}
                    <div className="relative">
                      <input
                        type="time"
                        value={entry.time}
                        onChange={(e) =>
                          handleTimeChange(
                            entry.session_number,
                            e.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                      />
                    </div>

                    {/* Status badge */}
                    <StatusBadgePlanification isPlanned={isPlanned} />
                  </div>

                  {/* Validation error */}
                  {error && (
                    <div className="mt-1 flex items-center gap-1.5 px-3 text-xs text-red-500">
                      <AlertCircle className="h-3 w-3" />
                      {error}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Save button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSessions}
              disabled={isSavingSessions}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSavingSessions ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer les dates
            </button>
          </div>
        </div>

        {/* ---- Visio Card ---- */}
        <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm h-fit">
          {/* Title */}
          <div className="mb-5 flex items-center gap-2">
            <Video className="h-5 w-5 text-[var(--color-primary)]" />
            <h3 className="text-base font-bold text-[var(--color-primary-dark)]">
              Lien de visioconference
            </h3>
          </div>

          {/* URL input */}
          <div className="mb-4">
            <label
              htmlFor="visio-url"
              className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
            >
              URL de la visioconference
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <ExternalLink className="h-4 w-4 text-[#9CA3AF]" />
              </div>
              <input
                id="visio-url"
                type="url"
                value={visioUrl}
                onChange={(e) => {
                  setVisioUrl(e.target.value)
                  setVisioError('')
                }}
                placeholder="https://meet.google.com/..."
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] placeholder:text-[#9CA3AF] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${
                  visioError
                    ? 'border-red-400'
                    : 'border-[var(--color-border)]'
                }`}
              />
            </div>
            {visioError && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {visioError}
              </div>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveVisio}
            disabled={isSavingVisio}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSavingVisio ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Enregistrer le lien
          </button>

          {/* Info text */}
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#F0F7FF] p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
            <p className="text-xs leading-relaxed text-[#6B7280]">
              Ce lien sera visible par le beneficiaire dans son espace
              personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
