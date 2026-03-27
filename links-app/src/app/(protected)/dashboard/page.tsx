'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AlertCircle, ArrowRight, Video } from 'lucide-react'
import type { PhaseStatus } from '@/lib/types/database'
import { TOTAL_PHASES, PHASE_LABELS } from '@/config/phases.config'

interface PhaseData {
  phase_number: number
  status: PhaseStatus
}

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
}

const SESSION_LABELS: Record<number, string> = {
  1: 'Entretien préliminaire',
  2: 'Investigation phase 1',
  3: 'Investigation phase 2',
  4: 'Investigation phase 3',
  5: 'Conclusion',
  6: 'Suivi à 6 mois',
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

function computeProgression(phases: PhaseData[]) {
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
  const [errorToast, setErrorToast] = useState<string | null>(null)

  useEffect(() => {
    if (!errorToast) return
    const timer = setTimeout(() => setErrorToast(null), 5000)
    return () => clearTimeout(timer)
  }, [errorToast])

  useEffect(() => {
    async function loadData() {
      const [phasesRes, sessionsRes] = await Promise.allSettled([
        fetch('/api/phase-validations').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/sessions').then((r) => (r.ok ? r.json() : null)),
      ])

      let hasError = false

      if (phasesRes.status === 'fulfilled' && phasesRes.value?.data) {
        setPhases(phasesRes.value.data)
      } else {
        hasError = true
        setPhases(
          Array.from({ length: TOTAL_PHASES }, (_, i) => ({
            phase_number: i + 1,
            status: 'libre' as PhaseStatus,
          }))
        )
      }

      if (sessionsRes.status === 'fulfilled' && sessionsRes.value?.data) {
        setSessions(sessionsRes.value.data)
      } else {
        hasError = true
      }

      if (hasError) {
        setErrorToast('Impossible de charger certaines données. Veuillez réessayer.')
      }

      setIsLoading(false)
    }

    if (user) {
      loadData()
    }
  }, [user])

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

  const allPhases: PhaseData[] = Array.from({ length: TOTAL_PHASES }, (_, i) => {
    const existing = phases.find((p) => p.phase_number === i + 1)
    return existing ?? { phase_number: i + 1, status: 'libre' as PhaseStatus }
  })

  const { validated, inProgress, remaining, percentage } = computeProgression(allPhases)
  const currentPhase = getCurrentPhase(allPhases)

  const allSessions: SessionData[] = Array.from({ length: 6 }, (_, i) => {
    const existing = sessions.find((s) => s.session_number === i + 1)
    return existing ?? { session_number: i + 1, scheduled_at: null, visio_url: null }
  })

  return (
    <div className="mx-auto max-w-[1100px] space-y-8">
      {/* Error toast */}
      {errorToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-[var(--radius-md)] border border-[#F5C6CB] bg-[#F8D7DA] px-5 py-3 text-[#721C24] shadow-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="ml-2 text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        </div>
      )}

      {/* ═══ WELCOME CARD ═══ */}
      <div className="relative overflow-hidden rounded-[20px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)]">
        <div
          className="absolute left-0 top-0 h-full w-[6px] rounded-l-[20px]"
          style={{ backgroundColor: 'var(--color-accent)' }}
        />
        <div className="ml-4">
          <h1 className="text-[26px] font-bold text-[var(--color-text)]">
            Bonjour, {getFirstName(user.fullName)} ☀️
          </h1>
          <p className="mt-1 text-[15px] text-[var(--color-text-muted)]">
            Retrouvez ici le suivi de votre bilan de compétences. Vous avancez bien !
          </p>
          <button
            onClick={() => router.push(`/bilans/${currentPhase}`)}
            className="mt-4 inline-flex items-center gap-2 rounded-[17px] bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Continuer le bilan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ═══ VOS SÉANCES ═══ */}
      <section>
        <h2 className="mb-3 text-xl font-bold text-[var(--color-text)]">
          Vos séances
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[var(--color-surface)] shadow-[var(--shadow-md)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-hover)]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    Séance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    Heure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {allSessions.map((session) => {
                  const status = getSessionStatus(session)
                  const isScheduled = status === 'a_venir'
                  const isDone = status === 'realisee'
                  const isPlanned = isScheduled || isDone

                  return (
                    <tr
                      key={session.session_number}
                      className="border-t border-[var(--color-border-light)] transition-colors hover:bg-[var(--color-surface-hover)]/50"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              isPlanned
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-border)] text-[var(--color-text-muted)]'
                            }`}
                          >
                            {session.session_number}
                          </span>
                          <span
                            className={`font-medium ${
                              isPlanned
                                ? 'text-[var(--color-text)]'
                                : 'text-[var(--color-text-muted)]'
                            }`}
                          >
                            Séance {session.session_number}
                            {isPlanned && SESSION_LABELS[session.session_number]
                              ? ` — ${SESSION_LABELS[session.session_number]}`
                              : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isPlanned
                              ? 'text-[var(--color-text)]'
                              : 'text-[var(--color-text-muted)]'
                          }
                        >
                          {session.scheduled_at
                            ? formatDate(session.scheduled_at)
                            : 'À planifier'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isPlanned
                              ? 'text-[var(--color-text)]'
                              : 'text-[var(--color-text-muted)]'
                          }
                        >
                          {session.scheduled_at
                            ? formatTime(session.scheduled_at)
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isScheduled && session.visio_url ? (
                          <a
                            href={session.visio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-[15px] bg-[var(--color-primary)] px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                          >
                            <Video className="h-3.5 w-3.5" />
                            Rejoindre la visio
                          </a>
                        ) : status === 'a_planifier' ? (
                          <span className="inline-flex items-center rounded-[15px] border border-[var(--color-border)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-muted)]">
                            Planifier
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══ VOTRE PARCOURS ═══ */}
      <section>
        <h2 className="text-xl font-bold text-[var(--color-text)]">
          Votre parcours
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {validated} phase{validated > 1 ? 's' : ''} validée{validated > 1 ? 's' : ''} · {inProgress} en cours · {remaining} à compléter
        </p>
        {/* Progress bar */}
        <div className="mt-3 h-[10px] w-full overflow-hidden rounded-[5px] bg-[var(--color-border-light)]">
          <div
            className="h-full rounded-[5px] bg-[var(--color-success)] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </section>

      {/* ═══ PHASE CARDS GRID (3×2) ═══ */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {allPhases.map((phase) => {
          const isValidee = phase.status === 'validee'
          const isEnCours = phase.status === 'en_cours'
          const isLibre = phase.status === 'libre'

          const cardBg = isValidee
            ? 'bg-[var(--color-success-light)]'
            : isEnCours
              ? 'bg-[#FFFAF5]'
              : 'bg-[var(--color-surface)]'

          const cardBorder = isValidee
            ? 'border-[var(--color-success)]'
            : isEnCours
              ? 'border-[var(--color-accent)]'
              : 'border-[var(--color-border)]'

          const accentColor = isValidee
            ? 'var(--color-success)'
            : isEnCours
              ? 'var(--color-accent)'
              : 'var(--color-border)'

          const numberBg = isValidee
            ? 'bg-[#D4EDDA] text-[var(--color-success)]'
            : isEnCours
              ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
              : 'bg-[#F5F0EB] text-[var(--color-text-muted)]'

          return (
            <div
              key={phase.phase_number}
              className={`relative overflow-hidden rounded-[18px] border-[1.5px] p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] ${cardBg} ${cardBorder}`}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-0 h-full w-[6px] rounded-l-[18px]"
                style={{ backgroundColor: accentColor }}
              />

              <div className="ml-3 space-y-3">
                {/* Phase number + title */}
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${numberBg}`}
                  >
                    {phase.phase_number}
                  </span>
                  <p
                    className={`text-[15px] font-semibold ${
                      isLibre
                        ? 'text-[var(--color-text-muted)]'
                        : 'text-[var(--color-text)]'
                    }`}
                  >
                    {PHASE_LABELS[phase.phase_number] ?? `Phase ${phase.phase_number}`}
                  </p>
                </div>

                {/* Status badge */}
                {isValidee && (
                  <span className="inline-flex items-center rounded-[12px] bg-[#D4EDDA] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                    ✓ Validé
                  </span>
                )}
                {isEnCours && (
                  <span className="inline-flex items-center gap-1.5 rounded-[12px] bg-[var(--color-accent-light)] px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
                    </span>
                    En cours
                  </span>
                )}
                {isLibre && (
                  <span className="inline-flex items-center rounded-[12px] bg-[#F5F0EB] px-3 py-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    À compléter
                  </span>
                )}

                {/* Action button */}
                {isLibre ? (
                  <button
                    onClick={() => router.push(`/bilans/${phase.phase_number}`)}
                    className="inline-flex items-center gap-1 rounded-[16px] bg-[#F5F0EB] px-4 py-2 text-[13px] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
                  >
                    Accéder
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/bilans/${phase.phase_number}`)}
                    className="inline-flex items-center gap-1 rounded-[16px] bg-[var(--color-primary)] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                  >
                    Accéder
                    <ArrowRight className="h-3.5 w-3.5" />
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
