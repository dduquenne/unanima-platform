'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { ProgressBar, StatusBadge } from '@unanima/dashboard'
import { Card } from '@unanima/core'
import type { PhaseStatus } from '@/lib/types/database'

const TOTAL_PHASES = 6

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase préliminaire',
  2: 'Investigation — Parcours personnel',
  3: 'Investigation — Parcours professionnel',
  4: 'Investigation — Projet professionnel',
  5: 'Conclusion',
  6: 'Suivi à 6 mois',
}

const PHASE_STATUS_CONFIG = {
  libre: { label: 'Non commencée', color: 'info' as const },
  en_cours: { label: 'En cours', color: 'primary' as const },
  validee: { label: 'Validée', color: 'success' as const },
}

interface PhaseData {
  phase_number: number
  status: PhaseStatus
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

function computeProgression(phases: PhaseData[]): { validated: number; percentage: number } {
  const validated = phases.filter((p) => p.status === 'validee').length
  const percentage = Math.round((validated / TOTAL_PHASES) * 100)
  return { validated, percentage }
}

function getCurrentPhase(phases: PhaseData[]): number {
  // Find the first phase that is 'en_cours', or the first 'libre' if none in progress
  const inProgress = phases.find((p) => p.status === 'en_cours')
  if (inProgress) return inProgress.phase_number

  const firstLibre = phases
    .sort((a, b) => a.phase_number - b.phase_number)
    .find((p) => p.status === 'libre')
  if (firstLibre) return firstLibre.phase_number

  // All validated — return phase 1
  return 1
}

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
}

type SessionStatus = 'realisee' | 'a_venir' | 'a_planifier'

function getSessionStatus(session: SessionData): SessionStatus {
  if (!session.scheduled_at) return 'a_planifier'
  return new Date(session.scheduled_at) < new Date() ? 'realisee' : 'a_venir'
}

function getNextSession(sessions: SessionData[]): SessionData | null {
  const now = new Date()
  const upcoming = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
  return upcoming[0] ?? null
}

function formatSessionDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [phases, setPhases] = useState<PhaseData[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [phasesRes, sessionsRes] = await Promise.allSettled([
        fetch('/api/phase-validations').then(r => r.ok ? r.json() : null),
        fetch('/api/sessions').then(r => r.ok ? r.json() : null),
      ])

      if (phasesRes.status === 'fulfilled' && phasesRes.value?.data) {
        setPhases(phasesRes.value.data)
      } else {
        setPhases(
          Array.from({ length: TOTAL_PHASES }, (_, i) => ({
            phase_number: i + 1,
            status: 'libre' as PhaseStatus,
          }))
        )
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setSessions(sessionsRes.value.data)
      }

      setIsLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user])

  if (!user || isLoading) {
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

  // If consultant or admin, show a placeholder for now
  if (user.role !== 'beneficiaire') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Tableau de bord
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Dashboard consultant — en cours de d&eacute;veloppement.
        </p>
      </div>
    )
  }

  // Ensure all 6 phases have an entry
  const allPhases: PhaseData[] = Array.from({ length: TOTAL_PHASES }, (_, i) => {
    const existing = phases.find((p) => p.phase_number === i + 1)
    return existing ?? { phase_number: i + 1, status: 'libre' as PhaseStatus }
  })

  const { validated, percentage } = computeProgression(allPhases)
  const currentPhase = getCurrentPhase(allPhases)

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Bonjour {getFirstName(user.fullName)}, bienvenue dans votre espace bilan.
        </h1>
      </div>

      {/* Global progression */}
      <Card padding="lg">
        <ProgressBar
          value={percentage}
          label={`${validated} / ${TOTAL_PHASES} phases validées`}
          showPercentage
          color={percentage === 100 ? 'success' : 'primary'}
          animated
        />
      </Card>

      {/* CTA */}
      <button
        onClick={() => router.push(`/bilans/${currentPhase}`)}
        className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
      >
        Continuer le bilan
      </button>

      {/* Phase cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allPhases.map((phase) => (
          <button
            key={phase.phase_number}
            onClick={() => router.push(`/bilans/${phase.phase_number}`)}
            className="text-left"
          >
            <Card
              padding="md"
              className={`transition-all hover:shadow-md cursor-pointer border-l-4 ${
                phase.status === 'validee'
                  ? 'border-l-[#28A745]'
                  : phase.status === 'en_cours'
                    ? 'border-l-[#1E6FC0]'
                    : 'border-l-[#A0AAB9]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Phase {phase.phase_number}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text)]">
                    {PHASE_LABELS[phase.phase_number] ?? `Phase ${phase.phase_number}`}
                  </p>
                </div>
                <StatusBadge
                  status={phase.status}
                  statusConfig={PHASE_STATUS_CONFIG}
                />
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Session planning panel */}
      <Card padding="lg">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Planning des s&eacute;ances
        </h2>
        <SessionPlanning sessions={sessions} />
      </Card>
    </div>
  )
}

// ============================================================
// Session Planning Component
// ============================================================

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  realisee: 'Réalisée',
  a_venir: 'À venir',
  a_planifier: 'À planifier',
}

function SessionPlanning({ sessions }: { sessions: SessionData[] }) {
  // Ensure all 6 sessions exist
  const allSessions: SessionData[] = Array.from({ length: 6 }, (_, i) => {
    const existing = sessions.find((s) => s.session_number === i + 1)
    return existing ?? { session_number: i + 1, scheduled_at: null, visio_url: null }
  })

  const nextSession = getNextSession(allSessions)
  const hasAnyDate = allSessions.some((s) => s.scheduled_at)

  if (!hasAnyDate) {
    return (
      <p className="text-sm text-[var(--color-text-secondary)]">
        Votre consultante planifiera vos rendez-vous prochainement.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {allSessions.map((session) => {
        const status = getSessionStatus(session)
        const isNext = nextSession?.session_number === session.session_number

        return (
          <div
            key={session.session_number}
            className={`flex items-center justify-between rounded-lg border p-3 ${
              isNext
                ? 'border-[#1E6FC0] bg-[#1E6FC0]/5'
                : status === 'realisee'
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  status === 'realisee'
                    ? 'bg-gray-200 text-gray-500'
                    : status === 'a_venir'
                      ? 'bg-[#1E6FC0] text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {session.session_number}
              </span>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  S&eacute;ance {session.session_number}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {session.scheduled_at
                    ? formatSessionDate(session.scheduled_at)
                    : SESSION_STATUS_LABELS[status]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-medium ${
                  status === 'realisee'
                    ? 'text-gray-500'
                    : status === 'a_venir'
                      ? 'text-[#1E6FC0]'
                      : 'text-gray-400'
                }`}
              >
                {SESSION_STATUS_LABELS[status]}
              </span>
              {isNext && session.visio_url && (
                <a
                  href={session.visio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Rejoindre la visio
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
