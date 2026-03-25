'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'
import { FileText, Download, ExternalLink } from 'lucide-react'

interface PhaseDocument {
  id: string
  phase_number: number
  display_name: string
  file_type: 'pdf' | 'docx'
  sort_order: number
}

const PHASE_LABELS = [
  'Phase 1 — Entretien préliminaire',
  'Phase 2 — Investigation (aptitudes)',
  'Phase 3 — Investigation (motivations)',
  'Phase 4 — Investigation (compétences)',
  'Phase 5 — Conclusions',
  'Phase 6 — Suivi à 6 mois',
]

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<PhaseDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const res = await fetch('/api/documents')
        if (res.ok) {
          const json = await res.json()
          setDocuments(json.data ?? [])
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleDownload = async (doc: PhaseDocument) => {
    setDownloading(doc.id)
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      if (json.data?.url) {
        window.open(json.data.url, '_blank')
      }
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
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

  const phases = Array.from({ length: 6 }, (_, i) => i + 1)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">
          Documents du bilan
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Retrouvez les documents mis à votre disposition pour chaque phase
        </p>
      </div>

      <div className="space-y-6">
        {phases.map((phase) => {
          const phaseDocs = documents
            .filter((d) => d.phase_number === phase)
            .sort((a, b) => a.sort_order - b.sort_order)

          return (
            <Card key={phase}>
              <div className="px-5 py-4 border-b border-[var(--color-border)] bg-gray-50/50">
                <h2 className="text-sm font-semibold text-[var(--color-primary-dark)]">
                  {PHASE_LABELS[phase - 1]}
                </h2>
              </div>
              {phaseDocs.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-[var(--color-text-muted)]">
                  Aucun document disponible pour cette phase.
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border)]">
                  {phaseDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase ${
                          doc.file_type === 'pdf'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {doc.file_type}
                      </div>
                      <span className="flex-1 text-sm text-[var(--color-text)]">
                        {doc.display_name}
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 disabled:opacity-50 transition-colors"
                      >
                        {downloading === doc.id ? (
                          'Chargement...'
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Télécharger
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
