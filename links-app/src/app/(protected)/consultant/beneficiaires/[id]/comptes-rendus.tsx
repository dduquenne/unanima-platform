'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Download,
  Save,
  Check,
  Lock,
  Edit3,
  AlertCircle,
  Minus,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StructuredNote {
  objectifs: string
  contenu: string
  observations: string
  actions: string
}

interface SessionNote {
  content: string
  structured?: StructuredNote
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
const MAX_CHARACTERS = 10_000

const STRUCTURED_FIELDS: { key: keyof StructuredNote; label: string; rows: number }[] = [
  { key: 'objectifs', label: 'Objectifs de la séance', rows: 3 },
  { key: 'contenu', label: 'Contenu de la séance', rows: 5 },
  { key: 'observations', label: 'Observations', rows: 3 },
  { key: 'actions', label: 'Actions à mener', rows: 2 },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateFR(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function parseStructured(content: string): StructuredNote {
  // Try to parse structured format: sections separated by labels
  const result: StructuredNote = { objectifs: '', contenu: '', observations: '', actions: '' }
  const sections = content.split(/\n---\n/)
  if (sections.length >= 4) {
    result.objectifs = sections[0]?.trim() ?? ''
    result.contenu = sections[1]?.trim() ?? ''
    result.observations = sections[2]?.trim() ?? ''
    result.actions = sections[3]?.trim() ?? ''
  } else {
    // Fallback: put everything in contenu
    result.contenu = content
  }
  return result
}

function serializeStructured(note: StructuredNote): string {
  return [note.objectifs, note.contenu, note.observations, note.actions]
    .map((s) => s.trim())
    .join('\n---\n')
}

function getSessionStatus(
  sessionNumber: number,
  scheduledAt: string | null,
  note: SessionNote | undefined,
  activeSession: number,
): 'redige' | 'en_cours' | 'a_rediger' | 'non_planifie' {
  if (!scheduledAt) return 'non_planifie'
  if (note && note.content.length > 0) {
    if (sessionNumber === activeSession) return 'en_cours'
    return 'redige'
  }
  return 'a_rediger'
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg"
      style={{ backgroundColor: '#28A745' }}
    >
      <Check className="h-4 w-4" />
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session History Card (right column)
// ---------------------------------------------------------------------------

function SessionHistoryCard({
  sessionNumber,
  scheduledAt,
  note,
  isActive,
  status,
  onClick,
}: {
  sessionNumber: number
  scheduledAt: string | null
  note: SessionNote | undefined
  isActive: boolean
  status: 'redige' | 'en_cours' | 'a_rediger' | 'non_planifie'
  onClick: () => void
}) {
  const statusConfig = {
    redige: {
      circleBg: '#ECFDF5', icon: '✓', iconColor: '#4CAF82',
      badgeBg: '#ECFDF5', badgeColor: '#4CAF82', badgeText: 'Rédigé',
      bg: '#FFFFFF', border: '#F0E0D4',
    },
    en_cours: {
      circleBg: '#FFF0E6', icon: '✎', iconColor: '#F28C5A',
      badgeBg: '#FFF0E6', badgeColor: '#F28C5A', badgeText: 'En cours',
      bg: '#FFF8F5', border: '#F28C5A',
    },
    a_rediger: {
      circleBg: '#FFF7ED', icon: '!', iconColor: '#F28C5A',
      badgeBg: '#FFF7ED', badgeColor: '#F28C5A', badgeText: 'À rédiger',
      bg: '#FFFFFF', border: '#F0E0D4',
    },
    non_planifie: {
      circleBg: '#F5EDE8', icon: '—', iconColor: '#C4B8AE',
      badgeBg: '#F5EDE8', badgeColor: '#B0A098', badgeText: 'Non planifié',
      bg: '#FFFBF8', border: '#F5EDE8',
    },
  }

  const config = statusConfig[status]
  const isClickable = scheduledAt !== null

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      className="flex w-full items-center gap-3 rounded-[16px] border p-3 text-left transition-colors"
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        borderWidth: isActive ? '1.5px' : '1px',
        cursor: isClickable ? 'pointer' : 'default',
      }}
      disabled={!isClickable}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
        style={{ backgroundColor: config.circleBg, color: config.iconColor }}
      >
        {config.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate" style={{ color: status === 'non_planifie' ? '#A0A0A0' : '#2D2D2D' }}>
          Séance {sessionNumber}
        </p>
        <p className="text-[11.5px]" style={{ color: scheduledAt ? '#7A7A7A' : '#C4B8AE' }}>
          {scheduledAt ? formatDateFR(scheduledAt) : 'Non planifiée'}
        </p>
        {status === 'redige' && note?.updated_at && (
          <p className="text-[11px]" style={{ color: '#A0A0A0' }}>
            Rédigé le {formatDateFR(note.updated_at)}
          </p>
        )}
        {status === 'en_cours' && (
          <p className="text-[11px] font-medium" style={{ color: '#F28C5A' }}>
            En cours de rédaction
          </p>
        )}
      </div>
      <span
        className="shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
        style={{ backgroundColor: config.badgeBg, color: config.badgeColor }}
      >
        {config.badgeText}
      </span>
      {isClickable && (
        <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#C4B8AE' }} />
      )}
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
  const [notes, setNotes] = useState<Record<number, SessionNote>>({})
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState(1)
  const [editFields, setEditFields] = useState<StructuredNote>({
    objectifs: '', contenu: '', observations: '', actions: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  // Build a full list of 6 sessions, merging with provided data
  const allSessions = Array.from({ length: TOTAL_SESSIONS }, (_, i) => {
    const num = i + 1
    const match = sessions.find((s) => s.session_number === num)
    return {
      session_number: num,
      scheduled_at: match?.scheduled_at ?? null,
    }
  })

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

        const map: Record<number, SessionNote> = {}
        for (const item of data) {
          if (item.content && item.content.length > 0) {
            map[item.session_number] = {
              content: item.content,
              structured: parseStructured(item.content),
              updated_at: item.updated_at,
            }
          }
        }
        setNotes(map)

        // Set active session to first planned session that has notes or the first planned
        const firstPlanned = allSessions.find((s) => s.scheduled_at !== null)
        if (firstPlanned) setActiveSession(firstPlanned.session_number)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
    return () => controller.abort()
  }, [beneficiaryId])

  // Load edit fields when active session changes
  useEffect(() => {
    const note = notes[activeSession]
    if (note?.structured) {
      setEditFields(note.structured)
    } else if (note?.content) {
      setEditFields(parseStructured(note.content))
    } else {
      setEditFields({ objectifs: '', contenu: '', observations: '', actions: '' })
    }
  }, [activeSession, notes])

  // Save handler
  const handleSave = useCallback(async () => {
    const content = serializeStructured(editFields)
    if (content.replace(/\n---\n/g, '').trim().length === 0) return

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

      const now = new Date()
      setNotes((prev) => ({
        ...prev,
        [activeSession]: {
          content,
          structured: { ...editFields },
          updated_at: now.toISOString(),
        },
      }))
      setLastSaved(now)
      setToastMessage('Compte-rendu enregistré avec succès')
    } catch {
      setToastMessage('Erreur lors de l\u2019enregistrement')
    } finally {
      setIsSaving(false)
    }
  }, [beneficiaryId, activeSession, editFields])

  // PDF export
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
      setToastMessage('PDF téléchargé avec succès')
    } catch {
      setToastMessage('Erreur lors de l\u2019export PDF')
    } finally {
      setIsExporting(false)
    }
  }, [beneficiaryId])

  const currentSession = allSessions[activeSession - 1]
  const isPlanned = currentSession?.scheduled_at !== null
  const writtenCount = Object.keys(notes).length

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* ============ LEFT COLUMN — Session Form ============ */}
      <div
        className="min-w-0 flex-1 rounded-[18px] p-6"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 3px 16px rgba(0, 0, 0, 0.09)',
        }}
      >
        {/* Session selector tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {allSessions.map((s) => {
            const isActive2 = s.session_number === activeSession
            const isDisabled = !s.scheduled_at && !notes[s.session_number]
            return (
              <button
                key={s.session_number}
                onClick={() => !isDisabled && setActiveSession(s.session_number)}
                className="rounded-full px-4 py-2 text-[12.5px] font-medium transition-colors"
                disabled={isDisabled}
                style={
                  isActive2
                    ? { backgroundColor: '#2A7FD4', color: '#FFFFFF', fontWeight: 700 }
                    : isDisabled
                      ? { backgroundColor: '#F5EDE8', color: '#C4B8AE', opacity: 0.5 }
                      : { backgroundColor: '#F5EDE8', color: '#7A7A7A' }
                }
              >
                Séance {s.session_number}
              </button>
            )
          })}
        </div>

        {/* Session title & date */}
        <h3 className="text-[17px] font-bold" style={{ color: '#2D2D2D' }}>
          Séance {activeSession}
        </h3>
        {currentSession?.scheduled_at && (
          <p className="mt-1 text-[13px]" style={{ color: '#7A7A7A' }}>
            {formatDateFR(currentSession.scheduled_at)}
          </p>
        )}

        {/* 4 structured textareas */}
        {isPlanned ? (
          <div className="mt-5 space-y-5">
            {STRUCTURED_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  className="mb-1.5 block text-[13px] font-semibold"
                  style={{ color: '#4A4A4A' }}
                >
                  {field.label}
                </label>
                <textarea
                  value={editFields[field.key]}
                  onChange={(e) => {
                    const total = Object.values({ ...editFields, [field.key]: e.target.value }).join('').length
                    if (total <= MAX_CHARACTERS) {
                      setEditFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                  }}
                  rows={field.rows}
                  placeholder={`Saisissez ${field.label.toLowerCase()}…`}
                  className="w-full rounded-[16px] border p-4 text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[#2A7FD4] resize-y"
                  style={{
                    backgroundColor: '#FFFBF8',
                    borderColor: '#F0E0D4',
                    color: '#4A4A4A',
                  }}
                />
              </div>
            ))}

            {/* Autosave indicator */}
            {lastSaved && (
              <p className="text-[12px]" style={{ color: '#4CAF82' }}>
                ✓ Sauvegardé {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-full border px-5 py-2 text-[13.5px] font-medium transition-colors hover:bg-[#F5EDE8] disabled:opacity-50"
                style={{ borderColor: '#D4C4B8', color: '#4A4A4A' }}
              >
                {isSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-full px-5 py-2 text-[13.5px] font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#2A7FD4' }}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Export…' : 'Exporter PDF'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className="mt-5 flex flex-col items-center justify-center rounded-[16px] border border-dashed py-12 text-center"
            style={{ borderColor: '#E8DDD5', backgroundColor: '#F9F5F2' }}
          >
            <AlertCircle className="mb-2 h-8 w-8" style={{ color: '#C4B8AE' }} />
            <p className="text-sm" style={{ color: '#A09088' }}>
              Séance non planifiée. Planifiez-la d&apos;abord pour pouvoir rédiger un compte-rendu.
            </p>
          </div>
        )}

        {/* Confidentiality notice */}
        <div
          className="mt-5 flex items-center gap-2 rounded-[16px] border px-4 py-3"
          style={{ backgroundColor: '#FFF5EE', borderColor: '#F5DFD0' }}
        >
          <Lock className="h-4 w-4 shrink-0" style={{ color: '#A09088' }} />
          <p className="text-[11.5px]" style={{ color: '#7A7A7A' }}>
            Ces comptes-rendus sont confidentiels et ne sont pas visibles par le bénéficiaire.
          </p>
        </div>
      </div>

      {/* ============ RIGHT COLUMN — Session History ============ */}
      <div
        className="hidden w-[380px] shrink-0 rounded-[18px] p-5 lg:block"
        style={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 3px 16px rgba(0, 0, 0, 0.09)',
        }}
      >
        <h3 className="mb-4 text-[15px] font-bold" style={{ color: '#2D2D2D' }}>
          Historique des séances
        </h3>

        <div className="space-y-2">
          {allSessions.map((s) => {
            const note = notes[s.session_number]
            const status = getSessionStatus(s.session_number, s.scheduled_at, note, activeSession)
            return (
              <SessionHistoryCard
                key={s.session_number}
                sessionNumber={s.session_number}
                scheduledAt={s.scheduled_at}
                note={note}
                isActive={s.session_number === activeSession}
                status={status}
                onClick={() => setActiveSession(s.session_number)}
              />
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-5">
          <p className="mb-2 text-[11.5px] font-semibold" style={{ color: '#7A7A7A' }}>
            Légende :
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: '#ECFDF5', borderColor: '#4CAF82' }}
              />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>Rédigé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: '#FFF7ED', borderColor: '#F28C5A' }}
              />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>À rédiger</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: '#F5EDE8', borderColor: '#D4C4B8' }}
              />
              <span className="text-[10.5px]" style={{ color: '#7A7A7A' }}>Non planifié</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  )
}
