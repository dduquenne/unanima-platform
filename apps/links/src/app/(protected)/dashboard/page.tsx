'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { ProgressBar, StatusBadge } from '@unanima/dashboard'
import { Card } from '@unanima/core'
import { Video, Calendar, ArrowRight } from 'lucide-react'
import type { PhaseStatus } from '@/lib/types/database'
import { TOTAL_PHASES, PHASE_LABELS } from '@/config/phases.config'

const PHASE_STATUS_CONFIG = {
  libre: { label: 'À compléter', color: 'info' as const },
  en_cours: { label: 'En cours', color: 'warning' as const },
  validee: { label: 'Validé', color: 'success' as const },
}

interface PhaseData {
  phase_number: number
  status: PhaseStatus
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

function computeProgression(phases: PhaseData[]): {
  validated: number
  inProgress: number
  remaining: number
  percentage: number
} {
  const validated = phases.filter((p) => p.status === 'validee').length
  const inProgress = phases.filter((p) => p.status === 'en_cours').length
  const remaining = TOTAL_PHASES - validated - inProgress
  const percentage = Math.round((validated / TOTAL_PHASES) * 100)
  return { validated, inProgress, remaining, percentage }
}

function getCurrentPhase(phases: PhaseData[]): number {
  const inProgress = phases.find((p) => p.status === 'en_cours')
  if (inProgress) return inProgress.phase_number

  const firstLibre = phases
    .sort((a, b) => a.phase_number - b.phase_number)
    .find((p) => p.status === 'libre')
  if (firstLibre) return firstLibre.phase_number

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
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

  // Redirect consultant/admin to their specific dashboards
  useEffect(() => {
    if (user?.role === 'consultant') {
      router.replace('/consultant/dashboard')
    } else if (user?.role === 'super_admin') {
      router.replace('/admin/dashboard')
    }
  }, [user?.role, router])

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

  if (user.role !== 'beneficiaire') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
          role="status"
          aria-label="Redirection"
        />
      </div>
    )
  }

  // Ensure all 6 phases have an entry
  const allPhases: PhaseData[] = Array.from({ length: TOTAL_PHASES }, (_, i) => {
    const existing = phases.find((p) => p.phase_number === i + 1)
    return existing ?? { phase_number: i + 1, status: 'libre' as PhaseStatus }
  })

  const { validated, inProgress, remaining, percentage } = computeProgression(allPhases)
  const currentPhase = getCurrentPhase(allPhases)

  // Ensure all 6 sessions exist
  const allSessions: SessionData[] = Array.from({ length: 6 }, (_, i) => {
    const existing = sessions.find((s) => s.session_number === i + 1)
    return existing ?? { session_number: i + 1, scheduled_at: null, visio_url: null }
  })

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      {/* ═══ WELCOME (MAQ-02) ═══ */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">
          Bonjour, {getFirstName(user.fullName)}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Retrouvez ici le suivi de votre bilan de compétences.
        </p>
        <div className="mt-3 h-[3px] w-14 rounded-full bg-[var(--color-primary)]" />
        <button
          onClick={() => router.push(`/bilans/${currentPhase}`)}
          className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-dark)]"
        >
          Continuer le bilan
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* ═══ SESSIONS TABLE (MAQ-02) ═══ */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-[var(--color-primary-dark)]">
          Vos séances
        </h2>
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-hover)]">
                  <th className="px-4 py-3 text-left text-xs font-bold text-[var(--color-primary-dark)]">
                    Séance
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[var(--color-primary-dark)]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[var(--color-primary-dark)]">
                    Heure
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-[var(--color-primary-dark)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {allSessions.map((session) => {
                  const status = getSessionStatus(session)
                  const isScheduled = status === 'a_venir'
                  const isDone = status === 'realisee'

                  return (
                    <tr key={session.session_number} className="transition-colors hover:bg-[var(--color-surface-hover)]/50">
                      {/* Session badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                              isDone
                                ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
                                : isScheduled
                                  ? 'bg-[var(--color-info-light)] text-[var(--color-primary)]'
                                  : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                            }`}
                          >
                            {session.session_number}
                          </span>
                          <span className={`font-medium ${
                            status === 'a_planifier'
                              ? 'text-[var(--color-text-muted)]'
                              : 'text-[var(--color-text)]'
                          }`}>
                            {isDone || isScheduled
                              ? `Séance ${session.session_number}`
                              : `Séance ${session.session_number}`}
                          </span>
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 text-center">
                        <span className={status === 'a_planifier' ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}>
                          {session.scheduled_at ? formatDate(session.scheduled_at) : 'À planifier'}
                        </span>
                      </td>
                      {/* Time */}
                      <td className="px-4 py-3 text-center">
                        <span className={status === 'a_planifier' ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text)]'}>
                          {session.scheduled_at ? formatTime(session.scheduled_at) : '—'}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        {isScheduled && session.visio_url ? (
                          <a
                            href={session.visio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-dark)]"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Rejoindre la visio
                          </a>
                        ) : status === 'a_planifier' ? (
                          <span className="text-xs italic text-[var(--color-text-muted)]">
                            À planifier par votre consultante
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* ═══ PARCOURS SECTION (MAQ-02) ═══ */}
      <section>
        <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
          Votre parcours
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {validated} phase{validated > 1 ? 's' : ''} validée{validated > 1 ? 's' : ''} · {inProgress} en cours · {remaining} à compléter
        </p>
        <div className="mt-3">
          <ProgressBar
            value={percentage}
            color={percentage === 100 ? 'success' : 'primary'}
            animated
          />
        </div>
      </section>

      {/* ═══ PHASE CARDS GRID (MAQ-02: 3×2) ═══ */}
      <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
        {allPhases.map((phase) => {
          const isValidee = phase.status === 'validee'
          const isEnCours = phase.status === 'en_cours'
          const isLibre = phase.status === 'libre'

          const borderColor = isValidee
            ? 'border-[var(--color-success)]'
            : isEnCours
              ? 'border-[var(--color-warning)]'
              : 'border-[var(--color-border)]'

          const accentColor = isValidee
            ? 'var(--color-success)'
            : isEnCours
              ? 'var(--color-warning)'
              : 'var(--color-border)'

          const numberBg = isValidee
            ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
            : isEnCours
              ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
              : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'

          return (
            <div
              key={phase.phase_number}
              className={`relative min-h-[110px] overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-surface)] p-4 transition-shadow hover:shadow-md ${borderColor}`}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-[5px] rounded-l-[var(--radius-lg)]"
                style={{ backgroundColor: accentColor }}
              />

              <div className="ml-2 space-y-3">
                {/* Phase number + title */}
                <div className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${numberBg}`}>
                    {phase.phase_number}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${isLibre ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-primary-dark)]'}`}>
                      {PHASE_LABELS[phase.phase_number] ?? `Phase ${phase.phase_number}`}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                {isEnCours ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-full,9999px)] px-2.5 py-0.5 text-xs font-medium bg-[var(--color-warning-light)] text-[var(--color-warning)] ring-1 ring-inset ring-[var(--color-warning)]/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-[var(--color-warning)]" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                    </span>
                    En cours
                  </span>
                ) : (
                  <StatusBadge
                    status={phase.status}
                    statusConfig={PHASE_STATUS_CONFIG}
                  />
                )}

                {/* Action button */}
                {isLibre ? (
                  <button
                    onClick={() => router.push(`/bilans/${phase.phase_number}`)}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                  >
                    Accéder
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/bilans/${phase.phase_number}`)}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-inverse)] transition-colors hover:bg-[var(--color-primary-dark)]"
                  >
                    Accéder
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
