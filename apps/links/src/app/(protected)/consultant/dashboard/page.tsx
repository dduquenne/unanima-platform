'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Users,
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
  return (validee + en_cours > 0) && validee < 6
}

function isInactiveSince7Days(lastActivityAt: string | null | undefined): boolean {
  if (!lastActivityAt) return false
  const lastActivity = new Date(lastActivityAt)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return lastActivity < sevenDaysAgo
}

const ITEMS_PER_PAGE = 10

// Avatar color palette for variety
const AVATAR_COLORS = ['#2A7FD4', '#3A8FE4', '#A09080', '#28A745', '#F28C5A']

function getAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length] ?? '#2A7FD4'
}

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

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (b) =>
          b.full_name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q),
      )
    }

    list = list.filter((b) => matchesFilter(b.phases, filter))

    return list
  }, [beneficiaires, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

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
      } else {
        enCours++
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

  // --- Filter counts -------------------------------------------------------

  const filterCounts = useMemo(() => {
    let enCours = 0
    let aDemarrer = 0
    let termines = 0

    for (const b of beneficiaires) {
      const { validee, en_cours } = countPhasesByStatus(b.phases)
      if (validee === 6) termines++
      else if (validee === 0 && en_cours === 0) aDemarrer++
      else enCours++
    }

    return {
      tous: beneficiaires.length,
      en_cours: enCours,
      a_demarrer: aDemarrer,
      termines,
    }
  }, [beneficiaires])

  const activeBeneficiairesCount = beneficiaires.filter((b) => {
    const { validee } = countPhasesByStatus(b.phases)
    return validee < 6
  }).length

  // --- Filter buttons config -----------------------------------------------

  const filters: { key: FilterKey; label: string; count: number }[] = [
    { key: 'tous', label: 'Tous', count: filterCounts.tous },
    { key: 'en_cours', label: 'En cours', count: filterCounts.en_cours },
    { key: 'a_demarrer', label: 'À démarrer', count: filterCounts.a_demarrer },
    { key: 'termines', label: 'Terminés', count: filterCounts.termines },
  ]

  // --- Render helpers ------------------------------------------------------

  function renderPhaseCircle(phase: Phase, index: number) {
    if (phase.status === 'validee') {
      return (
        <div
          key={index}
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-success)' }}
          title={`Phase ${index + 1} — Terminée`}
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
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
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-accent)' }}
          title={`Phase ${index + 1} — En cours`}
        >
          <div className="h-2 w-2 rounded-full bg-white" />
        </div>
      )
    }

    return (
      <div
        key={index}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2"
        style={{ borderColor: '#E0D5CC' }}
        title={`Phase ${index + 1} — Non commencée`}
      />
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
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl border bg-[#F8D7DA] border-[#F5C6CB] px-5 py-3 text-[#721C24] shadow-lg">
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
      <div className="mb-8 flex items-center gap-3">
        <h1
          className="text-[22px] font-bold"
          style={{ color: 'var(--color-primary-dark)' }}
        >
          Mon portefeuille bénéficiaires
        </h1>
        <span
          className="inline-flex items-center rounded-full px-4 py-1 text-[13px] font-semibold"
          style={{ backgroundColor: '#E4F0FD', color: 'var(--color-primary)' }}
        >
          {activeBeneficiairesCount} bénéficiaire{activeBeneficiairesCount > 1 ? 's' : ''} actif{activeBeneficiairesCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filters & Search                                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter buttons — pill-shaped */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="rounded-full px-5 py-2 text-[13px] font-medium transition-all"
              style={
                filter === f.key
                  ? {
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                    }
                  : {
                      backgroundColor: 'var(--color-background)',
                      color: '#6B5A50',
                      border: '1.5px solid var(--color-border)',
                    }
              }
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>

        {/* Search bar — pill-shaped */}
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: '#A09080' }}
          />
          <input
            type="text"
            placeholder="Rechercher un bénéficiaire…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-[1.5px] py-2.5 pl-11 pr-4 text-[13px] outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)]/20"
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
          className="flex flex-col items-center justify-center rounded-[20px] border py-16"
          style={{ borderColor: 'var(--color-border)', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-md)' }}
        >
          <Users className="mb-4 h-12 w-12" style={{ color: 'var(--color-border)' }} />
          <p className="text-lg font-medium" style={{ color: 'var(--color-text)' }}>
            {beneficiaires.length === 0 ? 'Aucun bénéficiaire assigné' : 'Aucun bénéficiaire trouvé'}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
          style={{ backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: '#FDF6F1' }}>
                  <th className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B5A50' }}>
                    Bénéficiaire
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B5A50' }}>
                    Progression
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B5A50' }}>
                    Phases 1-6
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B5A50' }}>
                    Prochaine séance
                  </th>
                  <th className="whitespace-nowrap px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: '#6B5A50' }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, rowIdx) => {
                  const { validee } = countPhasesByStatus(b.phases)
                  const pct = Math.round((validee / 6) * 100)
                  const isTermine = validee === 6

                  return (
                    <tr
                      key={b.id}
                      style={{
                        backgroundColor: rowIdx % 2 === 0 ? '#FFFFFF' : '#FDFAF7',
                      }}
                      className="transition-colors hover:bg-[#FFF5EF]"
                    >
                      {/* Bénéficiaire */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: getAvatarColor(rowIdx) }}
                          >
                            {getInitials(b.full_name)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[14px] font-semibold" style={{ color: '#2C2C3E' }}>
                                {b.full_name}
                              </span>
                              {isTermine && (
                                <span
                                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold"
                                  style={{ backgroundColor: '#E8F5E9', color: 'var(--color-success)' }}
                                >
                                  Terminé ✓
                                </span>
                              )}
                              {isInactiveSince7Days(b.last_activity_at) && !isTermine && (
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
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[13px] font-semibold" style={{ color: '#2C2C3E' }}>
                            {validee}/6
                          </span>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-[125px] overflow-hidden rounded-full"
                              style={{ backgroundColor: '#F0E6DE' }}
                            >
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: isTermine ? 'var(--color-success)' : 'var(--color-primary)',
                                }}
                              />
                            </div>
                            <span className="text-[10.5px]" style={{ color: '#A09080' }}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phases 1-6 */}
                      <td className="px-4 py-4">
                        <div className="flex gap-1.5">
                          {b.phases.map((phase, phaseIdx) => (
                            <div key={phaseIdx}>
                              {renderPhaseCircle(phase, phaseIdx)}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Prochaine séance */}
                      <td className="whitespace-nowrap px-4 py-4">
                        {isTermine ? (
                          <span
                            className="inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-semibold"
                            style={{ backgroundColor: '#E8F5E9', color: 'var(--color-success)' }}
                          >
                            Bilan terminé
                          </span>
                        ) : b.next_session ? (
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
                          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[12.5px] font-semibold transition-all hover:opacity-90"
                          style={
                            isTermine
                              ? {
                                  backgroundColor: 'transparent',
                                  color: 'var(--color-primary)',
                                  border: '1.5px solid var(--color-primary)',
                                }
                              : {
                                  backgroundColor: 'var(--color-primary)',
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
            className="flex h-4 w-4 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span>Phase terminée</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex h-4 w-4 items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          </div>
          <span>Phase en cours</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-4 w-4 rounded-full border-2"
            style={{ borderColor: '#E0D5CC' }}
          />
          <span>Phase non commencée</span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px]" style={{ color: '#A09080' }}>
          Affichage de {filtered.length} bénéficiaire{filtered.length > 1 ? 's' : ''} sur {beneficiaires.length}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full p-2 transition-colors disabled:opacity-40"
              style={{ color: 'var(--color-text)' }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[12.5px] font-semibold transition-colors"
                style={
                  page === currentPage
                    ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
                    : { color: 'var(--color-text)' }
                }
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full p-2 transition-colors disabled:opacity-40"
              style={{ color: 'var(--color-text)' }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* KPI Cards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bilans en cours */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{ backgroundColor: '#F0F6FE', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]" style={{ backgroundColor: 'var(--color-primary)' }} />
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#D6EAFC' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="5" width="5" height="10" rx="1" fill="#2A7FD4" />
                <rect x="10" y="3" width="5" height="12" rx="1" fill="#2A7FD4" opacity="0.6" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#2C2C3E' }}>{kpis.enCours}</p>
              <p className="text-[12.5px]" style={{ color: '#6B5A50' }}>Bilans en cours</p>
            </div>
          </div>
        </div>

        {/* Séances cette semaine */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{ backgroundColor: '#FEF5EE', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]" style={{ backgroundColor: 'var(--color-accent)' }} />
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#FDDDCC' }}
            >
              <Calendar className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#2C2C3E' }}>{kpis.seancesCetteSemaine}</p>
              <p className="text-[12.5px]" style={{ color: '#6B5A50' }}>Séances cette semaine</p>
            </div>
          </div>
        </div>

        {/* Bilans terminés */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{ backgroundColor: '#F0FAF2', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]" style={{ backgroundColor: 'var(--color-success)' }} />
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#C8ECD0' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#28A745" strokeWidth="2" fill="none" />
                <path d="M7 10L9 12L13 8" stroke="#28A745" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#2C2C3E' }}>{kpis.termines}</p>
              <p className="text-[12.5px]" style={{ color: '#6B5A50' }}>Bilans terminés</p>
            </div>
          </div>
        </div>

        {/* Taux de complétion moyen */}
        <div
          className="relative overflow-hidden rounded-[18px] p-5"
          style={{ backgroundColor: '#EEF2F8', boxShadow: 'var(--shadow-md)' }}
        >
          <div className="absolute left-0 top-0 h-full w-[5px] rounded-l-[18px]" style={{ backgroundColor: 'var(--color-primary-dark)' }} />
          <div className="flex items-center gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: '#D0DCEC' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="7" stroke="#0D3B6E" strokeWidth="2.5" fill="none"
                  strokeDasharray={`${(kpis.tauxCompletion / 100) * 44} 44`}
                  strokeDashoffset="11"
                  transform="rotate(-90 10 10)"
                />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold" style={{ color: '#2C2C3E' }}>{kpis.tauxCompletion}%</p>
              <p className="text-[12.5px]" style={{ color: '#6B5A50' }}>Taux de complétion moyen</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-2 w-[130px] rounded-full" style={{ backgroundColor: '#E0D5CC' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${kpis.tauxCompletion}%`, backgroundColor: 'var(--color-primary-dark)' }}
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
