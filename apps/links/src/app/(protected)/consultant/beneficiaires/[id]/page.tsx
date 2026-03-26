'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
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
  phone?: string
  started_at: string
  consultant_name?: string
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
  validated_at?: string | null
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

type TabKey = 'parcours' | 'comptes-rendus' | 'planification' | 'documents'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'parcours', label: 'Parcours' },
  { key: 'comptes-rendus', label: 'Comptes-rendus' },
  { key: 'planification', label: 'Planification' },
  { key: 'documents', label: 'Documents' },
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

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`
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
    <nav className="mb-6 flex items-center gap-2 text-[13px]" style={{ color: '#A09088' }}>
      <Link href="/consultant/dashboard" className="hover:text-[var(--color-primary)] transition-colors">
        Mes bénéficiaires
      </Link>
      <span>&gt;</span>
      <span className="font-semibold" style={{ color: '#2D2017' }}>{name}</span>
    </nav>
  )
}

// ---------------------------------------------------------------------------
// Profile Card (top-left)
// ---------------------------------------------------------------------------

function ProfileCard({
  profile,
}: {
  profile: BeneficiaireProfile
}) {
  const isTermine = profile.status === 'termine'
  return (
    <div
      className="rounded-[20px] border bg-white p-6"
      style={{ borderColor: '#F0E6DF', boxShadow: 'var(--shadow-lg)' }}
    >
      <div className="flex items-start gap-5">
        {/* Avatar */}
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
          {getInitials(profile.full_name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#2D2017' }}>
              {profile.full_name}
            </h1>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
              style={
                isTermine
                  ? { backgroundColor: '#E8F5E9', color: '#28A745', border: '1px solid #C3E6CB' }
                  : { backgroundColor: '#FFF0E3', color: '#D97706', border: '1px solid #FDDCBF' }
              }
            >
              {isTermine ? 'Bilan terminé' : 'Bilan en cours'}
            </span>
          </div>

          {/* Contact */}
          <div className="mt-2 flex items-center gap-3 text-[12.5px]" style={{ color: '#6D6057' }}>
            <span>{profile.email}</span>
            {profile.phone && (
              <>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: '#D4C8BF' }} />
                <span>{profile.phone}</span>
              </>
            )}
          </div>

          {/* Meta */}
          <div className="mt-1 flex items-center gap-3 text-[11px]" style={{ color: '#A09088' }}>
            <span>Inscription : {formatDateShort(profile.started_at)}</span>
            {profile.consultant_name && (
              <>
                <span className="h-1 w-1 rounded-full" style={{ backgroundColor: '#D4C8BF' }} />
                <span>Consultant : {profile.consultant_name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Right panel cards
// ---------------------------------------------------------------------------

function NextSessionCard({ sessions }: { sessions: SessionData[] }) {
  const nextSession = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]

  return (
    <div
      className="rounded-[20px] border bg-white p-5"
      style={{ borderColor: '#F0E6DF', boxShadow: 'var(--shadow-lg)' }}
    >
      <h3 className="text-[14px] font-bold" style={{ color: '#2D2017' }}>Prochaine séance</h3>
      <div className="my-3 h-px" style={{ backgroundColor: '#F5EDE7' }} />

      {nextSession ? (
        <>
          <p className="text-[14px] font-semibold" style={{ color: '#3D3027' }}>
            Séance {nextSession.session_number}
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: '#6D6057' }}>
            {formatDateShort(nextSession.scheduled_at!)} à {formatTime(nextSession.scheduled_at!)}
          </p>
          {nextSession.visio_url && (
            <a
              href={nextSession.visio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Rejoindre visio
            </a>
          )}
        </>
      ) : (
        <p className="text-[12.5px] italic" style={{ color: '#A09088' }}>Aucune séance planifiée</p>
      )}
    </div>
  )
}

function QuickActionsCard({ onTabChange }: { onTabChange: (tab: TabKey) => void }) {
  const actions: { label: string; tab: TabKey }[] = [
    { label: 'Planifier une séance', tab: 'planification' },
    { label: 'Saisir un compte-rendu', tab: 'comptes-rendus' },
    { label: 'Voir les documents', tab: 'documents' },
  ]

  return (
    <div
      className="rounded-[20px] border bg-white p-5"
      style={{ borderColor: '#F0E6DF', boxShadow: 'var(--shadow-lg)' }}
    >
      <h3 className="text-[14px] font-bold" style={{ color: '#2D2017' }}>Actions rapides</h3>
      <div className="my-3 h-px" style={{ backgroundColor: '#F5EDE7' }} />
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.tab}
            onClick={() => onTabChange(action.tab)}
            className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-[12.5px] transition-colors hover:bg-[var(--color-surface-hover)]"
            style={{ borderColor: '#F0E6DF', backgroundColor: 'var(--color-background)', color: '#3D3027' }}
          >
            <span>{action.label}</span>
            <ChevronRight className="h-4 w-4" style={{ color: '#A09088' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab bar
// ---------------------------------------------------------------------------

function TabBar({
  activeTab,
  onChange,
}: {
  activeTab: TabKey
  onChange: (t: TabKey) => void
}) {
  return (
    <div className="flex border-b" style={{ borderColor: '#F0E6DF' }}>
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="relative px-5 py-3 text-[14px] font-medium transition-colors"
          style={{
            color: activeTab === tab.key ? 'var(--color-primary)' : '#A09088',
            fontWeight: activeTab === tab.key ? 600 : 400,
          }}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div
              className="absolute bottom-0 left-5 right-5 h-[3px] rounded-t-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress Overview
// ---------------------------------------------------------------------------

function ProgressOverview({ phases }: { phases: Phase[] }) {
  const validatedCount = phases.filter((p) => p.status === 'validated').length
  const activeCount = phases.filter((p) => p.status === 'active').length
  const lockedCount = phases.filter((p) => p.status === 'locked').length
  const pct = Math.round((validatedCount / phases.length) * 100)

  return (
    <div
      className="rounded-[18px] border bg-white p-5"
      style={{ borderColor: '#F0E6DF', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[14px] font-bold" style={{ color: '#2D2017' }}>
          Progression globale
        </span>
        <span className="text-[13px] font-semibold" style={{ color: 'var(--color-primary)' }}>
          {pct}%
        </span>
      </div>
      <div className="h-[10px] rounded-full" style={{ backgroundColor: '#F0E6DF' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: 'var(--color-primary)' }}
        />
      </div>
      <p className="mt-2 text-[11.5px]" style={{ color: '#A09088' }}>
        {validatedCount} phase{validatedCount > 1 ? 's' : ''} validée{validatedCount > 1 ? 's' : ''} · {activeCount} en cours · {lockedCount} à compléter
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Cards
// ---------------------------------------------------------------------------

function PhaseCard({
  phase,
  onViewResponses,
}: {
  phase: Phase
  onViewResponses: () => void
}) {
  const isValidated = phase.status === 'validated'
  const isActive = phase.status === 'active'
  const isLocked = phase.status === 'locked'

  const answeredCount = phase.responses.filter((r) => r.text != null && r.text.length > 0).length
  const totalQuestions = phase.questions.length

  const accentColor = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#D4C8BF'
  const numberBg = isValidated ? '#ECFDF5' : isActive ? '#FFF7ED' : '#F9F5F2'
  const numberBorder = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#D4C8BF'
  const numberColor = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#A09088'
  const titleColor = isLocked ? '#7D7068' : '#2D2017'
  const subtitleColor = isLocked ? '#B8ADA5' : '#A09088'
  const linkColor = isLocked ? '#D4C8BF' : 'var(--color-primary)'

  return (
    <div
      className="relative rounded-[18px] border bg-white overflow-hidden"
      style={{ borderColor: '#F0E6DF', boxShadow: 'var(--shadow-sm)' }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 h-full w-[5px]"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center gap-4 px-5 py-5 pl-7">
        {/* Phase number circle */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold"
          style={{ backgroundColor: numberBg, borderColor: numberBorder, color: numberColor }}
        >
          {phase.number}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[14px] font-semibold" style={{ color: titleColor }}>
              {PHASE_LABELS[phase.number]}
            </span>

            {/* Status badge */}
            {isValidated && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#16A34A' }}
              >
                ✓ Validé{phase.validated_at ? ` le ${formatDateShort(phase.validated_at)}` : ''}
              </span>
            )}
            {isActive && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', color: '#EA780E' }}
              >
                En cours
              </span>
            )}
            {isLocked && (
              <span
                className="inline-flex items-center rounded-full border px-3 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#F9F5F2', borderColor: '#E8DDD5', color: '#A09088' }}
              >
                Non commencée
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-[11.5px]" style={{ color: subtitleColor }}>
              {answeredCount}/{totalQuestions} réponses
            </span>
            {isActive && totalQuestions > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-[6px] w-[90px] rounded-full" style={{ backgroundColor: '#F0E6DF' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((answeredCount / totalQuestions) * 100)}%`,
                      backgroundColor: '#F28C5A',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Link */}
        <button
          onClick={onViewResponses}
          className="text-[12.5px] font-medium whitespace-nowrap transition-opacity hover:opacity-80"
          style={{ color: linkColor }}
        >
          Voir les réponses ›
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Detail (read-only responses)
// ---------------------------------------------------------------------------

function PhaseDetail({ phase }: { phase: Phase }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-primary-dark)' }}>
          Phase {phase.number} — {PHASE_LABELS[phase.number]}
        </h2>
        <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#9CA3AF' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Mode lecture seule
        </span>
      </div>

      <div className="space-y-6">
        {phase.questions.map((q) => {
          const response = phase.responses.find((r) => r.question_id === q.id)
          const hasResponse = response?.text != null && response.text.length > 0

          return (
            <div key={q.id}>
              <div className="flex items-start gap-3 mb-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {q.number}
                </div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{q.label}</p>
                  {q.description && (
                    <p className="mt-0.5 text-sm" style={{ color: '#6B7280' }}>{q.description}</p>
                  )}
                </div>
              </div>

              {hasResponse ? (
                <div className="ml-10 rounded-2xl border p-4 text-sm" style={{ borderColor: 'var(--color-border)', backgroundColor: '#F9FAFB', color: 'var(--color-text)' }}>
                  {response!.text}
                </div>
              ) : (
                <div className="ml-10 rounded-2xl border border-dashed p-4 text-sm italic" style={{ borderColor: '#D1D5DB', backgroundColor: '#F9FAFB', color: '#9CA3AF' }}>
                  Pas encore de réponse
                </div>
              )}
            </div>
          )
        })}

        {phase.questions.length === 0 && (
          <p className="text-sm italic" style={{ color: '#9CA3AF' }}>
            Aucune question pour cette phase.
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Documents Tab (placeholder)
// ---------------------------------------------------------------------------

function DocumentsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: '#F9F5F2' }}>
        <svg className="h-8 w-8" style={{ color: '#D4C8BF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-[14px] font-medium" style={{ color: '#7D7068' }}>Documents à venir</p>
      <p className="mt-1 text-[12px]" style={{ color: '#A09088' }}>
        Les documents du bénéficiaire seront accessibles ici.
      </p>
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

  const [activeTab, setActiveTab] = useState<TabKey>('parcours')
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null)

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
          className="rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!data) return null

  const { profile, phases, sessions } = data
  const validatedCount = phases.filter((p) => p.status === 'validated').length

  // If a phase is selected for detail view
  if (selectedPhase !== null) {
    const phase = phases.find((p) => p.number === selectedPhase)
    if (phase) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-8">
          <button
            onClick={() => setSelectedPhase(null)}
            className="mb-4 flex items-center gap-1 text-[13px] font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            ← Retour au parcours
          </button>
          <PhaseDetail phase={phase} />
        </div>
      )
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Breadcrumb name={profile.full_name} />

      {/* ---- Top section: Profile + Right panel ---- */}
      <div className="grid gap-4 lg:grid-cols-[1fr_308px]">
        <ProfileCard profile={profile} />
        <div className="space-y-4">
          <NextSessionCard sessions={sessions} />
        </div>
      </div>

      {/* ---- Quick Actions (below on smaller screens, right panel on large) ---- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_308px]">
        <div>
          {/* Tab navigation */}
          <div className="mb-4">
            <TabBar activeTab={activeTab} onChange={setActiveTab} />
          </div>

          {/* Tab content */}
          {activeTab === 'parcours' && (
            <div className="space-y-4">
              <ProgressOverview phases={phases} />
              {phases.map((phase) => (
                <PhaseCard
                  key={phase.number}
                  phase={phase}
                  onViewResponses={() => setSelectedPhase(phase.number)}
                />
              ))}
            </div>
          )}

          {activeTab === 'comptes-rendus' && (
            <ComptesRendusTab
              beneficiaryId={id}
              beneficiaryName={profile.full_name}
              sessions={sessions}
            />
          )}

          {activeTab === 'planification' && (
            <PlanificationTab
              beneficiaryId={id}
              beneficiaryName={profile.full_name}
              sessions={sessions}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsTab />
          )}
        </div>

        {/* Quick Actions panel */}
        <div className="hidden lg:block">
          <QuickActionsCard onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  )
}
