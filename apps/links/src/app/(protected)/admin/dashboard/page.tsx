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
        }
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
      accent: 'var(--color-primary)',
      accentLight: 'var(--color-primary)',
    },
    {
      label: 'Taux d\'avancement moyen',
      value: `${stats?.averageProgress ?? 0}%`,
      icon: TrendingUp,
      accent: 'var(--color-warning)',
      accentLight: 'var(--color-warning)',
      showProgress: true,
      progressValue: stats?.averageProgress ?? 0,
    },
    {
      label: 'Bilans terminés',
      value: stats?.completedBilans ?? 0,
      icon: CheckCircle,
      accent: 'var(--color-success)',
      accentLight: 'var(--color-success)',
    },
    {
      label: 'Consultantes actives',
      value: stats?.activeConsultants ?? 0,
      icon: Star,
      accent: 'var(--color-primary)',
      accentLight: 'var(--color-primary)',
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* ═══ HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary-dark)]">
          Vue d&apos;ensemble — Link&apos;s Accompagnement
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {formatCurrentDate()}
        </p>
        <div className="mt-3 h-[3px] w-14 rounded-full bg-[var(--color-primary)]" />
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                  {kpi.label}
                </p>
                <p className="text-2xl font-bold text-[var(--color-primary-dark)]">
                  {kpi.value}
                </p>
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `color-mix(in srgb, ${kpi.accent} 12%, transparent)` }}
              >
                <kpi.icon
                  className="h-5 w-5"
                  style={{ color: kpi.accent }}
                />
              </div>
            </div>
            {kpi.showProgress && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${kpi.progressValue}%`,
                      backgroundColor: kpi.accent,
                    }}
                  />
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* ═══ BENEFICIAIRES TABLE ═══ */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[var(--color-primary-dark)]">
            Activité bénéficiaires
          </h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Rechercher un bénéficiaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-64 rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] bg-[var(--color-surface,#fff)] pl-9 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>
            {/* Export */}
            <button
              onClick={handleExportCSV}
              className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] bg-[var(--color-surface,#fff)] px-4 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              <Download className="h-4 w-4" />
              Exporter CSV
            </button>
          </div>
        </div>

        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-hover)]">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Bénéficiaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Consultante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Progression
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Dernière connexion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-[var(--color-primary-dark)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light,var(--color-border))]">
                {paginatedBeneficiaires.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]"
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
                        className={`group transition-colors hover:bg-[var(--color-surface-hover)]/50 ${
                          inactive
                            ? 'border-l-[3px] border-l-[var(--color-warning)]'
                            : ''
                        }`}
                      >
                        {/* Avatar + Name + Email */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{
                                backgroundColor: inactive
                                  ? 'var(--color-text-muted)'
                                  : 'var(--color-primary)',
                              }}
                            >
                              {getInitials(b.full_name)}
                            </div>
                            <div>
                              <p className="font-medium text-[var(--color-text)]">
                                {b.full_name}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {b.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Consultante */}
                        <td className="px-4 py-3 text-[var(--color-text)]">
                          {b.consultant_name}
                        </td>

                        {/* Progression */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--color-border)]">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${b.progress}%`,
                                  backgroundColor:
                                    b.progress === 100
                                      ? 'var(--color-success)'
                                      : b.progress >= 50
                                        ? 'var(--color-primary)'
                                        : 'var(--color-warning)',
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-[var(--color-text-muted)]">
                              {b.progress}%
                            </span>
                          </div>
                        </td>

                        {/* Dernière connexion */}
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">
                          {formatRelativeTime(b.updated_at)}
                        </td>

                        {/* Statut badge */}
                        <td className="px-4 py-3">
                          {inactive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                              <AlertTriangle className="h-3 w-3" />
                              Inactif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Actif
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              router.push(`/beneficiaires/${b.id}`)
                            }
                            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-dark)]"
                          >
                            Voir le dossier
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
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
            <div className="flex items-center justify-between border-t border-[var(--color-border-light,var(--color-border))] px-4 py-3">
              <p className="text-xs text-[var(--color-text-muted)]">
                {filteredBeneficiaires.length} bénéficiaire
                {filteredBeneficiaires.length > 1 ? 's' : ''} &middot; Page{' '}
                {currentPage} sur {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  disabled={currentPage === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md,0.5rem)] text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]'
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
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-md,0.5rem)] border border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
