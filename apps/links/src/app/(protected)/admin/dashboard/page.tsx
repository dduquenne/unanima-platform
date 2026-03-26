'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireRole } from '@unanima/auth'
import { Card } from '@unanima/core'
import {
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminStats {
  activeBeneficiaires: number
  averageProgress: number
  completedBilans: number
  activeConsultants: number
}

interface BeneficiaireRow {
  id: string
  full_name: string
  email: string
  consultant_name: string
  progress: number
  updated_at: string
  role: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2)
    return (
      (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')
    ).toUpperCase()
  return fullName.slice(0, 2).toUpperCase()
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `il y a ${diffDays} jours`
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`
  return `il y a ${Math.floor(diffDays / 30)} mois`
}

function isInactive(dateStr: string): boolean {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays > 14
}

function formatCurrentDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatRefreshTime(): string {
  return new Date().toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isAuthorized, isLoading: isAuthLoading } = useRequireRole('super_admin')

  const [stats, setStats] = useState<AdminStats | null>(null)
  const [beneficiaires, setBeneficiaires] = useState<BeneficiaireRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [errorToast, setErrorToast] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<string>('')

  // Auto-dismiss error toast after 5s
  useEffect(() => {
    if (!errorToast) return
    const timer = setTimeout(() => setErrorToast(null), 5000)
    return () => clearTimeout(timer)
  }, [errorToast])

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAuthorized || isAuthLoading) return

    async function loadData() {
      try {
        const statsRes = await fetch('/api/admin/stats').then((r) =>
          r.ok ? r.json() : null
        )

        if (statsRes?.data) {
          setStats(statsRes.data)
          if (statsRes.data.beneficiaires) {
            setBeneficiaires(statsRes.data.beneficiaires)
          }
          setLastRefresh(formatRefreshTime())
        } else {
          setErrorToast('Impossible de charger les données. Veuillez réessayer.')
        }
      } catch {
        setErrorToast('Impossible de charger les données. Veuillez réessayer.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [isAuthorized, isAuthLoading])

  // ── Filtering & pagination ─────────────────────────────────────────────────

  const filteredBeneficiaires = useMemo(() => {
    if (!searchQuery.trim()) return beneficiaires
    const q = searchQuery.toLowerCase()
    return beneficiaires.filter(
      (b) =>
        b.full_name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
    )
  }, [beneficiaires, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredBeneficiaires.length / PAGE_SIZE))
  const paginatedBeneficiaires = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredBeneficiaires.slice(start, start + PAGE_SIZE)
  }, [filteredBeneficiaires, currentPage])

  const inactiveCount = useMemo(
    () => beneficiaires.filter((b) => isInactive(b.updated_at)).length,
    [beneficiaires]
  )

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isAuthLoading || !user || isLoading) {
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

  if (!isAuthorized) {
    return null
  }

  // ── CSV export ─────────────────────────────────────────────────────────────

  function handleExportCSV() {
    const headers = [
      'Nom',
      'Email',
      'Consultante',
      'Progression',
      'Dernière connexion',
      'Statut',
    ]
    const rows = filteredBeneficiaires.map((b) => [
      b.full_name,
      b.email,
      b.consultant_name,
      `${b.progress}%`,
      formatRelativeTime(b.updated_at),
      isInactive(b.updated_at) ? 'Inactif' : 'Actif',
    ])
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beneficiaires-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── KPI cards config ───────────────────────────────────────────────────────

  const kpis = [
    {
      label: 'Bénéficiaires actifs',
      value: stats?.activeBeneficiaires ?? 0,
      icon: Users,
      borderColor: '#F28C5A',
      iconBg: '#E8F4FD',
      iconColor: '#2A7FD4',
    },
    {
      label: 'Taux d\'avancement moyen',
      value: `${stats?.averageProgress ?? 0}%`,
      icon: TrendingUp,
      borderColor: '#F28C5A',
      iconBg: '#FFF3EB',
      iconColor: '#F28C5A',
      showProgress: true,
      progressValue: stats?.averageProgress ?? 0,
    },
    {
      label: 'Bilans terminés',
      value: stats?.completedBilans ?? 0,
      icon: CheckCircle,
      borderColor: '#22C55E',
      iconBg: '#ECFDF5',
      iconColor: '#22C55E',
      subBadge: stats ? `sur ${stats.activeBeneficiaires} actifs` : undefined,
      subBadgeBg: '#ECFDF5',
      subBadgeColor: '#22C55E',
    },
    {
      label: 'Consultantes actives',
      value: stats?.activeConsultants ?? 0,
      icon: Star,
      borderColor: '#2A7FD4',
      iconBg: '#E8F4FD',
      iconColor: '#2A7FD4',
      subBadge: 'Charge normale',
      subBadgeBg: '#E8F4FD',
      subBadgeColor: '#2A7FD4',
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Error toast */}
      {errorToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-[var(--radius-lg)] border border-[#F5C6CB] bg-[#F8D7DA] px-5 py-3 text-[#721C24] shadow-lg">
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

      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-xl font-bold text-[#2C2017]">
          Vue d{"'"}ensemble — Link{"'"}s Accompagnement
        </h1>
        <p className="mt-1 text-sm text-[#A0927E]">
          Données au {formatCurrentDate()} · Actualisation automatique toutes les 5 min
        </p>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[18px] bg-white p-5 transition-shadow hover:shadow-lg"
            style={{
              border: `2px solid ${kpi.borderColor}`,
              boxShadow: '0 3px 16px rgba(212,165,116,0.12)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: kpi.iconBg }}
              >
                <kpi.icon
                  className="h-5 w-5"
                  style={{ color: kpi.iconColor }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[30px] font-extrabold leading-tight text-[#2C2017]">
                  {kpi.value}
                </p>
                <p className="mt-0.5 text-[13px] text-[#7B6B5A]">
                  {kpi.label}
                </p>
              </div>
            </div>
            {kpi.showProgress && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[#F5E6DB]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${kpi.progressValue}%`,
                      backgroundColor: kpi.borderColor,
                    }}
                  />
                </div>
              </div>
            )}
            {kpi.subBadge && (
              <div className="mt-3">
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={{
                    backgroundColor: kpi.subBadgeBg,
                    color: kpi.subBadgeColor,
                  }}
                >
                  {kpi.subBadge}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ═══ BENEFICIAIRES TABLE ═══ */}
      <section>
        <div className="mb-2">
          <h2 className="text-[17px] font-bold text-[#2C2017]">
            Activité bénéficiaires
          </h2>
          <p className="mt-1 text-[13px] text-[#A0927E]">
            Suivi en temps réel · {filteredBeneficiaires.length} bénéficiaire
            {filteredBeneficiaires.length > 1 ? 's' : ''} actif
            {filteredBeneficiaires.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A0927E]" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[38px] w-72 rounded-full border border-[#F2D5C4] bg-white pl-10 pr-4 text-[13px] text-[var(--color-text)] placeholder:text-[#C4AA90] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
          </div>
          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="inline-flex h-[38px] items-center gap-2 rounded-full bg-[#F28C5A] px-5 text-[12px] font-semibold text-white transition-colors hover:bg-[#E07A48]"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
        </div>

        <div
          className="overflow-hidden rounded-[18px] bg-white"
          style={{ boxShadow: '0 2px 10px rgba(212,165,116,0.1)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FFF8F2]">
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Bénéficiaire
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Consultante
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Progression
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Dernière connexion
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-[#8B7B6B]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5E6DB]">
                {paginatedBeneficiaires.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-[#A0927E]"
                    >
                      Aucun bénéficiaire trouvé.
                    </td>
                  </tr>
                ) : (
                  paginatedBeneficiaires.map((b) => {
                    const inactive = isInactive(b.updated_at)
                    return (
                      <tr
                        key={b.id}
                        className={`group transition-colors ${
                          inactive
                            ? 'bg-[#FFF0E8]'
                            : 'hover:bg-[var(--color-surface-hover)]/50'
                        }`}
                      >
                        {/* Avatar + Name + Email */}
                        <td className={`px-5 py-3 ${inactive ? 'border-l-[4px] border-l-[#F28C5A]' : ''}`}>
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                              style={{
                                backgroundColor: inactive
                                  ? '#F2855A'
                                  : 'var(--color-primary)',
                              }}
                            >
                              {getInitials(b.full_name)}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold text-[#2C2017]">
                                {b.full_name}
                              </p>
                              <p className="text-[11px] text-[#A0927E]">
                                {b.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Consultante */}
                        <td className="px-4 py-3 text-[13px] text-[#2C2017]">
                          {b.consultant_name}
                        </td>

                        {/* Progression */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#2C2017]">
                              {b.progress}%
                            </span>
                            <div className="h-[7px] w-[120px] overflow-hidden rounded-full bg-[#F5E6DB]">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${b.progress}%`,
                                  backgroundColor:
                                    b.progress === 100
                                      ? '#22C55E'
                                      : inactive
                                        ? '#E8553D'
                                        : b.progress >= 50
                                          ? '#22C55E'
                                          : '#F28C5A',
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Dernière connexion */}
                        <td className="px-4 py-3">
                          <span className={`text-[12px] ${inactive ? 'font-semibold text-[#E8553D]' : 'text-[#2C2017]'}`}>
                            {formatRelativeTime(b.updated_at)}
                            {inactive && ' \u26A0'}
                          </span>
                        </td>

                        {/* Statut badge */}
                        <td className="px-4 py-3">
                          {inactive ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF2F2] px-3 py-0.5 text-[11px] font-semibold text-[#E8553D]">
                              Inactif
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-0.5 text-[11px] font-semibold text-[#22C55E]">
                              Actif
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {inactive && (
                              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#F28C5A] text-[14px] font-extrabold text-white">
                                !
                              </span>
                            )}
                            <button
                              onClick={() =>
                                router.push(`/beneficiaires/${b.id}`)
                              }
                              className="text-[12px] font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
                            >
                              Voir le dossier <ArrowRight className="ml-0.5 inline h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ═══ PAGINATION FOOTER ═══ */}
          {filteredBeneficiaires.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#F5E6DB] px-5 py-3">
              <p className="text-[12px] text-[#A0927E]">
                Affichage de {(currentPage - 1) * PAGE_SIZE + 1} à{' '}
                {Math.min(currentPage * PAGE_SIZE, filteredBeneficiaires.length)} sur{' '}
                {filteredBeneficiaires.length} bénéficiaire
                {filteredBeneficiaires.length > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#F2D5C4] bg-[#FFF0E8] text-[#8B7B6B] transition-colors hover:bg-[#FDEBD5] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                        page === currentPage
                          ? 'bg-[#F28C5A] text-white'
                          : 'border border-[#F2D5C4] bg-[#FFF0E8] text-[#8B7B6B] hover:bg-[#FDEBD5]'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#F2D5C4] bg-[#FFF0E8] text-[#8B7B6B] transition-colors hover:bg-[#FDEBD5] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ STATUS BAR ═══ */}
      <div className="flex flex-wrap items-center gap-4 border-t border-[#F2D5C4] bg-white px-4 py-2 text-[10px] rounded-b-[18px]">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
          <span className="text-[#8B7B6B]">Supabase connecté</span>
        </div>
        <span className="text-[#F2D5C4]">|</span>
        <span className="text-[#A0927E]">
          Dernier refresh : {lastRefresh || formatRefreshTime()}
        </span>
        {inactiveCount > 0 && (
          <>
            <span className="text-[#F2D5C4]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#F28C5A]" />
              <span className="text-[#F28C5A]">
                {inactiveCount} alerte{inactiveCount > 1 ? 's' : ''} active{inactiveCount > 1 ? 's' : ''} (inactivité &gt; 14j)
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
