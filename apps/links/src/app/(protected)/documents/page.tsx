'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@unanima/auth'
import { Download, Info } from 'lucide-react'
import { PHASE_LABELS, TOTAL_PHASES } from '@/config/phases.config'

interface PhaseDocument {
  id: string
  phase_number: number
  display_name: string
  file_type: 'pdf' | 'docx'
  sort_order: number
}

interface PhaseValidation {
  phase_number: number
  status: 'libre' | 'en_cours' | 'validee'
}

const STATUS_CONFIG = {
  validee: {
    label: 'Phase validée',
    badge: 'bg-[#E6F4EA] text-[var(--color-success)]',
    accent: 'var(--color-success)',
  },
  en_cours: {
    label: 'En cours',
    badge: 'bg-[#FFF3E0] text-[var(--color-accent)]',
    accent: 'var(--color-accent)',
  },
  libre: {
    label: 'À venir',
    badge: 'bg-[#F5F0EB] text-[var(--color-text-muted)]',
    accent: '#CBD5E0',
  },
} as const

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<PhaseDocument[]>([])
  const [phases, setPhases] = useState<PhaseValidation[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [docsRes, phasesRes] = await Promise.allSettled([
        fetch('/api/documents').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/phase-validations').then((r) => (r.ok ? r.json() : null)),
      ])

      if (docsRes.status === 'fulfilled' && docsRes.value?.data) {
        setDocuments(docsRes.value.data)
      }
      if (phasesRes.status === 'fulfilled' && phasesRes.value?.data) {
        setPhases(phasesRes.value.data)
      }
      setLoading(false)
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

  return (
    <div className="mx-auto max-w-[920px] space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--color-text)]">
          Documents de mon bilan
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Retrouvez ici les documents mis à disposition par votre consultante pour
          chaque phase.
        </p>
      </div>

      {/* Phase sections */}
      {Array.from({ length: TOTAL_PHASES }, (_, i) => i + 1).map((phaseNum) => {
        const phaseData = phases.find((p) => p.phase_number === phaseNum)
        const status = phaseData?.status ?? 'libre'
        const config = STATUS_CONFIG[status]
        const phaseDocs = documents
          .filter((d) => d.phase_number === phaseNum)
          .sort((a, b) => a.sort_order - b.sort_order)

        return (
          <div
            key={phaseNum}
            className="relative overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]"
          >
            {/* Left accent bar */}
            <div
              className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]"
              style={{ backgroundColor: config.accent }}
            />

            {/* Phase header */}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-bold text-[var(--color-text)]">
                  Phase {phaseNum}
                </span>
                <span className="text-[15px] text-[var(--color-text-secondary)]">
                  — {PHASE_LABELS[phaseNum]}
                </span>
              </div>
              <span
                className={`rounded-[13px] px-3 py-1 text-[11px] font-semibold ${config.badge}`}
              >
                {config.label}
              </span>
            </div>

            <div className="mx-6 border-t border-[var(--color-border-light)]" />

            {/* Documents or empty state */}
            {phaseDocs.length === 0 ? (
              <div className="px-6 py-4">
                <p className="text-[13px] italic text-[var(--color-text-muted)]">
                  Aucun document disponible pour cette phase.
                </p>
              </div>
            ) : (
              <div className="space-y-2 px-6 py-3">
                {phaseDocs.map((doc) => {
                  const isPdf = doc.file_type === 'pdf'
                  return (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 rounded-[12px] px-3 py-2 ${
                        isPdf ? 'bg-[#FFF5F0]' : 'bg-[#F0F5FF]'
                      }`}
                    >
                      {/* Type badge */}
                      <span
                        className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] text-[9px] font-bold uppercase ${
                          isPdf
                            ? 'bg-[#FDDDD2] text-[#DC4A28]'
                            : 'bg-[#C7DDFB] text-[#2563EB]'
                        }`}
                      >
                        {doc.file_type}
                      </span>

                      {/* Name */}
                      <span className="flex-1 text-[13px] font-medium text-[var(--color-text)]">
                        {doc.display_name}
                      </span>

                      {/* Download button */}
                      <button
                        onClick={() => handleDownload(doc)}
                        disabled={downloading === doc.id}
                        className="shrink-0 rounded-[16px] bg-[var(--color-primary)] px-5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
                      >
                        {downloading === doc.id ? 'Chargement...' : 'Télécharger'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {/* Info banner */}
      <div className="flex items-center gap-3 rounded-[18px] border border-[#F2D6C4] bg-[#FFF5EE] px-5 py-3">
        <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-[var(--color-accent)] text-[13px] font-bold text-[var(--color-accent)]">
          i
        </span>
        <p className="text-xs text-[#7A5E48]">
          Les documents sont ajoutés par votre consultante au fil de votre parcours.
          Formats acceptés : PDF, DOCX (max 10 Mo).
        </p>
      </div>
    </div>
  )
}
