'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Card } from '@unanima/core'
import {
  Users,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  BarChart3,
} from 'lucide-react'

import type { BeneficiaireWithParcours } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2)
    return (
      (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')
    ).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

type PhaseStatus = 'validee' | 'en_cours' | 'libre'

interface Phase {
  status: PhaseStatus
}

function countPhasesByStatus(phases: Phase[]): { validee: number; en_cours: number; libre: number } {
  return phases.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    },
    { validee: 0, en_cours: 0, libre: 0 } as Record<PhaseStatus, number>,
  )
}

type FilterKey = 'tous' | 'en_cours' | 'a_demarrer' | 'termines'

function matchesFilter(phases: Phase[], filter: FilterKey): boolean {
  if (filter === 'tous') return true
  const { validee, en_cours } = countPhasesByStatus(phases)
  if (filter === 'termines') return validee === 6
  if (filter === 'a_demarrer') return validee === 0 && en_cours === 0
  // en_cours: at least 1 phase en_cours or validee, but not all 6 validated
  return (validee + en_cours > 0) && validee < 6
}

const ITEMS_PER_PAGE = 10

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ConsultantDashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [beneficiaires, setBeneficiaires] = useState<BeneficiaireWithParcours[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('tous')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // --- Data fetching -------------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/consultant/beneficiaires')
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const data = await res.json()
        setBeneficiaires(data)
      } catch {
        // silently fail – empty state will show
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // --- Derived data --------------------------------------------------------

  const filtered = useMemo(() => {
    let list = beneficiaires

    // Text search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (b) =>
          b.full_name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q),
      )
    }

    // Status filter
    list = list.filter((b) => matchesFilter(b.phases, filter))

    return list
  }, [beneficiaires, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Reset page when filter / search change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, search])

  // --- KPIs ----------------------------------------------------------------

  const kpis = useMemo(() => {
    let enCours = 0
    let termines = 0
    let totalProgression = 0

    for (const b of beneficiaires) {
      const { validee, en_cours } = countPhasesByStatus(b.phases)
      if (validee === 6) {
        termines++
      } else if (validee + en_cours > 0) {
        enCours++
      } else {
        enCours++ // à démarrer still counts as "en cours" for KPI
      }
      totalProgression += validee
    }

    const tauxCompletion =
      beneficiaires.length > 0
        ? Math.round((totalProgression / (beneficiaires.length * 6)) * 100)
        : 0

    return {
      enCours,
      seancesCetteSemaine: beneficiaires.filter((b) => {
        if (!b.next_session) return false
        const d = new Date(b.next_session)
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay() + 1)
        startOfWeek.setHours(0, 0, 0, 0)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return d >= startOfWeek && d <= endOfWeek
      }).length,
      termines,
      tauxCompletion,
    }
  }, [beneficiaires])

  // --- Active beneficiaries count for badge --------------------------------

  const activeBeneficiairesCount = beneficiaires.filter((b) => {
    const { validee } = countPhasesByStatus(b.phases)
    return validee < 6
  }).length

  // --- Filter buttons config -----------------------------------------------

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'tous', label: 'Tous' },
    { key: 'en_cours', label: 'En cours' },
    { key: 'a_demarrer', label: 'À démarrer' },
    { key: 'termines', label: 'Terminés' },
  ]

  // --- Render helpers ------------------------------------------------------

  function renderPhaseCircle(phase: Phase, index: number) {
    if (phase.status === 'validee') {
      return (
        <div
          key={index}
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: '#28A745' }}
          title={`Phase ${index + 1} — Terminée`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )
    }

    if (phase.status === 'en_cours') {
      return (
        <div
          key={index}
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: '#FF6B35' }}
          title={`Phase ${index + 1} — En cours`}
        >
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      )
    }

    // libre
    return (
      <div
        key={index}
        className="flex h-7 w-7 items-center justify-center rounded-full border-2"
        style={{ borderColor: 'var(--color-border)' }}
        title={`Phase ${index + 1} — Non commencée`}
      />
    )
  }

  function renderProgressionBar(phases: Phase[]) {
    const { validee } = countPhasesByStatus(phases)
    const pct = Math.round((validee / 6) * 100)
    return (
      <div className="flex items-center gap-2">
        <div
          className="h-2 w-24 overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--color-border)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {validee}/6
        </span>
      </div>
    )
  }

  // --- Loading state -------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-primary)' }}
        />
      </div>
    )
  }

  // --- Main render ---------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
            Mon portefeuille bénéficiaires
          </h1>
          <span
            className="inline-flex items-center rounded-full px-3 py-0.5 text-sm font-semibold text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {activeBeneficiairesCount}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters & Search                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={
                filter === f.key
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: '#FFFFFF',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--color-text)' }}
          />
          <input
            type="text"
            placeholder="Rechercher un bénéficiaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: '#FFFFFF',
            }}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                              */}
      {/* ------------------------------------------------------------------ */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border py-16"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#FFFFFF' }}
        >
          <Users className="mb-4 h-12 w-12" style={{ color: 'var(--color-border)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            Aucun bénéficiaire trouvé
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
            {search ? 'Essayez avec d\u2019autres termes de recherche.' : 'Aucun bénéficiaire ne correspond à ce filtre.'}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-xl border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-background)' }}>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                    BÉNÉFICIAIRE
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                    PROGRESSION
                  </th>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <th
                      key={n}
                      className="whitespace-nowrap px-2 py-3 text-center font-semibold"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {n}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                    PROCHAINE SÉANCE
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, rowIdx) => (
                  <tr
                    key={b.id}
                    style={{
                      backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
                    }}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* Bénéficiaire */}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          {getInitials(b.full_name)}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                            {b.full_name}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
                            {b.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Progression */}
                    <td className="px-4 py-3">{renderProgressionBar(b.phases)}</td>

                    {/* Phases 1-6 */}
                    {b.phases.map((phase, phaseIdx) => (
                      <td key={phaseIdx} className="px-2 py-3 text-center">
                        <div className="flex justify-center">
                          {renderPhaseCircle(phase, phaseIdx)}
                        </div>
                      </td>
                    ))}

                    {/* Prochaine séance */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {b.next_session ? (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                          <span style={{ color: 'var(--color-text)' }}>
                            {new Date(b.next_session).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="text-sm italic"
                          style={{ color: 'var(--color-warning)' }}
                        >
                          À planifier
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => router.push(`/consultant/beneficiaires/${b.id}`)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                      >
                        Voir le dossier
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Legend                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm" style={{ color: 'var(--color-text)' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: '#28A745' }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>Terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          <span>En cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border-2"
            style={{ borderColor: 'var(--color-border)' }}
          />
          <span>Non commencée</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                         */}
      {/* ------------------------------------------------------------------ */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.6 }}>
            {filtered.length} bénéficiaire{filtered.length > 1 ? 's' : ''} — Page {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border p-2 transition-colors disabled:opacity-40"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border p-2 transition-colors disabled:opacity-40"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
            />
            <div className="absolute flex h-12 w-12 items-center justify-center">
              <ClipboardList className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="ml-12">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {kpis.enCours}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Bilans en cours
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--color-warning)', opacity: 0.1 }}
            />
            <div className="absolute flex h-12 w-12 items-center justify-center">
              <Calendar className="h-6 w-6" style={{ color: 'var(--color-warning)' }} />
            </div>
            <div className="ml-12">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {kpis.seancesCetteSemaine}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Séances cette semaine
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--color-success)', opacity: 0.1 }}
            />
            <div className="absolute flex h-12 w-12 items-center justify-center">
              <CheckCircle className="h-6 w-6" style={{ color: 'var(--color-success)' }} />
            </div>
            <div className="ml-12">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {kpis.termines}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Bilans terminés
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4 p-5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--color-primary)', opacity: 0.1 }}
            />
            <div className="absolute flex h-12 w-12 items-center justify-center">
              <BarChart3 className="h-6 w-6" style={{ color: 'var(--color-primary)' }} />
            </div>
            <div className="ml-12">
              <p className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
                {kpis.tauxCompletion}%
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                Taux complétion moyen
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
