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

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [phases, setPhases] = useState<PhaseData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPhases() {
      try {
        const response = await fetch('/api/phase-validations')
        if (response.ok) {
          const data = await response.json()
          setPhases(data.data ?? [])
        } else {
          // No validations yet — initialize all as 'libre'
          setPhases(
            Array.from({ length: TOTAL_PHASES }, (_, i) => ({
              phase_number: i + 1,
              status: 'libre' as PhaseStatus,
            }))
          )
        }
      } catch {
        // Fallback: all phases libre
        setPhases(
          Array.from({ length: TOTAL_PHASES }, (_, i) => ({
            phase_number: i + 1,
            status: 'libre' as PhaseStatus,
          }))
        )
      }
      setIsLoading(false)
    }

    if (user) {
      loadPhases()
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
    </div>
  )
}
