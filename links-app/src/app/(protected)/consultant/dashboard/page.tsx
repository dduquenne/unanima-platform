'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
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
  AlertCircle,
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

function isInactiveSince7Days(lastActivityAt: string | null | undefined): boolean {
  if (!lastActivityAt) return false
  const lastActivity = new Date(lastActivityAt)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return lastActivity < sevenDaysAgo
}

function countByFilter(beneficiaires: BeneficiaireWithParcours[], filterKey: FilterKey): number {
  return beneficiaires.filter((b) => matchesFilter(b.phases, filterKey)).length
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
  const [errorToast, setErrorToast] = useState<string | null>(null)

  // Auto-dismiss error toast after 5s
  useEffect(() => {
    if (!errorToast) return
    const timer = setTimeout(() => setErrorToast(null), 5000)
    return () => clearTimeout(timer)
  }, [errorToast])

  // --- Data fetching -------------------------------------------------------

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/consultant/beneficiaires')
        if (!res.ok) throw new Error('Erreur lors du chargement')
        const json = await res.json()
        const list: BeneficiaireWithParcours[] = (json.data ?? json) as BeneficiaireWithParcours[]
        // Ensure every beneficiary has exactly 6 phase entries
        const normalized = list.map((b) => {
          const phaseMap = new Map(b.phases.map((p) => [p.phase_number, p.status]))
          const phases = Array.from({ length: 6 }, (_, i) => ({
            phase_number: i + 1,
            status: phaseMap.get(i + 1) ?? ('libre' as const),
          }))
          return { ...b, phases }
        })
        setBeneficiaires(normalized)
      } catch {
        setErrorToast('Impossible de charger les données. Veuillez réessayer.')
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

    // Default sort: next session ASC (null at end)
    list = [...list].sort((a, b) => {
      if (!a.next_session && !b.next_session) return 0
      if (!a.next_session) return 1
      if (!b.next_session) return -1
      return new Date(a.next_session).getTime() - new Date(b.next_session).getTime()
    })

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

    const seancesCetteSemaine = beneficiaires.filter((b) => {
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
    }).length

    const aPlanifier = beneficiaires.filter((b) => !b.next_session).length

    return { enCours, seancesCetteSemaine, termines, tauxCompletion, aPlanifier }
  }, [beneficiaires])

  // --- Active beneficiaries count for badge --------------------------------

  const activeBeneficiairesCount = beneficiaires.filter((b) => {
    const { validee } = countPhasesByStatus(b.phases)
    return validee < 6
  }).length

  // --- Filter buttons config -----------------------------------------------

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'tous', label: `Tous (${beneficiaires.length})` },
    { key: 'en_cours', label: `En cours (${countByFilter(beneficiaires, 'en_cours')})` },
    { key: 'a_demarrer', label: `À démarrer (${countByFilter(beneficiaires, 'a_demarrer')})` },
    { key: 'termines', label: `Terminés (${countByFilter(beneficiaires, 'termines')})` },
  ]

  // --- Render helpers ------------------------------------------------------

  function isTermine(phases: Phase[]): boolean {
    return countPhasesByStatus(phases).validee === 6
  }

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
          style={{ backgroundColor: '#F28C5A' }}
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
        style={{ borderColor: '#E0D5CC' }}
        title={`Phase ${index + 1} — Non commencée`}
      />
    )
  }

  function renderProgressionBar(phases: Phase[]) {
    const { validee } = countPhasesByStatus(phases)
    const pct = Math.round((validee / 6) * 100)
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: '#2C2C3E' }}>
          {validee}/6
        </span>
        <div
          className="h-2 w-28 overflow-hidden rounded-full"
          style={{ backgroundColor: '#F0E6DE' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              backgroundColor: 'var(--color-primary)',
            }}
          />
        </div>
        <span className="text-xs" style={{ color: '#A09080' }}>
          {pct}%
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
      {/* Error toast */}
      {errorToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-[18px] border border-[#F5C6CB] bg-[#F8D7DA] px-5 py-3 text-[#721C24] shadow-lg">
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
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-bold" style={{ color: '#2C2C3E' }}>
            Mon portefeuille bénéficiaires
          </h1>
          <span
            className="inline-flex items-center rounded-full px-4 py-1 text-[12.5px] font-semibold"
            style={{ backgroundColor: '#E4F0FD', color: '#2A7FD4' }}
          >
            {activeBeneficiairesCount} bénéficiaire{activeBeneficiairesCount > 1 ? 's' : ''} actif{activeBeneficiairesCount > 1 ? 's' : ''}
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
              className="rounded-full px-5 py-2 text-[12.5px] font-medium transition-colors"
              style={
                filter === f.key
                  ? {
                      backgroundColor: '#2A7FD4',
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: '#FFF8F5',
                      color: '#6B5A50',
                      border: '1.5px solid #E8D8CE',
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative w-full sm:w-[430px]">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: '#A09080' }}
          />
          <input
            type="text"
            placeholder="Rechercher un bénéficiaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border py-2 pl-11 pr-4 text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#2A7FD4]"
            style={{
              borderColor: '#E8D8CE',
              color: '#2C2C3E',
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
          className="flex flex-col items-center justify-center rounded-[20px] border py-16"
          style={{ borderColor: '#E8D8CE', backgroundColor: '#FFFFFF' }}
        >
          <Users className="mb-4 h-12 w-12" style={{ color: '#E0D5CC' }} />
          <p className="text-lg font-medium" style={{ color: '#2C2C3E' }}>
            {beneficiaires.length === 0 ? 'Aucun bénéficiaire assigné' : 'Aucun bénéficiaire trouvé'}
          </p>
          <p className="mt-1 text-sm" style={{ color: '#A09080' }}>
            {beneficiaires.length === 0
              ? 'Contactez votre administrateur.'
              : search
                ? 'Essayez avec d\u2019autres termes de recherche.'
                : 'Aucun bénéficiaire ne correspond à ce filtre.'}
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden rounded-[20px]"
          style={{
            backgroundColor: '#FFFFFF',
            boxShadow: '0 3px 16px rgba(212, 165, 116, 0.12)',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#FDF6F1' }}>
                  <th
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#6B5A50', letterSpacing: '0.5px' }}
                  >
                    BÉNÉFICIAIRE
                  </th>
                  <th
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#6B5A50', letterSpacing: '0.5px' }}
                  >
                    PROGRESSION
                  </th>
                  <th
                    className="whitespace-nowrap px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#6B5A50', letterSpacing: '0.5px' }}
                    colSpan={6}
                  >
                    PHASES 1-6
                  </th>
                  <th
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#6B5A50', letterSpacing: '0.5px' }}
                  >
                    PROCHAINE SÉANCE
                  </th>
                  <th
                    className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#6B5A50', letterSpacing: '0.5px' }}
                  >
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, rowIdx) => {
                  const termine = isTermine(b.phases)
                  return (
                    <tr
                      key={b.id}
                      style={{
                        backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#FDFAF7',
                      }}
                      className="transition-colors"
                    >
                      {/* Bénéficiaire */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: termine ? '#28A745' : 'var(--color-primary)' }}
                          >
                            {getInitials(b.full_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold" style={{ color: '#2C2C3E' }}>
                                {b.full_name}
                              </span>
                              {termine && (
                                <span
                                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
                                  style={{ backgroundColor: '#E8F5E9', color: '#28A745' }}
                                >
                                  Terminé ✓
                                </span>
                              )}
                              {isInactiveSince7Days(b.last_activity_at) && !termine && (
                                <span
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                                  style={{ backgroundColor: '#DC3545' }}
                                  title="Inactif depuis plus de 7 jours"
                                >
                                  Inactif
                                </span>
                              )}
                            </div>
                            <div className="text-[11.5px]" style={{ color: '#A09080' }}>
                              {b.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Progression */}
                      <td className="px-4 py-4">{renderProgressionBar(b.phases)}</td>

                      {/* Phases 1-6 */}
                      {b.phases.map((phase, phaseIdx) => (
                        <td key={phaseIdx} className="px-1 py-4 text-center">
                          <div className="flex justify-center">
                            {renderPhaseCircle(phase, phaseIdx)}
                          </div>
                        </td>
                      ))}

                      {/* Prochaine séance */}
                      <td className="whitespace-nowrap px-4 py-4">
                        {b.next_session ? (
                          <span className="text-[13.5px] font-medium" style={{ color: '#2C2C3E' }}>
                            {new Date(b.next_session).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-semibold"
                            style={{ backgroundColor: '#FFF0E0', color: '#D4700A' }}
                          >
                            À planifier
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => router.push(`/consultant/beneficiaires/${b.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors hover:opacity-90"
                          style={
                            termine
                              ? {
                                  backgroundColor: 'transparent',
                                  color: '#2A7FD4',
                                  border: '1.5px solid #2A7FD4',
                                }
                              : {
                                  backgroundColor: '#2A7FD4',
                                  color: '#FFFFFF',
                                }
                          }
                        >
                          Voir le dossier
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Legend                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 flex flex-wrap items-center gap-6 text-[11.5px]" style={{ color: '#6B5A50' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: '#28A745' }}
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>Phase terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: '#F28C5A' }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          <span>Phase en cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-5 w-5 rounded-full border-2"
            style={{ borderColor: '#E0D5CC' }}
          />
          <span>Phase non commencée</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs" style={{ color: '#A09080' }}>
          Affichage de {filtered.length} bénéficiaire{filtered.length > 1 ? 's' : ''} sur {beneficiaires.length}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="flex h-[30px] w-[34px] items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors"
                style={
                  page === currentPage
                    ? { backgroundColor: '#2A7FD4', color: '#FFFFFF' }
                    : { color: '#6B5A50' }
                }
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bilans en cours */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{
            backgroundColor: '#F0F6FE',
            boxShadow: '0 2px 10px rgba(196, 144, 112, 0.10)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]"
            style={{ backgroundColor: '#2A7FD4' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#D6EAFC' }}
            >
              <ClipboardList className="h-5 w-5" style={{ color: '#2A7FD4' }} />
            </div>
            <div>
              <p className="text-[30px] font-bold leading-none" style={{ color: '#2C2C3E' }}>
                {kpis.enCours}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: '#6B5A50' }}>
                Bilans en cours
              </p>
            </div>
          </div>
        </div>

        {/* Séances cette semaine */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{
            backgroundColor: '#FEF5EE',
            boxShadow: '0 2px 10px rgba(196, 144, 112, 0.10)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]"
            style={{ backgroundColor: '#F28C5A' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FDDDCC' }}
            >
              <Calendar className="h-5 w-5" style={{ color: '#F28C5A' }} />
            </div>
            <div>
              <p className="text-[30px] font-bold leading-none" style={{ color: '#2C2C3E' }}>
                {kpis.seancesCetteSemaine}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: '#6B5A50' }}>
                Séances cette semaine
              </p>
              {kpis.aPlanifier > 0 && (
                <p className="mt-1 text-[11.5px]" style={{ color: '#F28C5A' }}>
                  {kpis.aPlanifier} à planifier
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bilans terminés */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{
            backgroundColor: '#F0FAF2',
            boxShadow: '0 2px 10px rgba(196, 144, 112, 0.10)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]"
            style={{ backgroundColor: '#28A745' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#C8ECD0' }}
            >
              <CheckCircle className="h-5 w-5" style={{ color: '#28A745' }} />
            </div>
            <div>
              <p className="text-[30px] font-bold leading-none" style={{ color: '#2C2C3E' }}>
                {kpis.termines}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: '#6B5A50' }}>
                Bilans terminés
              </p>
            </div>
          </div>
        </div>

        {/* Taux de complétion */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{
            backgroundColor: '#EEF2F8',
            boxShadow: '0 2px 10px rgba(196, 144, 112, 0.10)',
          }}
        >
          <div
            className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]"
            style={{ backgroundColor: '#1A4A7A' }}
          />
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#D0DCEC' }}
            >
              <BarChart3 className="h-5 w-5" style={{ color: '#1A4A7A' }} />
            </div>
            <div>
              <p className="text-[30px] font-bold leading-none" style={{ color: '#2C2C3E' }}>
                {kpis.tauxCompletion}%
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: '#6B5A50' }}>
                Taux de complétion moyen
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="h-2 w-32 overflow-hidden rounded-full"
                  style={{ backgroundColor: '#E0D5CC' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${kpis.tauxCompletion}%`,
                      backgroundColor: '#1A4A7A',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
