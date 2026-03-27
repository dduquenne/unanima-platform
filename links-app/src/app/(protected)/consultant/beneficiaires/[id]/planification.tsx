'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Clock,
  Edit3,
  Save,
  Video,
  ExternalLink,
  Check,
  AlertCircle,
  X,
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

interface SessionFormState {
  date: string
  time: string
  duration: string
  visioUrl: string
  notes: string
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
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function dateTimeToIso(date: string, time: string): string | null {
  if (!date) return null
  const timePart = time || '09:00'
  return new Date(`${date}T${timePart}:00`).toISOString()
}

function isDateInFuture(date: string, time: string): boolean {
  if (!date) return true
  const timePart = time || '00:00'
  return new Date(`${date}T${timePart}:00`).getTime() > Date.now()
}

function isValidHttpsUrl(url: string): boolean {
  if (!url) return true
  return url.startsWith('https://')
}

function formatDateTimeFR(iso: string): string {
  const d = new Date(iso)
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${date} à ${time}`
}

function isPastSession(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-[18px] px-5 py-3 shadow-lg"
      style={{
        backgroundColor: toast.type === 'success' ? '#D4EDDA' : '#F8D7DA',
        color: toast.type === 'success' ? '#155724' : '#721C24',
        borderColor: toast.type === 'success' ? '#C3E6CB' : '#F5C6CB',
        borderWidth: '1px',
      }}
    >
      {toast.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      <span className="text-sm font-medium">{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 text-sm opacity-60 hover:opacity-100 transition-opacity">×</button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — Completed
// ---------------------------------------------------------------------------

function CompletedSessionCard({ session }: { session: SessionData }) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-5 py-4"
      style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#28A745' }} />
      <div className="flex items-center gap-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] font-bold" style={{ backgroundColor: '#E6F9EC', color: '#28A745' }}>
          ✓
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold" style={{ color: '#2D3748' }}>
            Séance {session.session_number}
          </p>
          <p className="text-[12px]" style={{ color: '#718096' }}>
            {session.scheduled_at ? `${formatDateTimeFR(session.scheduled_at)} · 1h00` : ''}
          </p>
          {session.visio_url && (
            <a href={session.visio_url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline" style={{ color: '#2A7FD4' }}>
              {session.visio_url}
            </a>
          )}
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: '#E6F9EC', color: '#28A745' }}>
          Réalisée ✓
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — Planned/Upcoming
// ---------------------------------------------------------------------------

function PlannedSessionCard({ session, onEdit }: { session: SessionData; onEdit: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-5 py-4"
      style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#2A7FD4' }} />
      <div className="flex items-center gap-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#EBF4FF' }}>
          <Calendar className="h-3.5 w-3.5" style={{ color: '#2A7FD4' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold" style={{ color: '#2D3748' }}>
            Séance {session.session_number}
          </p>
          <p className="text-[12px]" style={{ color: '#718096' }}>
            {session.scheduled_at ? `${formatDateTimeFR(session.scheduled_at)} · 1h00` : ''}
          </p>
          {session.visio_url && (
            <a href={session.visio_url} target="_blank" rel="noopener noreferrer" className="text-[11px] underline" style={{ color: '#2A7FD4' }}>
              {session.visio_url}
            </a>
          )}
        </div>
        <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: '#EBF4FF', color: '#2A7FD4' }}>
          Planifiée
        </span>
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-full border"
          style={{ backgroundColor: '#FFF8F5', borderColor: '#FDE8D8', color: '#F28C5A' }}
        >
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — To Plan
// ---------------------------------------------------------------------------

function ToPlanSessionCard({ sessionNumber, onPlan }: { sessionNumber: number; onPlan: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] px-5 py-3"
      style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 6px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#D1D5DB' }} />
      <div className="flex items-center gap-4">
        <span className="text-[14px] font-medium" style={{ color: '#718096' }}>
          Séance {sessionNumber} — À planifier
        </span>
        <div className="flex-1" />
        <button
          onClick={onPlan}
          className="rounded-[16px] border px-4 py-1.5 text-[12px] font-medium transition-colors hover:bg-[#FFF3EC]"
          style={{ borderColor: '#FDE8D8', color: '#F28C5A' }}
        >
          Planifier
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Expanded Edit Form
// ---------------------------------------------------------------------------

function SessionEditForm({
  sessionNumber,
  initialForm,
  validationError,
  isSaving,
  onSave,
  onCancel,
}: {
  sessionNumber: number
  initialForm: SessionFormState
  validationError: string
  isSaving: boolean
  onSave: (form: SessionFormState) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SessionFormState>(initialForm)

  const fieldStyle = {
    backgroundColor: '#FFFBF8',
    borderColor: '#FDE8D8',
    color: '#2D3748',
  }

  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-6"
      style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(242, 140, 90, 0.08)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#F28C5A' }} />

      <h3 className="mb-5 text-[16px] font-bold" style={{ color: '#2D3748' }}>
        Séance {sessionNumber} — Planifier cette séance
      </h3>

      {/* Date / Time / Duration row */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            className="w-full rounded-[16px] border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#2A7FD4]"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Heure</label>
          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
            className="w-full rounded-[16px] border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#2A7FD4]"
            style={fieldStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Durée</label>
          <select
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            className="w-full rounded-[16px] border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#2A7FD4]"
            style={fieldStyle}
          >
            <option value="0:30">0h30</option>
            <option value="1:00">1h00</option>
            <option value="1:30">1h30</option>
            <option value="2:00">2h00</option>
          </select>
        </div>
      </div>

      {/* Visio URL */}
      <div className="mb-4">
        <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>
          Lien visioconférence
        </label>
        <input
          type="url"
          value={form.visioUrl}
          onChange={(e) => setForm((p) => ({ ...p, visioUrl: e.target.value }))}
          placeholder="https://meet.google.com/..."
          className="w-full rounded-[16px] border px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#2A7FD4]"
          style={fieldStyle}
        />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>
          Notes de préparation
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Notes de préparation (optionnel)"
          rows={3}
          className="w-full rounded-[16px] border p-3 text-[13px] outline-none focus:ring-2 focus:ring-[#2A7FD4] resize-y"
          style={fieldStyle}
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" />
          {validationError}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="rounded-[16px] border px-4 py-2 text-[13px] font-medium transition-colors"
          style={{ borderColor: '#FDE8D8', color: '#718096' }}
        >
          Annuler
        </button>
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.date}
          className="rounded-[16px] px-5 py-2 text-[13px] font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: '#2A7FD4' }}
        >
          {isSaving ? 'Enregistrement…' : 'Planifier la séance'}
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right Panel — Recap
// ---------------------------------------------------------------------------

function RecapPanel({
  sessions,
  sessionDates,
}: {
  sessions: SessionData[]
  sessionDates: Array<{ session_number: number; date: string; time: string }>
}) {
  const plannedCount = sessionDates.filter((s) => s.date !== '').length
  const pct = Math.round((plannedCount / TOTAL_SESSIONS) * 100)

  // Find next future session
  const nextSession = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]

  const daysLeft = nextSession?.scheduled_at ? daysUntil(nextSession.scheduled_at) : null

  return (
    <div
      className="rounded-[20px] p-5"
      style={{
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(242, 140, 90, 0.08)',
      }}
    >
      <h3 className="text-[16px] font-bold" style={{ color: '#2D3748' }}>
        Récapitulatif
      </h3>

      {/* Stats */}
      <div className="mt-5">
        <p className="text-[13px] font-medium" style={{ color: '#4A5568' }}>
          {plannedCount}/{TOTAL_SESSIONS} séances planifiées
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: '#FDE8D8' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: '#F28C5A' }}
          />
        </div>
      </div>

      {/* Next session highlight */}
      {daysLeft !== null && daysLeft > 0 && (
        <div className="mt-4 rounded-[16px] p-3" style={{ backgroundColor: '#FFF1E8' }}>
          <p className="text-[12px] font-semibold" style={{ color: '#F28C5A' }}>
            ⏱ Prochaine séance
          </p>
          <p className="text-[14px] font-bold" style={{ color: '#92400E' }}>
            dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#28A745' }} />
          <span className="text-[10px]" style={{ color: '#718096' }}>Réalisée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#2A7FD4' }} />
          <span className="text-[10px]" style={{ color: '#718096' }}>Planifiée</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
          <span className="text-[10px]" style={{ color: '#718096' }}>À planifier</span>
        </div>
      </div>
    </div>
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
  const [sessionDates, setSessionDates] = useState(() => initSessionDates(sessions))
  const [visioUrl, setVisioUrl] = useState(() => sessions.find((s) => s.visio_url)?.visio_url ?? '')
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [validationError, setValidationError] = useState('')

  const plannedCount = useMemo(() => sessionDates.filter((s) => s.date !== '').length, [sessionDates])

  function initSessionDates(data: SessionData[]) {
    return Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
      const num = i + 1
      const existing = data.find((s) => s.session_number === num)
      return {
        session_number: num,
        date: isoToDateInput(existing?.scheduled_at ?? null),
        time: isoToTimeInput(existing?.scheduled_at ?? null),
      }
    })
  }

  const handleSaveSession = useCallback(async (sessionNumber: number, form: SessionFormState) => {
    if (!form.date) {
      setValidationError('La date est obligatoire')
      return
    }
    if (!isDateInFuture(form.date, form.time)) {
      const original = sessions.find((s) => s.session_number === sessionNumber)
      const unchanged = original?.scheduled_at
        && isoToDateInput(original.scheduled_at) === form.date
        && isoToTimeInput(original.scheduled_at) === form.time
      if (!unchanged) {
        setValidationError('La date doit être dans le futur')
        return
      }
    }
    if (form.visioUrl && !isValidHttpsUrl(form.visioUrl)) {
      setValidationError('Le lien doit commencer par https://')
      return
    }

    setValidationError('')
    setIsSaving(true)

    try {
      // Update local state
      const newDates = sessionDates.map((s) =>
        s.session_number === sessionNumber ? { ...s, date: form.date, time: form.time } : s,
      )
      setSessionDates(newDates)

      const payload = newDates.map((entry) => ({
        session_number: entry.session_number,
        scheduled_at: dateTimeToIso(entry.date, entry.time),
        visio_url: form.visioUrl || visioUrl || null,
      }))

      const res = await fetch(`/api/consultant/beneficiaires/${beneficiaryId}/sessions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}`)

      if (form.visioUrl) setVisioUrl(form.visioUrl)
      setEditingSession(null)
      setToast({ type: 'success', message: 'Séance planifiée avec succès' })
      onSessionsUpdated?.()
    } catch {
      setToast({ type: 'error', message: 'Erreur lors de la planification' })
    } finally {
      setIsSaving(false)
    }
  }, [sessionDates, visioUrl, beneficiaryId, sessions, onSessionsUpdated])

  return (
    <div>
      {toast && <ToastNotification toast={toast} onDismiss={() => setToast(null)} />}

      {/* Title */}
      <h2 className="text-[22px] font-bold" style={{ color: '#2D3748' }}>
        Planification des séances
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: '#A0A8B4' }}>
        {TOTAL_SESSIONS} séances au total · {plannedCount} planifiée{plannedCount > 1 ? 's' : ''} · {TOTAL_SESSIONS - plannedCount} à planifier
      </p>

      <div className="mt-5 flex gap-6">
        {/* ============ LEFT COLUMN — Session Cards ============ */}
        <div className="min-w-0 flex-1 space-y-3">
          {Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
            const num = i + 1
            const session = sessions.find((s) => s.session_number === num)
            const entry = sessionDates.find((s) => s.session_number === num)
            const isPlanned = entry ? entry.date !== '' : false
            const isPast = session?.scheduled_at ? isPastSession(session.scheduled_at) : false
            const isEditing = editingSession === num

            if (isEditing) {
              return (
                <SessionEditForm
                  key={num}
                  sessionNumber={num}
                  initialForm={{
                    date: entry?.date ?? '',
                    time: entry?.time ?? '',
                    duration: '1:00',
                    visioUrl: visioUrl,
                    notes: '',
                  }}
                  validationError={validationError}
                  isSaving={isSaving}
                  onSave={(form) => handleSaveSession(num, form)}
                  onCancel={() => { setEditingSession(null); setValidationError('') }}
                />
              )
            }

            if (isPlanned && isPast) {
              return (
                <CompletedSessionCard
                  key={num}
                  session={session ?? { session_number: num, scheduled_at: null, visio_url: null }}
                />
              )
            }

            if (isPlanned) {
              return (
                <PlannedSessionCard
                  key={num}
                  session={session ?? { session_number: num, scheduled_at: null, visio_url: null }}
                  onEdit={() => setEditingSession(num)}
                />
              )
            }

            return (
              <ToPlanSessionCard
                key={num}
                sessionNumber={num}
                onPlan={() => setEditingSession(num)}
              />
            )
          })}
        </div>

        {/* ============ RIGHT COLUMN — Recap ============ */}
        <div className="hidden w-[280px] shrink-0 lg:block">
          <RecapPanel sessions={sessions} sessionDates={sessionDates} />

          {/* Visio URL card */}
          <div
            className="mt-4 rounded-[20px] p-5"
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(242, 140, 90, 0.08)' }}
          >
            <div className="mb-3 flex items-center gap-2">
              <Video className="h-4 w-4" style={{ color: '#2A7FD4' }} />
              <h4 className="text-[13px] font-bold" style={{ color: '#2D3748' }}>
                Lien visioconférence
              </h4>
            </div>
            {visioUrl ? (
              <a
                href={visioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-[12px] underline"
                style={{ color: '#2A7FD4' }}
              >
                {visioUrl}
              </a>
            ) : (
              <p className="text-[12px] italic" style={{ color: '#A0A8B4' }}>
                Aucun lien défini
              </p>
            )}
            <div className="mt-3 flex items-start gap-2 rounded-[12px] p-2.5" style={{ backgroundColor: '#F0F7FF' }}>
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#2A7FD4' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: '#718096' }}>
                Ce lien sera visible par le bénéficiaire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
