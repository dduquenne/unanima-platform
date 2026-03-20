'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Card, Spinner } from '@unanima/core'
import { AlertPanel, ChartWrapper, KPICard } from '@unanima/dashboard'
import { ProgressBar } from '@unanima/dashboard'
import type { Alert } from '@unanima/dashboard'

import type { Beneficiaire, Bilan, Document } from '@/lib/types/database'

// ---------------------------------------------------------------------------
// Types internes
// ---------------------------------------------------------------------------

interface DashboardData {
  beneficiaires: Beneficiaire[]
  bilans: Bilan[]
}

interface BeneficiaireViewData {
  bilans: Bilan[]
  documents: Document[]
}

interface MonthlyBilanEntry {
  name: string
  value: number
}

// ---------------------------------------------------------------------------
// Utilitaires
// ---------------------------------------------------------------------------

function computeKPIs(beneficiaires: Beneficiaire[], bilans: Bilan[]) {
  const actifs = beneficiaires.filter((b) => b.statut === 'actif').length
  const enCours = bilans.filter((b) => b.statut === 'en_cours').length
  const termines = bilans.filter(
    (b) => b.statut === 'termine' || b.statut === 'valide',
  ).length
  const total = bilans.length
  const tauxCompletion = total > 0 ? Math.round((termines / total) * 100) : 0

  return { actifs, enCours, termines, tauxCompletion }
}

function buildAlerts(bilans: Bilan[]): Alert[] {
  const alerts: Alert[] = []

  const bilansEnCours = bilans.filter((b) => b.statut === 'en_cours')
  if (bilansEnCours.length > 0) {
    const nearingEnd = bilansEnCours.slice(0, 3)
    nearingEnd.forEach((bilan, index) => {
      alerts.push({
        id: `bilan-near-${bilan.id}`,
        severity: index === 0 ? 'warning' : 'info',
        title: 'Bilan en cours proche de la fin',
        message: `Le bilan ${bilan.type} (${bilan.id.slice(0, 8)}...) est en cours depuis le ${bilan.date_debut ? new Date(bilan.date_debut).toLocaleDateString('fr-FR') : 'N/A'}. Pensez à planifier la prochaine étape.`,
      })
    })
  }

  const brouillons = bilans.filter((b) => b.statut === 'brouillon')
  if (brouillons.length > 0) {
    alerts.push({
      id: 'questionnaires-non-remplis',
      severity: 'warning',
      title: 'Questionnaires non remplis',
      message: `${brouillons.length} bilan(s) en brouillon avec des questionnaires en attente de réponse.`,
    })
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-good',
      severity: 'success',
      title: 'Tout est à jour',
      message: 'Aucune action urgente requise pour le moment.',
    })
  }

  return alerts
}

function buildMonthlyChart(bilans: Bilan[]): MonthlyBilanEntry[] {
  const monthCounts: Record<string, number> = {}

  for (const bilan of bilans) {
    const dateStr = bilan.date_debut ?? bilan.created_at
    if (!dateStr) continue
    const date = new Date(dateStr)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthCounts[key] = (monthCounts[key] ?? 0) + 1
  }

  const sortedKeys = Object.keys(monthCounts).sort()

  return sortedKeys.map((key) => {
    const [year, month] = key.split('-')
    const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(
      'fr-FR',
      { month: 'short', year: '2-digit' },
    )
    return { name: label, value: monthCounts[key] ?? 0 }
  })
}

function computeBeneficiaireProgress(bilans: Bilan[]): number {
  if (bilans.length === 0) return 0
  const completed = bilans.filter(
    (b) => b.statut === 'termine' || b.statut === 'valide',
  ).length
  return Math.round((completed / bilans.length) * 100)
}

// ---------------------------------------------------------------------------
// Vues
// ---------------------------------------------------------------------------

function ConsultantDashboard({
  beneficiaires,
  bilans,
}: DashboardData) {
  const kpis = computeKPIs(beneficiaires, bilans)
  const alerts = buildAlerts(bilans)
  const chartData = buildMonthlyChart(bilans)
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const handleDismiss = useCallback((id: string) => {
    setDismissedAlerts((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }, [])

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KPICard
          title="Bénéficiaires actifs"
          value={kpis.actifs}
          color="primary"
        />
        <KPICard
          title="Bilans en cours"
          value={kpis.enCours}
          color="info"
        />
        <KPICard
          title="Bilans terminés"
          value={kpis.termines}
          color="success"
        />
        <KPICard
          title="Taux de complétion"
          value={`${kpis.tauxCompletion} %`}
          color="warning"
        />
      </div>

      {/* Alertes */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
          Alertes et notifications
        </h3>
        <AlertPanel
          alerts={visibleAlerts}
          onDismiss={handleDismiss}
        />
      </section>

      {/* Graphique */}
      <section>
        <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
          Évolution des bilans par mois
        </h3>
        {chartData.length > 0 ? (
          <ChartWrapper
            type="bar"
            data={chartData}
            config={{
              xAxisKey: 'name',
              yAxisKey: 'value',
              showLegend: false,
              showGrid: true,
            }}
            height={320}
          />
        ) : (
          <Card padding="lg">
            <p className="py-8 text-center text-sm text-[var(--color-text-secondary)]">
              Aucune donnée disponible pour le graphique.
            </p>
          </Card>
        )}
      </section>
    </>
  )
}

function BeneficiaireDashboard({
  bilans,
  documents,
}: BeneficiaireViewData) {
  const progress = computeBeneficiaireProgress(bilans)
  const currentBilan = bilans.find((b) => b.statut === 'en_cours') ?? bilans[0]
  const recentDocuments = [...documents]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 5)

  return (
    <>
      {/* Progression du bilan */}
      <Card padding="lg">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Progression de votre bilan
        </h3>
        {currentBilan ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]">
              <span>
                Bilan {currentBilan.type} — Statut :{' '}
                <span className="font-medium text-[var(--color-text)]">
                  {currentBilan.statut.replace('_', ' ')}
                </span>
              </span>
              {currentBilan.date_debut && (
                <span>
                  Début :{' '}
                  {new Date(currentBilan.date_debut).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
            <ProgressBar
              value={progress}
              label="Avancement global"
              showPercentage
              color={progress >= 75 ? 'success' : progress >= 40 ? 'primary' : 'warning'}
              animated
            />
          </div>
        ) : (
          <p className="py-4 text-sm text-[var(--color-text-secondary)]">
            Aucun bilan en cours pour le moment.
          </p>
        )}
      </Card>

      {/* Documents récents */}
      <Card padding="lg">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Documents récents
        </h3>
        {recentDocuments.length > 0 ? (
          <ul className="divide-y divide-[var(--color-border)]">
            {recentDocuments.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {doc.nom}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {doc.type.replace('_', ' ')} —{' '}
                    {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-[var(--color-text-secondary)]">
            Aucun document disponible.
          </p>
        )}
      </Card>
    </>
  )
}

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [beneficiaires, setBeneficiaires] = useState<Beneficiaire[]>([])
  const [bilans, setBilans] = useState<Bilan[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isBeneficiaire = user?.role === 'beneficiaire'

  useEffect(() => {
    if (authLoading) return

    const controller = new AbortController()

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        if (isBeneficiaire) {
          // Le bénéficiaire ne voit que ses propres bilans et documents
          const [bilansRes, docsRes] = await Promise.all([
            fetch('/api/bilans', { signal: controller.signal }),
            fetch('/api/documents', { signal: controller.signal }),
          ])

          if (!bilansRes.ok) {
            throw new Error(`Erreur lors du chargement des bilans (${bilansRes.status})`)
          }

          const bilansData: Bilan[] = await bilansRes.json()
          setBilans(bilansData)

          if (docsRes.ok) {
            const docsData: Document[] = await docsRes.json()
            setDocuments(docsData)
          }
        } else {
          // Consultant / super_admin : données globales
          const [benefRes, bilansRes] = await Promise.all([
            fetch('/api/beneficiaires', { signal: controller.signal }),
            fetch('/api/bilans', { signal: controller.signal }),
          ])

          if (!benefRes.ok) {
            throw new Error(
              `Erreur lors du chargement des bénéficiaires (${benefRes.status})`,
            )
          }
          if (!bilansRes.ok) {
            throw new Error(
              `Erreur lors du chargement des bilans (${bilansRes.status})`,
            )
          }

          const benefData: Beneficiaire[] = await benefRes.json()
          const bilansData: Bilan[] = await bilansRes.json()
          setBeneficiaires(benefData)
          setBilans(bilansData)
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message =
          err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    return () => {
      controller.abort()
    }
  }, [authLoading, isBeneficiaire])

  // --- États de chargement et erreur ---

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">
          Tableau de bord
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-[var(--radius-md,0.5rem)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-dark)]"
            >
              Réessayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // --- Rendu ---

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Bienvenue, {user?.fullName}
      </h2>

      {isBeneficiaire ? (
        <BeneficiaireDashboard bilans={bilans} documents={documents} />
      ) : (
        <ConsultantDashboard beneficiaires={beneficiaires} bilans={bilans} />
      )}
    </div>
  )
}
