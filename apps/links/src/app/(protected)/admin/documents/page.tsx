'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Card } from '@unanima/core'
import {
  Upload,
  FileText,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { TOTAL_PHASES, PHASE_DESCRIPTIONS } from '@/config/phases.config'

// ── Types ───────────────────────────────────────────────────────────────────

interface PhaseDocument {
  id: string
  phase_number: number
  display_name: string
  file_type: 'pdf' | 'docx'
  sort_order: number
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminDocumentsPage() {
  const { user } = useAuth()
  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole('super_admin')

  const [activePhase, setActivePhase] = useState(1)
  const [documents, setDocuments] = useState<PhaseDocument[]>([])
  const [allDocuments, setAllDocuments] = useState<PhaseDocument[]>([])
  const [loading, setLoading] = useState(false)

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDisplayName, setUploadDisplayName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Delete state
  const [deletingDoc, setDeletingDoc] = useState<PhaseDocument | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/documents')
      if (!res.ok) throw new Error()
      const json = await res.json()
      setAllDocuments(json.data ?? [])
    } catch {
      showToast('error', 'Impossible de charger les documents.')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (isAuthorized && !isAuthLoading) fetchDocuments()
  }, [isAuthorized, isAuthLoading, fetchDocuments])

  useEffect(() => {
    setDocuments(
      allDocuments
        .filter((d) => d.phase_number === activePhase)
        .sort((a, b) => a.sort_order - b.sort_order),
    )
  }, [allDocuments, activePhase])

  // ── Upload handler ────────────────────────────────────────────────────────

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFile || !uploadDisplayName.trim()) return

    setUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('phase_number', String(activePhase))
      formData.append('display_name', uploadDisplayName.trim())

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errorJson = await res.json().catch(() => null)
        throw new Error(errorJson?.error ?? 'Erreur lors de l\'upload.')
      }

      showToast('success', 'Document ajouté avec succès.')
      setShowUploadModal(false)
      setUploadFile(null)
      setUploadDisplayName('')
      fetchDocuments()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setUploading(false)
    }
  }

  // ── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingDoc) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/documents/${deletingDoc.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      showToast('success', `"${deletingDoc.display_name}" supprimé.`)
      setDeletingDoc(null)
      fetchDocuments()
    } catch {
      showToast('error', 'Impossible de supprimer le document.')
    } finally {
      setDeleting(false)
    }
  }

  // ── Reorder handler ──────────────────────────────────────────────────────

  const handleReorder = async (docId: string, direction: 'up' | 'down') => {
    const idx = documents.findIndex((d) => d.id === docId)
    if (idx < 0) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= documents.length) return

    const doc = documents[idx]!
    const swapDoc = documents[swapIdx]!

    try {
      await Promise.all([
        fetch(`/api/documents/${doc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: swapDoc.sort_order }),
        }),
        fetch(`/api/documents/${swapDoc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: doc.sort_order }),
        }),
      ])
      fetchDocuments()
    } catch {
      showToast('error', 'Erreur lors du réordonnancement.')
    }
  }

  // ── Loading / Guard ──────────────────────────────────────────────────────

  if (isAuthLoading || !user || loading) {
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

  if (!isAuthorized) return null

  const phaseDocCount = (phase: number) =>
    allDocuments.filter((d) => d.phase_number === phase).length

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[var(--color-success)] text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">
            Gestion des documents
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Gérez les documents disponibles pour chaque phase du bilan
          </p>
        </div>
        <button
          onClick={() => {
            setUploadFile(null)
            setUploadDisplayName('')
            setUploadError(null)
            setShowUploadModal(true)
          }}
          disabled={phaseDocCount(activePhase) >= 3}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-4 h-4" />
          Ajouter un document
        </button>
      </div>

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: TOTAL_PHASES }, (_, idx) => {
          const phase = idx + 1
          const count = phaseDocCount(phase)
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activePhase === phase
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50'
              }`}
            >
              Phase {phase}
              <span
                className={`ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                  activePhase === phase
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Phase title */}
      <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
        {`Phase ${activePhase} — ${PHASE_DESCRIPTIONS[activePhase]}`}
      </h2>

      {/* Document list */}
      <Card>
        {documents.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)]">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Aucun document pour cette phase.</p>
            <p className="text-xs mt-1">
              Ajoutez jusqu{"'"}à 3 documents (.pdf ou .docx, max 10 Mo).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {documents.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${
                    doc.file_type === 'pdf'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {doc.file_type}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">
                    {doc.display_name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Position {idx + 1}
                  </p>
                </div>

                {/* Reorder buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(doc.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Monter"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(doc.id, 'down')}
                    disabled={idx === documents.length - 1}
                    className="p-1.5 rounded-md border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Descendre"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => setDeletingDoc(doc)}
                  className="p-1.5 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Limit info */}
        {documents.length > 0 && (
          <div className="px-5 py-3 border-t border-[var(--color-border)] bg-gray-50/50">
            <p className="text-xs text-[var(--color-text-muted)]">
              {documents.length}/3 documents · .pdf et .docx uniquement · Max 10 Mo
            </p>
          </div>
        )}
      </Card>

      {/* ================================================================== */}
      {/* UPLOAD MODAL                                                       */}
      {/* ================================================================== */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowUploadModal(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--color-border)]">
              <Upload className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Ajouter un document — Phase {activePhase}
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute right-4 top-4 p-1 rounded-md hover:bg-gray-100 text-[var(--color-text)]/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                  Nom d{"'"}affichage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadDisplayName}
                  onChange={(e) => setUploadDisplayName(e.target.value)}
                  placeholder="Ex : Guide d'entretien préliminaire"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-text)]/70 mb-1.5">
                  Fichier <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-[var(--color-text)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)]/10 file:text-[var(--color-primary)] hover:file:bg-[var(--color-primary)]/20"
                />
                <p className="mt-1 text-xs text-[var(--color-text)]/50">
                  .pdf ou .docx, max 10 Mo
                </p>
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {uploadError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Envoi...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* DELETE CONFIRMATION MODAL                                           */}
      {/* ================================================================== */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingDoc(null)} />
          <div className="relative w-full max-w-sm mx-4 bg-white rounded-xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              Supprimer ce document ?
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              « {deletingDoc.display_name} » sera supprimé définitivement du stockage et de la base de données.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
