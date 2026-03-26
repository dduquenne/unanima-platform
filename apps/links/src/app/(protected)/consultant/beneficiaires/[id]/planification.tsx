'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  Save,
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

interface SessionFormData {
  date: string
  time: string
  duration: string
  visio_url: string
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

const SESSION_LABELS: Record<number, string> = {
  1: 'Entretien préliminaire',
  2: 'Investigation phase 1',
  3: 'Investigation phase 2',
  4: 'Conclusion phase 1',
  5: 'Conclusion phase 2',
  6: 'Synthèse finale',
}

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

function formatDateFR(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTimeFR(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
}

function isInPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

function isValidHttpsUrl(url: string): boolean {
  if (!url) return true
  return url.startsWith('https://')
}

function getMonthName(month: number): string {
  const names = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
  return names[month] ?? ''
}

function getDaysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ---------------------------------------------------------------------------
// Toast
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
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 shadow-lg transition-all ${
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
      className="relative rounded-[18px] bg-white overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#28A745' }} />
      <div className="flex items-center gap-4 px-5 py-4 pl-7">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#E6F9EC' }}>
          <Check className="h-3.5 w-3.5" style={{ color: '#28A745' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold" style={{ color: '#2D3748' }}>
            Séance {session.session_number} — {SESSION_LABELS[session.session_number]}
          </p>
          <p className="text-[12px]" style={{ color: '#718096' }}>
            {formatDateFR(session.scheduled_at!)} à {formatTimeFR(session.scheduled_at!)} · 1h00
          </p>
          {session.visio_url && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-primary)' }}>
              {session.visio_url}
            </p>
          )}
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: '#E6F9EC', color: '#28A745' }}
        >
          Réalisée ✓
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — Upcoming
// ---------------------------------------------------------------------------

function UpcomingSessionCard({ session, onEdit }: { session: SessionData; onEdit: () => void }) {
  return (
    <div
      className="relative rounded-[18px] bg-white overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: 'var(--color-primary)' }} />
      <div className="flex items-center gap-4 px-5 py-4 pl-7">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#EBF4FF' }}>
          <Calendar className="h-3.5 w-3.5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold" style={{ color: '#2D3748' }}>
            Séance {session.session_number} — {SESSION_LABELS[session.session_number]}
          </p>
          <p className="text-[12px]" style={{ color: '#718096' }}>
            {formatDateFR(session.scheduled_at!)} à {formatTimeFR(session.scheduled_at!)} · 1h00
          </p>
          {session.visio_url && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-primary)' }}>
              {session.visio_url}
            </p>
          )}
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
          style={{ backgroundColor: '#EBF4FF', color: 'var(--color-primary)' }}
        >
          Planifiée
        </span>
        <button
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-[#FFF5EF]"
          style={{ backgroundColor: 'var(--color-background)', borderColor: '#FDE8D8' }}
          title="Modifier"
        >
          <span className="text-[13px]" style={{ color: 'var(--color-accent)' }}>✎</span>
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — Editing form
// ---------------------------------------------------------------------------

function EditingSessionCard({
  sessionNumber,
  form,
  onChange,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  sessionNumber: number
  form: SessionFormData
  onChange: (form: SessionFormData) => void
  onSave: () => void
  onCancel: () => void
  isSaving: boolean
  error: string | null
}) {
  return (
    <div
      className="relative rounded-[18px] bg-white overflow-hidden"
      style={{ boxShadow: '0 4px 12px rgba(242,140,90,0.12)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: 'var(--color-accent)' }} />
      <div className="px-6 py-5 pl-7 space-y-4">
        <h3 className="text-[16px] font-bold" style={{ color: '#2D3748' }}>
          Séance {sessionNumber} — Planifier cette séance
        </h3>

        {/* Date / Time / Duration row */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => onChange({ ...form, date: e.target.value })}
              className="w-full rounded-2xl border-[1.5px] px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              style={{ backgroundColor: '#FFFBF8', borderColor: '#FDE8D8', color: '#2D3748' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Heure</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => onChange({ ...form, time: e.target.value })}
              className="w-full rounded-2xl border-[1.5px] px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              style={{ backgroundColor: '#FFFBF8', borderColor: '#FDE8D8', color: '#2D3748' }}
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>Durée</label>
            <select
              value={form.duration}
              onChange={(e) => onChange({ ...form, duration: e.target.value })}
              className="w-full rounded-2xl border-[1.5px] px-3 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              style={{ backgroundColor: '#FFFBF8', borderColor: '#FDE8D8', color: '#2D3748' }}
            >
              <option value="30">30 min</option>
              <option value="60">1h00</option>
              <option value="90">1h30</option>
              <option value="120">2h00</option>
            </select>
          </div>
        </div>

        {/* Visio URL */}
        <div>
          <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>
            Lien visioconférence
          </label>
          <input
            type="url"
            value={form.visio_url}
            onChange={(e) => onChange({ ...form, visio_url: e.target.value })}
            placeholder="https://meet.google.com/..."
            className="w-full rounded-2xl border-[1.5px] px-4 py-2.5 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            style={{ backgroundColor: '#FFFBF8', borderColor: '#FDE8D8', color: '#2D3748' }}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-[12px] font-medium" style={{ color: '#4A5568' }}>
            Notes de préparation
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            rows={3}
            placeholder="Notes de préparation (optionnel)"
            className="w-full resize-y rounded-2xl border-[1.5px] p-4 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            style={{ backgroundColor: '#FFFBF8', borderColor: '#FDE8D8', color: '#2D3748' }}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-[12px] text-red-500">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-2xl border-[1.5px] px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-[#F9F5F2]"
            style={{ borderColor: '#FDE8D8', color: '#718096' }}
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !form.date}
            className="inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Planifier la séance
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card — To plan (collapsed)
// ---------------------------------------------------------------------------

function ToPlanSessionCard({ sessionNumber, onPlan }: { sessionNumber: number; onPlan: () => void }) {
  return (
    <div
      className="relative rounded-[18px] bg-white overflow-hidden"
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="absolute left-0 top-0 h-full w-[5px]" style={{ backgroundColor: '#D1D5DB' }} />
      <div className="flex items-center justify-between px-5 py-4 pl-7">
        <p className="text-[14px] font-medium" style={{ color: '#718096' }}>
          Séance {sessionNumber} — À planifier
        </p>
        <button
          onClick={onPlan}
          className="rounded-2xl border-[1.5px] px-4 py-1.5 text-[12px] font-medium transition-colors hover:bg-[#FFF5EF]"
          style={{ borderColor: '#FDE8D8', color: 'var(--color-accent)' }}
        >
          Planifier
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mini Calendar
// ---------------------------------------------------------------------------

function MiniCalendar({ sessions }: { sessions: SessionData[] }) {
  const plannedDates = sessions
    .filter((s) => s.scheduled_at)
    .map((s) => ({
      day: new Date(s.scheduled_at!).getDate(),
      month: new Date(s.scheduled_at!).getMonth(),
      year: new Date(s.scheduled_at!).getFullYear(),
      isPast: isInPast(s.scheduled_at!),
    }))

  // Show current month or month of next planned session
  const now = new Date()
  const targetMonth = plannedDates.find((d) => !d.isPast)
    ? plannedDates.find((d) => !d.isPast)!.month
    : now.getMonth()
  const targetYear = plannedDates.find((d) => !d.isPast)
    ? plannedDates.find((d) => !d.isPast)!.year
    : now.getFullYear()

  const firstDay = new Date(targetYear, targetMonth, 1)
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate()
  const startDow = (firstDay.getDay() + 6) % 7 // Monday=0

  const days: (number | null)[] = []
  for (let i = 0; i < startDow; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  function getDayStyle(day: number): React.CSSProperties {
    const planned = plannedDates.find((p) => p.day === day && p.month === targetMonth && p.year === targetYear)
    if (!planned) return { color: '#4A5568' }
    if (planned.isPast) return { backgroundColor: '#E6F9EC', color: '#28A745', fontWeight: 700, borderRadius: '50%' }
    return { backgroundColor: '#EBF4FF', color: '#2A7FD4', fontWeight: 700, borderRadius: '50%' }
  }

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  return (
    <div>
      <p className="mb-2 text-center text-[13px] font-semibold" style={{ color: '#2D3748' }}>
        {getMonthName(targetMonth)} {targetYear}
      </p>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {weekDays.map((d, i) => (
          <span key={i} className="py-1 font-medium" style={{ color: '#A0A8B4' }}>{d}</span>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className="flex h-6 w-6 items-center justify-center text-[11px] mx-auto"
            style={day ? getDayStyle(day) : {}}
          >
            {day ?? ''}
          </div>
        ))}
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
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [form, setForm] = useState<SessionFormData>({
    date: '', time: '14:00', duration: '60', visio_url: '', notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)

  // Build session list with state
  const allSessions = useMemo(() => {
    return Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
      const num = i + 1
      const match = sessions.find((s) => s.session_number === num)
      return {
        session_number: num,
        scheduled_at: match?.scheduled_at ?? null,
        visio_url: match?.visio_url ?? null,
      }
    })
  }, [sessions])

  const plannedCount = allSessions.filter((s) => s.scheduled_at).length

  // Next upcoming session
  const nextSession = useMemo(() => {
    return allSessions
      .filter((s) => s.scheduled_at && !isInPast(s.scheduled_at))
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]
  }, [allSessions])

  // Start editing
  const handleEdit = useCallback((sessionNumber: number) => {
    const session = allSessions.find((s) => s.session_number === sessionNumber)
    setEditingSession(sessionNumber)
    setFormError(null)
    setForm({
      date: isoToDateInput(session?.scheduled_at ?? null),
      time: isoToTimeInput(session?.scheduled_at ?? null) || '14:00',
      duration: '60',
      visio_url: session?.visio_url ?? allSessions.find((s) => s.visio_url)?.visio_url ?? '',
      notes: '',
    })
  }, [allSessions])

  // Save
  const handleSave = useCallback(async () => {
    if (!form.date) {
      setFormError('Veuillez saisir une date')
      return
    }

    if (form.visio_url && !isValidHttpsUrl(form.visio_url)) {
      setFormError('Le lien doit commencer par https://')
      return
    }

    setFormError(null)
    setIsSaving(true)

    try {
      // Build full payload: keep existing sessions + update the edited one
      const payload = allSessions.map((s) => {
        if (s.session_number === editingSession) {
          return {
            session_number: s.session_number,
            scheduled_at: dateTimeToIso(form.date, form.time),
            visio_url: form.visio_url || null,
          }
        }
        return {
          session_number: s.session_number,
          scheduled_at: s.scheduled_at,
          visio_url: form.visio_url || s.visio_url || null,
        }
      })

      const res = await fetch(
        `/api/consultant/beneficiaires/${beneficiaryId}/sessions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!res.ok) throw new Error(`Erreur ${res.status}`)

      setToast({ type: 'success', message: 'Séance planifiée avec succès' })
      setEditingSession(null)
      onSessionsUpdated?.()
    } catch {
      setToast({ type: 'error', message: "Erreur lors de l'enregistrement" })
    } finally {
      setIsSaving(false)
    }
  }, [form, editingSession, allSessions, beneficiaryId, onSessionsUpdated])

  const handleCancel = useCallback(() => {
    setEditingSession(null)
    setFormError(null)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  return (
    <div>
      {toast && <ToastNotification toast={toast} onDismiss={dismissToast} />}

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-[22px] font-bold" style={{ color: '#2D3748' }}>
          Planification des séances
        </h2>
        <p className="mt-1 text-[13px]" style={{ color: '#A0A8B4' }}>
          {TOTAL_SESSIONS} séances au total · {plannedCount} planifiée{plannedCount > 1 ? 's' : ''} · {TOTAL_SESSIONS - plannedCount} à planifier
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* ---- Session Cards ---- */}
        <div className="space-y-3">
          {allSessions.map((session) => {
            // Editing state
            if (session.session_number === editingSession) {
              return (
                <EditingSessionCard
                  key={session.session_number}
                  sessionNumber={session.session_number}
                  form={form}
                  onChange={setForm}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  isSaving={isSaving}
                  error={formError}
                />
              )
            }

            // Completed (past)
            if (session.scheduled_at && isInPast(session.scheduled_at)) {
              return <CompletedSessionCard key={session.session_number} session={session} />
            }

            // Upcoming (future, planned)
            if (session.scheduled_at && !isInPast(session.scheduled_at)) {
              return (
                <UpcomingSessionCard
                  key={session.session_number}
                  session={session}
                  onEdit={() => handleEdit(session.session_number)}
                />
              )
            }

            // To plan
            return (
              <ToPlanSessionCard
                key={session.session_number}
                sessionNumber={session.session_number}
                onPlan={() => handleEdit(session.session_number)}
              />
            )
          })}
        </div>

        {/* ---- Right Panel: Récapitulatif ---- */}
        <div
          className="h-fit rounded-[20px] bg-white p-5 space-y-5"
          style={{ boxShadow: '0 4px 12px rgba(242,140,90,0.12)' }}
        >
          <h3 className="text-[16px] font-bold" style={{ color: '#2D3748' }}>
            Récapitulatif
          </h3>

          {/* Mini Calendar */}
          <MiniCalendar sessions={allSessions} />

          {/* Stats */}
          <div className="border-t pt-4" style={{ borderColor: '#FDE8D8' }}>
            <p className="text-[13px] font-medium" style={{ color: '#4A5568' }}>
              {plannedCount}/{TOTAL_SESSIONS} séances planifiées
            </p>
            <div className="mt-2 h-2 rounded-full" style={{ backgroundColor: '#FDE8D8' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.round((plannedCount / TOTAL_SESSIONS) * 100)}%`,
                  backgroundColor: 'var(--color-accent)',
                }}
              />
            </div>
          </div>

          {/* Next session highlight */}
          {nextSession && (
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFF1E8' }}>
              <p className="text-[12px] font-semibold" style={{ color: 'var(--color-accent)' }}>
                Prochaine séance
              </p>
              <p className="mt-1 text-[14px] font-bold" style={{ color: '#92400E' }}>
                {(() => {
                  const days = getDaysUntil(nextSession.scheduled_at!)
                  if (days === 0) return "Aujourd'hui"
                  if (days === 1) return 'Demain'
                  return `dans ${days} jours`
                })()}
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#28A745' }} />
              <span className="text-[10px]" style={{ color: '#718096' }}>Réalisée</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
              <span className="text-[10px]" style={{ color: '#718096' }}>Planifiée</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#D1D5DB' }} />
              <span className="text-[10px]" style={{ color: '#718096' }}>À planifier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
