'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ChevronUp,
  ChevronDown,
  Download,
  Save,
  X,
  FileText,
  Check,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionNote {
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
const MAX_CHARACTERS = 10_000

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

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------

function Toast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#28A745] px-4 py-3 text-sm font-medium text-white shadow-lg">
      <Check className="h-4 w-4" />
      {message}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Session Card
// ---------------------------------------------------------------------------

function SessionCard({
  sessionNumber,
  scheduledAt,
  note,
  isExpanded,
  isEditing,
  editContent,
  onToggleExpand,
  onStartEdit,
  onCancelEdit,
  onSave,
  onEditContentChange,
  isSaving,
}: {
  sessionNumber: number
  scheduledAt: string | null
  note: SessionNote | undefined
  isExpanded: boolean
  isEditing: boolean
  editContent: string
  onToggleExpand: () => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onEditContentChange: (value: string) => void
  isSaving: boolean
}) {
  const isPlanned = scheduledAt !== null
  const isWritten = note !== undefined && note.content.length > 0
  const canEdit = isPlanned

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer"
        onClick={onToggleExpand}
      >
        {/* Session number circle */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            isPlanned
              ? 'bg-[#1E6FC0] text-white'
              : 'bg-[#DCE1EB] text-[#9CAABB]'
          }`}
        >
          {sessionNumber}
        </div>

        {/* Title + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-[var(--color-text)]">
              Seance {sessionNumber}
            </span>
            {isPlanned ? (
              <span className="text-sm text-[#6B7A8D]">
                {formatDateFR(scheduledAt)}
              </span>
            ) : (
              <span className="text-sm italic text-[#9CAABB]">
                A planifier
              </span>
            )}
          </div>
          {/* Excerpt when collapsed and written */}
          {!isExpanded && isWritten && (
            <p className="mt-1 text-sm text-[#6B7A8D] truncate">
              {truncateText(note.content, 120)}
            </p>
          )}
        </div>

        {/* Status badge */}
        {isPlanned && (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              isWritten
                ? 'bg-[#D4EDDA] text-[#28A745]'
                : 'bg-[#F0F1F3] text-[#6B7A8D]'
            }`}
          >
            {isWritten ? 'Redige' : 'Non redige'}
          </span>
        )}

        {/* Chevron */}
        <button
          className="shrink-0 text-[#9CAABB] hover:text-[var(--color-text)] transition-colors"
          aria-label={isExpanded ? 'Replier' : 'Deplier'}
        >
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {/* Edit / Write button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (canEdit && !isEditing) onStartEdit()
          }}
          disabled={!canEdit || isEditing}
          className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            !canEdit || isEditing
              ? 'bg-[#E8ECF0] text-[#B0BAC8] cursor-not-allowed'
              : 'border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
          }`}
        >
          {isWritten ? 'Modifier' : 'Rediger'}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border)] px-5 py-4">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARACTERS) {
                    onEditContentChange(e.target.value)
                  }
                }}
                rows={8}
                placeholder="Redigez le compte-rendu de la seance..."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[#F9FAFB] p-4 text-sm text-[var(--color-text)] placeholder-[#9CAABB] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] resize-y"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9CAABB]">
                  {editContent.length.toLocaleString('fr-FR')} / {MAX_CHARACTERS.toLocaleString('fr-FR')} caracteres
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={onCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[#6B7A8D] hover:bg-[#F0F1F3] transition-colors disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    onClick={onSave}
                    disabled={isSaving || editContent.trim().length === 0}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>
          ) : isWritten ? (
            <div className="rounded-lg bg-[#F9FAFB] border border-[var(--color-border)] p-4">
              <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap">
                {note.content}
              </p>
              {note.updated_at && (
                <p className="mt-3 text-xs text-[#9CAABB]">
                  Derniere modification : {formatDateFR(note.updated_at)}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-8 text-center">
              <FileText className="h-8 w-8 text-[#D1D5DB] mb-2" />
              <p className="text-sm text-[#9CAABB]">
                {isPlanned
                  ? 'Aucun compte-rendu redige pour cette seance.'
                  : 'Seance non planifiee.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
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
  const [expandedSession, setExpandedSession] = useState<number | null>(null)
  const [editingSession, setEditingSession] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

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
              updated_at: item.updated_at,
            }
          }
        }
        setNotes(map)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        // Silently fail — notes will appear empty
      } finally {
        setLoading(false)
      }
    }

    fetchNotes()
    return () => controller.abort()
  }, [beneficiaryId])

  // Handlers
  const handleToggleExpand = useCallback(
    (sessionNumber: number) => {
      setExpandedSession((prev) =>
        prev === sessionNumber ? null : sessionNumber
      )
    },
    []
  )

  const handleStartEdit = useCallback(
    (sessionNumber: number) => {
      setEditingSession(sessionNumber)
      setExpandedSession(sessionNumber)
      setEditContent(notes[sessionNumber]?.content ?? '')
    },
    [notes]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingSession(null)
    setEditContent('')
  }, [])

  const handleSave = useCallback(
    async (sessionNumber: number) => {
      if (editContent.trim().length === 0) return

      try {
        setIsSaving(true)
        const res = await fetch('/api/consultant/session-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            beneficiary_id: beneficiaryId,
            session_number: sessionNumber,
            content: editContent.trim(),
          }),
        })

        if (!res.ok) throw new Error(`Erreur ${res.status}`)

        setNotes((prev) => ({
          ...prev,
          [sessionNumber]: {
            content: editContent.trim(),
            updated_at: new Date().toISOString(),
          },
        }))

        setEditingSession(null)
        setEditContent('')
        setToastMessage('Compte-rendu enregistre avec succes')
      } catch {
        setToastMessage('Erreur lors de l\'enregistrement')
      } finally {
        setIsSaving(false)
      }
    },
    [beneficiaryId, editContent]
  )

  const [isExporting, setIsExporting] = useState(false)

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
      setToastMessage('Erreur lors de l\'export PDF')
    } finally {
      setIsExporting(false)
    }
  }, [beneficiaryId])

  // Count written sessions
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
    <div>
      {/* Header with export button */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
          Comptes-rendus de seances
        </h2>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-lg border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? 'Export en cours...' : 'Exporter en PDF'}
        </button>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {allSessions.map((session) => (
          <SessionCard
            key={session.session_number}
            sessionNumber={session.session_number}
            scheduledAt={session.scheduled_at}
            note={notes[session.session_number]}
            isExpanded={expandedSession === session.session_number}
            isEditing={editingSession === session.session_number}
            editContent={
              editingSession === session.session_number ? editContent : ''
            }
            onToggleExpand={() => handleToggleExpand(session.session_number)}
            onStartEdit={() => handleStartEdit(session.session_number)}
            onCancelEdit={handleCancelEdit}
            onSave={() => handleSave(session.session_number)}
            onEditContentChange={setEditContent}
            isSaving={isSaving}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-text)]">
            {writtenCount} / {TOTAL_SESSIONS} seances redigees
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              writtenCount === TOTAL_SESSIONS
                ? 'bg-[#D4EDDA] text-[#28A745]'
                : 'bg-[#F0F1F3] text-[#6B7A8D]'
            }`}
          >
            {writtenCount === TOTAL_SESSIONS ? 'Complet' : 'En cours'}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-success)] transition-all duration-300"
            style={{
              width: `${Math.round((writtenCount / TOTAL_SESSIONS) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
