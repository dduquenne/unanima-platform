'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Button, Card, Modal, Spinner } from '@unanima/core'
import { DataTable, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Document } from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const TYPE_CONFIG: Record<Document['type'], StatusConfig> = {
  cv: { label: 'CV', color: 'primary' },
  lettre_motivation: { label: 'Lettre de motivation', color: 'info' },
  synthese: { label: 'Synthèse', color: 'success' },
  attestation: { label: 'Attestation', color: 'warning' },
  autre: { label: 'Autre', color: 'secondary' as 'info' },
}

const ALLOWED_EXTENSIONS = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
const MAX_SIZE_MB = 10

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DocumentsPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const canUpload = user?.role === 'consultant' || user?.role === 'super_admin' || user?.role === 'beneficiaire'

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/documents?limit=50')
      if (!res.ok) throw new Error('Erreur lors du chargement')
      const json = await res.json()
      setDocuments(json.data ?? [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) fetchDocuments()
  }, [authLoading, fetchDocuments])

  const handleDownload = async (doc: Document) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`)
      if (!res.ok) throw new Error('Erreur de téléchargement')
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      // silent fail
    }
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Supprimer « ${doc.nom} » ?`)) return
    try {
      const res = await fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
      }
    } catch {
      // silent fail
    }
  }

  const columns: ColumnDef<Document>[] = [
    { key: 'nom', header: 'Nom', sortable: true },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row) => (
        <StatusBadge status={row.type} statusConfig={TYPE_CONFIG} />
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (row) =>
        new Date(row.created_at).toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleDownload(row)
            }}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Télécharger
          </button>
          {canUpload && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(row)
              }}
              className="text-sm text-[var(--color-danger)] hover:underline"
            >
              Supprimer
            </button>
          )}
        </div>
      ),
    },
  ]

  // --- Drag & Drop zone handlers ---

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setShowUploadModal(true)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div
      className="space-y-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Documents</h2>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)}>Ajouter un document</Button>
        )}
      </div>

      {isDragging && (
        <div className="rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary)]/5 p-12 text-center">
          <p className="text-sm font-medium text-[var(--color-primary)]">
            Déposez votre fichier ici
          </p>
        </div>
      )}

      {error && (
        <Card padding="md">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
        </Card>
      )}

      {documents.length === 0 && !error ? (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">Aucun document</p>
            {canUpload && (
              <Button variant="outline" onClick={() => setShowUploadModal(true)}>
                Ajouter un document
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <DataTable columns={columns} data={documents} pageSize={20} />
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => {
            setShowUploadModal(false)
            fetchDocuments()
          }}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Upload Modal
// ---------------------------------------------------------------------------

function UploadModal({
  onClose,
  onUploaded,
}: {
  onClose: () => void
  onUploaded: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [beneficiaireId, setBeneficiaireId] = useState('')
  const [docType, setDocType] = useState<string>('autre')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setUploadError(null)
  }

  function handleDropInModal(e: React.DragEvent) {
    e.preventDefault()
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      setUploadError(null)
    }
  }

  async function handleUpload() {
    if (!file || !beneficiaireId) return

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Le fichier dépasse ${MAX_SIZE_MB} Mo`)
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('beneficiaire_id', beneficiaireId)
      formData.append('type', docType)

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Erreur lors de l\'upload')
      }

      onUploaded()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Modal open title="Ajouter un document" onClose={onClose}>
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropInModal}
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] p-8 text-center transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
        >
          {file ? (
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">{file.name}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {(file.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[var(--color-text-secondary,var(--color-text))]">
                Glissez-déposez un fichier ici ou cliquez pour sélectionner
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                PDF, DOC, DOCX, JPG, PNG — max {MAX_SIZE_MB} Mo
              </p>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Beneficiaire ID */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-text)]">
            ID bénéficiaire <span className="text-[var(--color-danger)]">*</span>
          </label>
          <input
            type="text"
            value={beneficiaireId}
            onChange={(e) => setBeneficiaireId(e.target.value)}
            placeholder="UUID du bénéficiaire"
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
          />
        </div>

        {/* Document type */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--color-text)]">
            Type de document
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]/20"
          >
            <option value="cv">CV</option>
            <option value="lettre_motivation">Lettre de motivation</option>
            <option value="synthese">Synthèse</option>
            <option value="attestation">Attestation</option>
            <option value="autre">Autre</option>
          </select>
        </div>

        {uploadError && (
          <p className="text-sm text-[var(--color-danger)]">{uploadError}</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Annuler
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !beneficiaireId || isUploading}
          >
            {isUploading ? 'Upload en cours...' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
