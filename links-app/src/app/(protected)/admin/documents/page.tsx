'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth, useRequireRole } from '@/lib/auth'
import {
  Upload,
  FileText,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  AlertTriangle,
  CloudUpload,
} from 'lucide-react'
import { TOTAL_PHASES, PHASE_DESCRIPTIONS } from '@/config/phases.config'

// ── Types ───────────────────────────────────────────────────────────────────

interface PhaseDocument {
  id: string
  phase_number: number
  display_name: string
  file_type: 'pdf' | 'docx'
  sort_order: number
  file_size?: number
  created_at?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
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
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDisplayName, setUploadDisplayName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setUploadFile(null)
      setUploadDisplayName('')
      fetchDocuments()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur inconnue.')
    } finally {
      setUploading(false)
    }
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
      setUploadFile(file)
      setUploadDisplayName(file.name.replace(/\.(pdf|docx)$/i, ''))
    }
  }, [])

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

  const totalDocCount = allDocuments.length
  const totalSize = allDocuments.reduce((sum, d) => sum + (d.file_size ?? 0), 0)

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-[14px] shadow-lg text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-[#22C55E] text-white'
              : 'bg-[#E8553D] text-white'
          }`}
        >
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#2C2017]">
          Gestion des documents
        </h1>
        <p className="text-[13px] text-[#A0927E] mt-1">
          Gérez les documents disponibles pour chaque phase du bilan
        </p>
      </div>

      {/* Phase tabs */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: TOTAL_PHASES }, (_, idx) => {
          const phase = idx + 1
          const count = phaseDocCount(phase)
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
                activePhase === phase
                  ? 'bg-[#2A7FD4] text-white'
                  : 'bg-[#FFF0E8] text-[#7B6B5A] hover:bg-[#FDEBD5]'
              }`}
            >
              Phase {phase}
              <span className="ml-1.5 text-[11px] opacity-80">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-5">
          {/* Upload zone */}
          <form onSubmit={handleUpload}>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-[18px] border-2 border-dashed p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-[#2A7FD4] bg-[#E8F4FD]'
                  : 'border-[#F2D5C4] bg-white hover:border-[#F28C5A]/50'
              }`}
              style={{ boxShadow: '0 2px 10px rgba(212,165,116,0.08)' }}
            >
              <CloudUpload className="mx-auto h-10 w-10 text-[#2A7FD4]" />
              <p className="mt-3 text-[14px] font-medium text-[#2C2017]">
                Glissez vos fichiers ici ou{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#2A7FD4] underline hover:text-[#1A6BBF]"
                >
                  Parcourir
                </button>
              </p>
              <p className="mt-1.5 text-[12px] text-[#A0927E]">
                PDF ou DOCX · Max 10 Mo · 3 documents max par phase
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setUploadFile(file)
                    setUploadDisplayName(file.name.replace(/\.(pdf|docx)$/i, ''))
                  }
                }}
                className="hidden"
              />

              {/* File selected */}
              {uploadFile && (
                <div className="mx-auto mt-4 max-w-sm space-y-3">
                  <div className="flex items-center gap-2 rounded-[12px] bg-[#FFF8F5] px-3 py-2">
                    <FileText className="h-4 w-4 text-[#F28C5A]" />
                    <span className="flex-1 truncate text-[12px] font-medium text-[#2C2017]">
                      {uploadFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setUploadFile(null); setUploadDisplayName('') }}
                      className="text-[#A0927E] hover:text-[#2C2017]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={uploadDisplayName}
                    onChange={(e) => setUploadDisplayName(e.target.value)}
                    placeholder="Nom d'affichage du document"
                    className="w-full rounded-[12px] border border-[#F2D5C4] bg-white px-3 py-2 text-[13px] text-[#2C2017] placeholder:text-[#C4AA90] outline-none focus:border-[#2A7FD4] focus:ring-2 focus:ring-[#2A7FD4]/20"
                  />
                  {uploadError && (
                    <div className="flex items-center gap-2 rounded-[10px] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#E8553D]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      {uploadError}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={uploading || phaseDocCount(activePhase) >= 3}
                    className="w-full rounded-full bg-[#2A7FD4] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#1A6BBF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? 'Envoi en cours...' : 'Ajouter le document'}
                  </button>
                </div>
              )}

              {/* Counter badge */}
              <div className="mt-4 inline-flex items-center rounded-full bg-[#FFF0E8] px-3 py-1 text-[11px] font-semibold text-[#F28C5A]">
                {phaseDocCount(activePhase)}/3 documents pour cette phase
              </div>
            </div>
          </form>

          {/* Document list */}
          <div
            className="overflow-hidden rounded-[18px] bg-white"
            style={{ boxShadow: '0 2px 10px rgba(212,165,116,0.1)' }}
          >
            <div className="border-b border-[#F5E6DB] bg-[#FFF8F2] px-5 py-3">
              <h2 className="text-[14px] font-bold text-[#2C2017]">
                Phase {activePhase} — {PHASE_DESCRIPTIONS[activePhase]}
              </h2>
            </div>

            {documents.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <FileText className="mx-auto h-10 w-10 text-[#E8D5CA]" />
                <p className="mt-3 text-[13px] text-[#A0927E]">Aucun document pour cette phase.</p>
                <p className="mt-1 text-[11px] text-[#C4AA90]">
                  Ajoutez jusqu{"'"}à 3 documents (.pdf ou .docx, max 10 Mo).
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#F5E6DB]">
                {documents.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[#FFF8F5]"
                  >
                    {/* Drag handle */}
                    <GripVertical className="h-4 w-4 shrink-0 text-[#E8D5CA]" />

                    {/* File type badge */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-bold uppercase ${
                        doc.file_type === 'pdf'
                          ? 'bg-[#FEF2F2] text-[#DC2626]'
                          : 'bg-[#E8F4FD] text-[#2A7FD4]'
                      }`}
                    >
                      {doc.file_type}
                    </div>

                    {/* Name + size */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#2C2017]">
                        {doc.display_name}
                      </p>
                      <p className="text-[11px] text-[#A0927E]">
                        {formatFileSize(doc.file_size)} · Position {idx + 1}
                      </p>
                    </div>

                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorder(doc.id, 'up')}
                        disabled={idx === 0}
                        className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#F2D5C4] text-[#8B7B6B] transition-colors hover:bg-[#FFF8F5] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Monter"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorder(doc.id, 'down')}
                        disabled={idx === documents.length - 1}
                        className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#F2D5C4] text-[#8B7B6B] transition-colors hover:bg-[#FFF8F5] disabled:cursor-not-allowed disabled:opacity-30"
                        title="Descendre"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => setDeletingDoc(doc)}
                      className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full border border-[#E8553D]/20 text-[#E8553D] transition-colors hover:bg-[#FEF2F2]"
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Phase summary ═══ */}
        <div
          className="h-fit rounded-[18px] bg-white p-5"
          style={{ boxShadow: '0 2px 10px rgba(212,165,116,0.1)' }}
        >
          <h3 className="mb-4 text-[14px] font-bold text-[#2C2017]">
            Résumé par phase
          </h3>
          <div className="space-y-3">
            {Array.from({ length: TOTAL_PHASES }, (_, idx) => {
              const phase = idx + 1
              const count = phaseDocCount(phase)
              const isActive = phase === activePhase
              return (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase)}
                  className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-[#E8F4FD]' : 'hover:bg-[#FFF8F5]'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      count > 0
                        ? isActive
                          ? 'bg-[#2A7FD4] text-white'
                          : 'bg-[#ECFDF5] text-[#22C55E]'
                        : 'bg-[#FFF0E8] text-[#C4AA90]'
                    }`}
                  >
                    {phase}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-semibold ${isActive ? 'text-[#2A7FD4]' : 'text-[#2C2017]'}`}>
                      Phase {phase}
                    </p>
                    <p className="text-[11px] text-[#A0927E]">
                      {count} document{count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Total */}
          <div className="mt-4 border-t border-[#F5E6DB] pt-4">
            <p className="text-[12px] font-bold text-[#2C2017]">
              Total : {totalDocCount} document{totalDocCount !== 1 ? 's' : ''}
            </p>
            {totalSize > 0 && (
              <p className="text-[11px] text-[#A0927E]">
                {formatFileSize(totalSize)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ═══ DELETE CONFIRMATION MODAL ═══ */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeletingDoc(null)} />
          <div className="relative w-full max-w-sm mx-4 rounded-[18px] bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2]">
              <Trash2 className="h-6 w-6 text-[#E8553D]" />
            </div>
            <h3 className="text-[16px] font-bold text-[#2C2017] mb-2">
              Supprimer ce document ?
            </h3>
            <p className="text-[13px] text-[#7B6B5A] mb-6">
              « {deletingDoc.display_name} » sera supprimé définitivement.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingDoc(null)}
                className="rounded-full border border-[#F2D5C4] bg-white px-5 py-2 text-[13px] font-semibold text-[#7B6B5A] transition-colors hover:bg-[#FFF8F5]"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-[#E8553D] px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#D4432D] disabled:opacity-50"
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
