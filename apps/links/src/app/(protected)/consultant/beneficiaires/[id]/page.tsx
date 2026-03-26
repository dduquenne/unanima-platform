'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ComptesRendusTab } from './comptes-rendus'
import { PlanificationTab } from './planification'
import { PHASE_LABELS } from '@/config/phases.config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BeneficiaireProfile {
  id: string
  full_name: string
  email: string
  started_at: string
  status: 'en_cours' | 'termine'
}

interface Question {
  id: string
  number: number
  label: string
  description?: string
}

interface Response {
  question_id: string
  text: string | null
}

interface Phase {
  number: number
  label: string
  status: 'validated' | 'active' | 'locked'
  questions: Question[]
  responses: Response[]
}

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
}

interface BeneficiaireData {
  profile: BeneficiaireProfile
  phases: Phase[]
  sessions: SessionData[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


type TabKey = 'reponses' | 'planification' | 'comptes-rendus'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'reponses', label: 'Réponses' },
  { key: 'planification', label: 'Planification' },
  { key: 'comptes-rendus', label: 'Comptes-rendus' },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
    </div>
  )
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <nav className="mb-6 text-sm text-[#6B7280]">
      <Link href="/consultant" className="hover:text-[var(--color-primary)] transition-colors">
        Tableau de bord
      </Link>
      <span className="mx-2">{'>'}</span>
      <span className="text-[var(--color-text)]">{name}</span>
    </nav>
  )
}

function StatusBadge({ status }: { status: 'en_cours' | 'termine' }) {
  const isTermine = status === 'termine'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isTermine
          ? 'bg-[#D1FAE5] text-[#065F46]'
          : 'bg-[#FEF3C7] text-[#92400E]'
      }`}
    >
      {isTermine ? 'Termine' : 'En cours'}
    </span>
  )
}

function ProgressBar({
  validated,
  total,
}: {
  validated: number
  total: number
}) {
  const pct = total > 0 ? Math.round((validated / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-success)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-[#6B7280]">
        {validated}/{total} phases
      </span>
    </div>
  )
}

function PhaseIndicators({ phases }: { phases: Phase[] }) {
  return (
    <div className="flex gap-1.5">
      {phases.map((p) => (
        <div
          key={p.number}
          className={`h-2 w-6 rounded-full ${
            p.status === 'validated'
              ? 'bg-[var(--color-success)]'
              : p.status === 'active'
                ? 'bg-[var(--color-primary)]'
                : 'bg-[var(--color-border)]'
          }`}
          title={`Phase ${p.number} — ${PHASE_LABELS[p.number]}`}
        />
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Header Card
// ---------------------------------------------------------------------------

function HeaderCard({
  profile,
  phases,
  validatedCount,
}: {
  profile: BeneficiaireProfile
  phases: Phase[]
  validatedCount: number
}) {
  return (
    <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
          {getInitials(profile.full_name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-bold text-[var(--color-primary-dark)]">
              {profile.full_name}
            </h1>
            <StatusBadge status={profile.status} />
          </div>

          <p className="mt-1 text-sm text-[#6B7280]">{profile.email}</p>
          <p className="mt-0.5 text-xs text-[#9CA3AF]">
            Debut du bilan : {formatDate(profile.started_at)}
          </p>

          <div className="mt-4 max-w-md">
            <ProgressBar validated={validatedCount} total={phases.length} />
          </div>

          <div className="mt-3">
            <PhaseIndicators phases={phases} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <div className="mb-6 flex border-b border-[var(--color-border)]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-5 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'text-[#6B7280] hover:text-[var(--color-text)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Selector
// ---------------------------------------------------------------------------

function PhaseSelector({
  phases,
  selected,
  onSelect,
}: {
  phases: Phase[]
  selected: number
  onSelect: (n: number) => void
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {phases.map((p) => {
        const isSelected = p.number === selected
        const isValidated = p.status === 'validated'

        let classes =
          'rounded-lg border px-4 py-2 text-sm font-medium transition-all '
        if (isSelected) {
          classes += 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
        } else if (isValidated) {
          classes +=
            'bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7] hover:border-[#34D399]'
        } else {
          classes +=
            'bg-white text-[#6B7280] border-[var(--color-border)] hover:border-[#9CA3AF]'
        }

        return (
          <button key={p.number} onClick={() => onSelect(p.number)} className={classes}>
            Phase {p.number}
            {isValidated && !isSelected && ' \u2713'}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Content (questions + responses)
// ---------------------------------------------------------------------------

function PhaseContent({ phase }: { phase: Phase }) {
  return (
    <div>
      {/* Phase header */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
          Phase {phase.number} — {PHASE_LABELS[phase.number]}
        </h2>
        {phase.status === 'validated' && (
          <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-medium text-[#065F46]">
            Validée
          </span>
        )}
        {phase.status === 'active' && (
          <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-medium text-[#92400E]">
            En cours
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs text-[#9CA3AF]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Mode lecture seule
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {phase.questions.map((q) => {
          const response = phase.responses.find((r) => r.question_id === q.id)
          const hasResponse = response?.text != null && response.text.length > 0

          return (
            <div key={q.id}>
              {/* Question */}
              <div className="flex items-start gap-3 mb-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {q.number}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-text)]">
                    {q.label}
                  </p>
                  {q.description && (
                    <p className="mt-0.5 text-sm text-[#6B7280]">
                      {q.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Response */}
              {hasResponse ? (
                <div className="ml-10 rounded-lg border border-[var(--color-border)] bg-[#F9FAFB] p-4 text-sm text-[var(--color-text)]">
                  {response!.text}
                </div>
              ) : (
                <div className="ml-10 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4 text-sm italic text-[#9CA3AF]">
                  Pas encore de réponse
                </div>
              )}
            </div>
          )
        })}

        {phase.questions.length === 0 && (
          <p className="text-sm italic text-[#9CA3AF]">
            Aucune question pour cette phase.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function BeneficiaireDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [data, setData] = useState<BeneficiaireData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<TabKey>('reponses')
  const [selectedPhase, setSelectedPhase] = useState<number>(1)

  // Fetch data
  useEffect(() => {
    if (!id) return

    const controller = new AbortController()

    async function fetchData() {
      try {
        setLoading(true)
        const res = await fetch(`/api/consultant/beneficiaires/${id}`, {
          signal: controller.signal,
        })

        if (res.status === 403) {
          setError('Accès refusé — ce bénéficiaire n\u2019est pas assigné à votre portefeuille.')
          setLoading(false)
          return
        }

        if (!res.ok) {
          throw new Error(`Erreur ${res.status}`)
        }

        const json: BeneficiaireData = await res.json()
        setData(json)

        // Default to the first active or first phase
        const activePhase = json.phases.find((p) => p.status === 'active')
        setSelectedPhase(activePhase?.number ?? json.phases[0]?.number ?? 1)
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => controller.abort()
  }, [id, router])

  // ---------------------------------------------------------------------------
  // Render states
  // ---------------------------------------------------------------------------

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Reessayer
        </button>
      </div>
    )
  }

  if (!data) return null

  const { profile, phases, sessions } = data
  const validatedCount = phases.filter((p) => p.status === 'validated').length
  const currentPhase = phases.find((p) => p.number === selectedPhase) ?? phases[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb name={profile.full_name} />
      <HeaderCard
        profile={profile}
        phases={phases}
        validatedCount={validatedCount}
      />
      <TabBar activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'reponses' && (
        <>
          <PhaseSelector
            phases={phases}
            selected={selectedPhase}
            onSelect={setSelectedPhase}
          />
          {currentPhase && <PhaseContent phase={currentPhase} />}
        </>
      )}

      {activeTab === 'planification' && (
        <PlanificationTab
          beneficiaryId={id}
          beneficiaryName={profile.full_name}
          sessions={sessions}
        />
      )}

      {activeTab === 'comptes-rendus' && (
        <ComptesRendusTab
          beneficiaryId={id}
          beneficiaryName={profile.full_name}
          sessions={sessions}
        />
      )}
    </div>
  )
}
