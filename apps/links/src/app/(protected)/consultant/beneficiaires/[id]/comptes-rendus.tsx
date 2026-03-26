'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import {
  Download,
  Save,
  Check,
  Lock,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionNoteFields {
  objectifs: string
  contenu: string
  observations: string
  actions: string
}

interface SessionNoteData {
  content: string
  updated_at: string
}

interface ComptesRendusTabProps {
  beneficiaryId: string
  beneficiaryName: string
  sessions: Array<{
    session_number: number
    scheduled_at: string | null
  }>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_SESSIONS = 6

const FIELD_LABELS: { key: keyof SessionNoteFields; label: string }[] = [
  { key: 'objectifs', label: 'Objectifs de la séance' },
  { key: 'contenu', label: 'Contenu de la séance' },
  { key: 'observations', label: 'Observations' },
  { key: 'actions', label: 'Actions à mener' },
]

const EMPTY_FIELDS: SessionNoteFields = {
  objectifs: '',
  contenu: '',
  observations: '',
  actions: '',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateFR(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/** Serialize 4 fields into a single content string for API compat. */
function serializeFields(fields: SessionNoteFields): string {
  const parts: string[] = []
  for (const { key, label } of FIELD_LABELS) {
    if (fields[key].trim()) {
      parts.push(`## ${label}\n${fields[key].trim()}`)
    }
  }
  return parts.join('\n\n')
}

/** Deserialize a single content string back to 4 fields. */
function deserializeFields(content: string): SessionNoteFields {
  const fields = { ...EMPTY_FIELDS }
  if (!content) return fields

  // Try to parse structured format
  for (const { key, label } of FIELD_LABELS) {
    const regex = new RegExp(`## ${label}\\n([\\s\\S]*?)(?=\\n## |$)`)
    const match = content.match(regex)
    if (match?.[1]) {
      fields[key] = match[1].trim()
    }
  }

  // If no structured format found, put everything in "contenu"
  const hasStructured = Object.values(fields).some((v) => v.length > 0)
  if (!hasStructured && content.trim()) {
    fields.contenu = content.trim()
  }

  return fields
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string
  type?: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
        type === 'success'
          ? 'bg-[#28A745] text-white'
          : 'bg-[#F8D7DA] text-[#721C24] border border-[#F5C6CB]'
      }`}
    >
      <Check className="h-4 w-4" />
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session History Item (right column)
// ---------------------------------------------------------------------------

function SessionHistoryItem({
  sessionNumber,
  scheduledAt,
  isWritten,
  isCurrent,
  onClick,
}: {
  sessionNumber: number
  scheduledAt: string | null
  isWritten: boolean
  isCurrent: boolean
  onClick: () => void
}) {
  const isPlanned = scheduledAt !== null

  let iconBg: string
  let iconContent: React.ReactNode
  let badgeBg: string
  let badgeColor: string
  let badgeText: string

  if (isWritten) {
    iconBg = '#ECFDF5'
    iconContent = <Check className="h-3.5 w-3.5" style={{ color: '#4CAF82' }} />
    badgeBg = '#ECFDF5'
    badgeColor = '#4CAF82'
    badgeText = 'Rédigé'
  } else if (isPlanned) {
    iconBg = '#FFF7ED'
    iconContent = <span className="text-[11px] font-bold" style={{ color: '#F28C5A' }}>!</span>
    badgeBg = '#FFF7ED'
    badgeColor = '#F28C5A'
    badgeText = 'À rédiger'
  } else {
    iconBg = '#F5EDE8'
    iconContent = <span className="text-[11px]" style={{ color: '#C4B8AE' }}>—</span>
    badgeBg = '#F5EDE8'
    badgeColor = '#B0A098'
    badgeText = 'Non planifié'
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors"
      style={{
        borderColor: isCurrent ? '#F28C5A' : '#F0E0D4',
        backgroundColor: isCurrent ? '#FFF8F5' : isPlanned ? '#FFFFFF' : '#FFFBF8',
      }}
    >
      {/* Icon */}
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        {iconContent}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: isPlanned ? '#2D2D2D' : '#A0A0A0' }}>
          Séance {sessionNumber}
        </p>
        <p className="text-[11.5px]" style={{ color: isPlanned ? '#7A7A7A' : '#C4B8AE' }}>
          {isPlanned ? formatDateFR(scheduledAt!) : 'Non planifiée'}
        </p>
        {isWritten && isCurrent && (
          <p className="text-[11px]" style={{ color: '#F28C5A' }}>En cours de rédaction</p>
        )}
      </div>

      {/* Badge */}
      <span
        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
        style={{ backgroundColor: badgeBg, color: badgeColor }}
      >
        {badgeText}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ComptesRendusTab({
  beneficiaryId,
  beneficiaryName,
  sessions,
}: ComptesRendusTabProps) {
  const [notes, setNotes] = useState<Record<number, SessionNoteData>>({})
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState(1)
  const [fields, setFields] = useState<SessionNoteFields>({ ...EMPTY_FIELDS })
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  // Build a full list of 6 sessions
  const allSessions = Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
    const num = i + 1
    const match = sessions.find((s) => s.session_number === num)
    return {
      session_number: num,
      scheduled_at: match?.scheduled_at ?? null,
    }
  })

  // Auto-select first planned session with no note, or first session
  useEffect(() => {
    if (loading) return
    const firstUnwritten = allSessions.find(
      (s) => s.scheduled_at !== null && !notes[s.session_number]
    )
    if (firstUnwritten) {
      setActiveSession(firstUnwritten.session_number)
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch notes
  useEffect(() => {
    const controller = new AbortController()

    async function fetchNotes() {
      try {
        setLoading(true)
        const res = await fetch(
          `/api/consultant/session-notes?beneficiary_id=${beneficiaryId}`,
          { signal: controller.signal }
        )

        if (!res.ok) throw new Error(`Erreur ${res.status}`)

        const json = await res.json()
        const data: Array<{
          session_number: number
          content: string
          updated_at: string
        }> = json.data ?? json

        const map: Record<number, SessionNoteData> = {}
        for (const item of data) {
          if (item.content && item.content.length > 0) {
            map[item.session_number] = {
              content: item.content,
              updated_at: item.updated_at,
            }
          }
        }
        setNotes(map)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
    return () => controller.abort()
  }, [beneficiaryId])

  // Load fields when active session changes
  useEffect(() => {
    const note = notes[activeSession]
    if (note) {
      setFields(deserializeFields(note.content))
      setLastSavedAt(note.updated_at)
    } else {
      setFields({ ...EMPTY_FIELDS })
      setLastSavedAt(null)
    }
  }, [activeSession, notes])

  // Handlers
  const handleFieldChange = useCallback(
    (key: keyof SessionNoteFields, value: string) => {
      setFields((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleSave = useCallback(async () => {
    const content = serializeFields(fields)
    if (!content.trim()) return

    try {
      setIsSaving(true)
      const res = await fetch('/api/consultant/session-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiary_id: beneficiaryId,
          session_number: activeSession,
          content,
        }),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}`)

      const now = new Date().toISOString()
      setNotes((prev) => ({
        ...prev,
        [activeSession]: { content, updated_at: now },
      }))
      setLastSavedAt(now)
      setToastType('success')
      setToastMessage('Compte-rendu enregistré avec succès')
    } catch {
      setToastType('error')
      setToastMessage("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }, [beneficiaryId, activeSession, fields])

  const handleExportPDF = useCallback(async () => {
    try {
      setIsExporting(true)
      const res = await fetch('/api/consultant/session-notes/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beneficiary_id: beneficiaryId }),
      })

      if (!res.ok) throw new Error(`Erreur ${res.status}`)

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disposition = res.headers.get('Content-Disposition')
      const filename = disposition?.match(/filename="(.+)"/)?.[1] ?? 'comptes-rendus.pdf'
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setToastType('success')
      setToastMessage('PDF téléchargé avec succès')
    } catch {
      setToastType('error')
      setToastMessage("Erreur lors de l'export PDF")
    } finally {
      setIsExporting(false)
    }
  }, [beneficiaryId])

  const writtenCount = Object.keys(notes).length
  const activeSessionData = allSessions.find((s) => s.session_number === activeSession)
  const isPlanned = activeSessionData?.scheduled_at !== null

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* ==================== LEFT COLUMN — Session Notes Form ==================== */}
      <div
        className="rounded-[18px] bg-white p-6"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Session selector tabs — pill-shaped */}
        <div className="mb-6 flex flex-wrap gap-2">
          {allSessions.map((session) => {
            const isActive = session.session_number === activeSession
            const isSessionPlanned = session.scheduled_at !== null
            const isDisabled = !isSessionPlanned && session.session_number > 2

            return (
              <button
                key={session.session_number}
                onClick={() => !isDisabled && setActiveSession(session.session_number)}
                disabled={isDisabled}
                className="rounded-full px-4 py-2 text-[12.5px] font-medium transition-all"
                style={
                  isActive
                    ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
                    : isDisabled
                      ? { backgroundColor: '#F5EDE8', color: '#C4B8AE', opacity: 0.5, cursor: 'not-allowed' }
                      : { backgroundColor: '#F5EDE8', color: '#7A7A7A' }
                }
              >
                Séance {session.session_number}
              </button>
            )
          })}
        </div>

        {/* Session title */}
        <h3 className="text-[17px] font-bold" style={{ color: '#2D2D2D' }}>
          Séance {activeSession}
        </h3>
        {activeSessionData?.scheduled_at && (
          <p className="mt-1 text-[13px]" style={{ color: '#7A7A7A' }}>
            {formatDateFR(activeSessionData.scheduled_at)}
          </p>
        )}

        {/* 4 text fields */}
        <div className="mt-6 space-y-5">
          {FIELD_LABELS.map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-[13px] font-semibold" style={{ color: '#4A4A4A' }}>
                {label}
              </label>
              <textarea
                value={fields[key]}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                rows={key === 'contenu' ? 5 : 3}
                placeholder={`Saisissez ${label.toLowerCase()}...`}
                className="w-full resize-y rounded-2xl border-[1.5px] p-4 text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                style={{
                  backgroundColor: '#FFFBF8',
                  borderColor: '#F0E0D4',
                  color: '#4A4A4A',
                }}
              />
            </div>
          ))}
        </div>

        {/* Autosave indicator */}
        {lastSavedAt && (
          <p className="mt-4 text-[12px]" style={{ color: '#4CAF82' }}>
            ✓ Sauvegardé le {formatDateFR(lastSavedAt)}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full border-[1.5px] px-5 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-[#F9F5F2] disabled:opacity-50"
            style={{ borderColor: '#D4C4B8', color: '#4A4A4A' }}
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isExporting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Export en cours...' : 'Exporter PDF'}
          </button>
        </div>

        {/* Confidentiality notice */}
        <div
          className="mt-5 flex items-center gap-3 rounded-2xl border p-3"
          style={{ backgroundColor: '#FFF5EE', borderColor: '#F5DFD0' }}
        >
          <Lock className="h-4 w-4 shrink-0" style={{ color: '#A09088' }} />
          <p className="text-[11.5px]" style={{ color: '#7A7A7A' }}>
            Ces comptes-rendus sont confidentiels et ne sont pas visibles par le bénéficiaire.
          </p>
        </div>
      </div>

      {/* ==================== RIGHT COLUMN — Previous Sessions ==================== */}
      <div
        className="rounded-[18px] bg-white p-5"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <h3 className="mb-4 text-[15px] font-bold" style={{ color: '#2D2D2D' }}>
          Historique des séances
        </h3>

        <div className="space-y-2">
          {allSessions.map((session) => (
            <SessionHistoryItem
              key={session.session_number}
              sessionNumber={session.session_number}
              scheduledAt={session.scheduled_at}
              isWritten={!!notes[session.session_number]}
              isCurrent={session.session_number === activeSession}
              onClick={() => setActiveSession(session.session_number)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-5">
          <p className="mb-2 text-[11.5px] font-semibold" style={{ color: '#7A7A7A' }}>
            Légende :
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: '#ECFDF5', borderColor: '#4CAF82' }} />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>Rédigé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: '#FFF7ED', borderColor: '#F28C5A' }} />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>À rédiger</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: '#F5EDE8', borderColor: '#D4C4B8' }} />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>Non planifié</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
