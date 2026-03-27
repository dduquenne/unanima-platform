'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Calendar,
  Video,
  FileText,
  Edit3,
  FolderOpen,
  Lock,
} from 'lucide-react'
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
  status: 'en_cours' | 'termine'
  consultant_name?: string
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
  validated_at?: string
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

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
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

// ---------------------------------------------------------------------------
// Profile Card (matches MAQ-05 exactly)
// ---------------------------------------------------------------------------

function ProfileCard({
  profile,
  validatedCount,
  totalPhases,
}: {
  profile: BeneficiaireProfile
  validatedCount: number
  totalPhases: number
}) {
  return (
    <div
      className="rounded-[20px] border p-6"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E6DF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex items-start gap-5">
        <div
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: '#2A7FD4' }}
        >
          {getInitials(profile.full_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold" style={{ color: '#2D2017' }}>
              {profile.full_name}
            </h1>
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: profile.status === 'termine' ? '#ECFDF5' : '#FFF0E3',
                borderColor: profile.status === 'termine' ? '#A7F3D0' : '#FDDCBF',
                color: profile.status === 'termine' ? '#16A34A' : '#D97706',
              }}
            >
              {profile.status === 'termine' ? 'Bilan terminé' : 'Bilan en cours'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[12.5px]" style={{ color: '#6D6057' }}>
            <span>{profile.email}</span>
            {profile.phone && (
              <>
                <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: '#D4C8BF' }} />
                <span>{profile.phone}</span>
              </>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[11px]" style={{ color: '#A09088' }}>
            <span>Inscription : {formatDateShort(profile.started_at)}</span>
            {profile.consultant_name && (
              <>
                <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: '#D4C8BF' }} />
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
// Right Panel
// ---------------------------------------------------------------------------

function NextSessionPanel({
  sessions,
  onTabChange,
}: {
  sessions: SessionData[]
  onTabChange: (tab: TabKey) => void
}) {
  const nextSession = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E6DF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h3 className="text-[14px] font-bold" style={{ color: '#2D2017' }}>
        Prochaine séance
      </h3>
      <div className="my-3 h-px" style={{ backgroundColor: '#F5EDE7' }} />
      {nextSession ? (
        <>
          <p className="text-[14px] font-semibold" style={{ color: '#3D3027' }}>
            Séance {nextSession.session_number}
          </p>
          <p className="mt-1 text-[12.5px]" style={{ color: '#6D6057' }}>
            {formatDateTime(nextSession.scheduled_at!)}
          </p>
          {nextSession.visio_url && (
            <button
              className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-white"
              style={{ backgroundColor: '#2A7FD4' }}
              onClick={() => window.open(nextSession.visio_url!, '_blank')}
            >
              <Video className="h-3.5 w-3.5" />
              Rejoindre visio
            </button>
          )}
        </>
      ) : (
        <p className="text-[12.5px] italic" style={{ color: '#A09088' }}>
          Aucune séance planifiée
        </p>
      )}
    </div>
  )
}

function ActionsRapidesPanel({
  onTabChange,
}: {
  onTabChange: (tab: TabKey) => void
}) {
  const actions = [
    { label: 'Planifier une séance', tab: 'planification' as TabKey },
    { label: 'Saisir un compte-rendu', tab: 'comptes-rendus' as TabKey },
    { label: 'Voir les documents', tab: 'documents' as TabKey },
  ]

  return (
    <div
      className="rounded-[20px] border p-5"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E6DF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h3 className="text-[14px] font-bold" style={{ color: '#2D2017' }}>
        Actions rapides
      </h3>
      <div className="my-3 h-px" style={{ backgroundColor: '#F5EDE7' }} />
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.tab}
            onClick={() => onTabChange(action.tab)}
            className="flex w-full items-center justify-between rounded-[16px] border px-4 py-3 text-[12.5px] transition-colors hover:bg-[#FFF3EC]"
            style={{
              backgroundColor: '#FFF8F5',
              borderColor: '#F0E6DF',
              color: '#3D3027',
            }}
          >
            {action.label}
            <ChevronRight className="h-4 w-4" style={{ color: '#A09088' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Progress Overview Card
// ---------------------------------------------------------------------------

function ProgressOverview({ phases }: { phases: Phase[] }) {
  const validated = phases.filter((p) => p.status === 'validated').length
  const enCours = phases.filter((p) => p.status === 'active').length
  const aCompleter = phases.length - validated - enCours
  const pct = Math.round((validated / phases.length) * 100)

  return (
    <div
      className="rounded-[18px] border px-5 py-4"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E6DF',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold" style={{ color: '#2D2017' }}>
          Progression globale
        </span>
        <span className="text-[13px] font-semibold" style={{ color: '#2A7FD4' }}>
          {pct}%
        </span>
      </div>
      <div
        className="mt-2 h-[10px] w-full overflow-hidden rounded-full"
        style={{ backgroundColor: '#F0E6DF' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: '#2A7FD4' }}
        />
      </div>
      <p className="mt-2 text-[11.5px]" style={{ color: '#A09088' }}>
        {validated} phase{validated > 1 ? 's' : ''} validée{validated > 1 ? 's' : ''}
        {enCours > 0 && ` · ${enCours} en cours`}
        {aCompleter > 0 && ` · ${aCompleter} à compléter`}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Card
// ---------------------------------------------------------------------------

function PhaseCard({
  phase,
  onViewResponses,
}: {
  phase: Phase
  onViewResponses: (phaseNumber: number) => void
}) {
  const isValidated = phase.status === 'validated'
  const isActive = phase.status === 'active'
  const responsesCount = phase.responses.filter((r) => r.text != null && r.text.length > 0).length
  const totalQuestions = phase.questions.length
  const progressPct = totalQuestions > 0 ? Math.round((responsesCount / totalQuestions) * 100) : 0

  const borderColor = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#D4C8BF'
  const circleColor = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#A09088'
  const circleBg = isValidated ? '#ECFDF5' : isActive ? '#FFF7ED' : '#F9F5F2'
  const circleBorder = isValidated ? '#22C55E' : isActive ? '#F28C5A' : '#D4C8BF'
  const titleColor = isValidated || isActive ? '#2D2017' : '#7D7068'
  const linkColor = isValidated || isActive ? '#2A7FD4' : '#D4C8BF'
  const subtextColor = isValidated || isActive ? '#A09088' : '#B8ADA5'

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border px-5 py-4"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#F0E6DF',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
      }}
    >
      {/* Colored left border */}
      <div
        className="absolute left-0 top-0 h-full w-[5px]"
        style={{ backgroundColor: borderColor }}
      />

      <div className="flex items-center gap-4">
        {/* Numbered circle */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] text-[13px] font-bold"
          style={{
            backgroundColor: circleBg,
            borderColor: circleBorder,
            color: circleColor,
          }}
        >
          {phase.number}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[14px] font-semibold" style={{ color: titleColor }}>
              {PHASE_LABELS[phase.number] ?? `Phase ${phase.number}`}
            </span>
            {/* Status badge */}
            {isValidated && (
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', color: '#16A34A' }}
              >
                ✓ Validé{phase.validated_at ? ` le ${formatDateShort(phase.validated_at)}` : ''}
              </span>
            )}
            {isActive && (
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', color: '#EA780E' }}
              >
                En cours
              </span>
            )}
            {!isValidated && !isActive && (
              <span
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold"
                style={{ backgroundColor: '#F9F5F2', borderColor: '#E8DDD5', color: '#A09088' }}
              >
                Non commencée
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-[11.5px]" style={{ color: subtextColor }}>
              {responsesCount}/{totalQuestions} réponse{responsesCount > 1 ? 's' : ''}
              {isValidated && ' complétées'}
            </span>
            {isActive && totalQuestions > 0 && (
              <div className="flex items-center gap-1.5">
                <div
                  className="h-[6px] w-[90px] overflow-hidden rounded-full"
                  style={{ backgroundColor: '#F0E6DF' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${progressPct}%`, backgroundColor: '#F28C5A' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View link */}
        <button
          onClick={() => onViewResponses(phase.number)}
          className="shrink-0 text-[12.5px] font-medium whitespace-nowrap"
          style={{ color: linkColor }}
        >
          Voir les réponses ›
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Phase Responses View (read-only)
// ---------------------------------------------------------------------------

function PhaseResponsesView({
  phase,
  onBack,
}: {
  phase: Phase
  onBack: () => void
}) {
  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-[12.5px] font-medium"
        style={{ color: '#2A7FD4' }}
      >
        ← Retour au parcours
      </button>
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <h2 className="text-lg font-bold" style={{ color: '#2D2017' }}>
          Phase {phase.number} — {PHASE_LABELS[phase.number]}
        </h2>
        {phase.status === 'validated' && (
          <span className="inline-flex items-center rounded-full bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-0.5 text-xs font-semibold text-[#16A34A]">
            Validée
          </span>
        )}
        {phase.status === 'active' && (
          <span className="inline-flex items-center rounded-full bg-[#FFF7ED] border border-[#FED7AA] px-2.5 py-0.5 text-xs font-semibold text-[#EA780E]">
            En cours
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: '#A09088' }}>
          <Lock className="h-3.5 w-3.5" />
          Mode lecture seule
        </span>
      </div>

      <div className="space-y-5">
        {phase.questions.map((q) => {
          const response = phase.responses.find((r) => r.question_id === q.id)
          const hasResponse = response?.text != null && response.text.length > 0

          return (
            <div key={q.id}>
              <div className="flex items-start gap-3 mb-2">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: '#2A7FD4' }}
                >
                  {q.number}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#2D2017' }}>
                    {q.label}
                  </p>
                  {q.description && (
                    <p className="mt-0.5 text-xs" style={{ color: '#6D6057' }}>
                      {q.description}
                    </p>
                  )}
                </div>
              </div>

              {hasResponse ? (
                <div
                  className="ml-10 rounded-[16px] border p-4 text-sm"
                  style={{
                    backgroundColor: '#FFFBF8',
                    borderColor: '#F0E6DF',
                    color: '#2D2017',
                  }}
                >
                  {response!.text}
                </div>
              ) : (
                <div
                  className="ml-10 rounded-[16px] border border-dashed p-4 text-sm italic"
                  style={{
                    borderColor: '#E8DDD5',
                    backgroundColor: '#F9F5F2',
                    color: '#A09088',
                  }}
                >
                  Pas encore de réponse
                </div>
              )}
            </div>
          )
        })}

        {phase.questions.length === 0 && (
          <p className="text-sm italic" style={{ color: '#A09088' }}>
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

function DocumentsTab({ beneficiaryId }: { beneficiaryId: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[18px] border py-12"
      style={{ backgroundColor: '#FFFFFF', borderColor: '#F0E6DF' }}
    >
      <FolderOpen className="mb-3 h-10 w-10" style={{ color: '#D4C8BF' }} />
      <p className="text-[14px] font-medium" style={{ color: '#2D2017' }}>
        Documents du bénéficiaire
      </p>
      <p className="mt-1 text-[12.5px]" style={{ color: '#A09088' }}>
        Les documents par phase seront affichés ici.
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
  const [viewingPhase, setViewingPhase] = useState<number | null>(null)

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
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!data) return null

  const { profile, phases, sessions } = data
  const validatedCount = phases.filter((p) => p.status === 'validated').length
  const phaseBeingViewed = viewingPhase != null ? phases.find((p) => p.number === viewingPhase) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-5 text-[13px]">
        <Link href="/consultant/beneficiaires" className="transition-colors hover:underline" style={{ color: '#A09088' }}>
          Mes bénéficiaires
        </Link>
        <span className="mx-2" style={{ color: '#A09088' }}>&gt;</span>
        <span className="font-semibold" style={{ color: '#2D2017' }}>{profile.full_name}</span>
      </nav>

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* ============ LEFT COLUMN ============ */}
        <div className="min-w-0 flex-1">
          {/* Profile card */}
          <ProfileCard
            profile={profile}
            validatedCount={validatedCount}
            totalPhases={phases.length}
          />

          {/* Tabs */}
          <div className="mt-5 border-b" style={{ borderColor: '#F0E6DF' }}>
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setViewingPhase(null)
                  }}
                  className="relative px-4 py-3 text-[14px] font-medium transition-colors"
                  style={{
                    color: activeTab === tab.key ? '#2A7FD4' : '#A09088',
                  }}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div
                      className="absolute bottom-0 left-4 right-4 h-[4px] rounded-t-full"
                      style={{ backgroundColor: '#2A7FD4' }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="mt-5">
            {activeTab === 'parcours' && (
              <>
                {phaseBeingViewed ? (
                  <PhaseResponsesView
                    phase={phaseBeingViewed}
                    onBack={() => setViewingPhase(null)}
                  />
                ) : (
                  <>
                    <ProgressOverview phases={phases} />
                    <div className="mt-4 space-y-3">
                      {phases.map((phase) => (
                        <PhaseCard
                          key={phase.number}
                          phase={phase}
                          onViewResponses={(n) => setViewingPhase(n)}
                        />
                      ))}
                    </div>
                  </>
                )}
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

            {activeTab === 'documents' && (
              <DocumentsTab beneficiaryId={id} />
            )}
          </div>
        </div>

        {/* ============ RIGHT COLUMN ============ */}
        <div className="hidden w-[308px] shrink-0 lg:block">
          <NextSessionPanel
            sessions={sessions}
            onTabChange={setActiveTab}
          />
          <div className="mt-4">
            <ActionsRapidesPanel onTabChange={setActiveTab} />
          </div>
        </div>
      </div>
    </div>
  )
}
