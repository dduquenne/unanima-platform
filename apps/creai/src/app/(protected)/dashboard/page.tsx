'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Card, Spinner } from '@unanima/core'
import { AlertPanel, ChartWrapper, KPICard } from '@unanima/dashboard'

interface Etablissement {
  id: string
  nom: string
  type: 'ehpad' | 'ime' | 'esat' | 'mecs' | 'savs' | 'sessad' | 'foyer' | 'autre'
  statut: 'actif' | 'inactif' | 'en_transformation'
  capacite: number
}

interface Diagnostic {
  id: string
  etablissement_id: string
  statut: 'brouillon' | 'en_cours' | 'finalise' | 'valide'
  date_diagnostic: string
}

interface Indicateur {
  id: string
  etablissement_id: string
  categorie: 'qualite' | 'rh' | 'financier' | 'activite' | 'satisfaction'
  nom: string
  valeur: number
  unite: string
  periode: string
}

interface Recommandation {
  id: string
  diagnostic_id: string
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse'
  statut: 'proposee' | 'acceptee' | 'en_cours' | 'realisee' | 'rejetee'
}

interface Rapport {
  id: string
  titre: string
  echeance: string
  statut: string
}

interface Alert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  action?: string
}

interface DashboardData {
  etablissements: Etablissement[]
  diagnostics: Diagnostic[]
  indicateurs: Indicateur[]
  recommandations: Recommandation[]
  rapports: Rapport[]
}

const TYPE_LABELS: Record<Etablissement['type'], string> = {
  ehpad: 'EHPAD',
  ime: 'IME',
  esat: 'ESAT',
  mecs: 'MECS',
  savs: 'SAVS',
  sessad: 'SESSAD',
  foyer: 'Foyer',
  autre: 'Autre',
}

function computeScoreMoyen(indicateurs: Indicateur[]): number {
  if (indicateurs.length === 0) return 0
  const total = indicateurs.reduce((sum, ind) => sum + ind.valeur, 0)
  return Math.round((total / indicateurs.length) * 10) / 10
}

function computeTypeDistribution(etablissements: Etablissement[]): Record<string, unknown>[] {
  const counts = new Map<string, number>()
  for (const etab of etablissements) {
    const label = TYPE_LABELS[etab.type] ?? etab.type
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return Array.from(counts.entries()).map(([type, nombre]) => ({
    type,
    nombre,
  }))
}

function computeIndicateurEvolution(indicateurs: Indicateur[]): Record<string, unknown>[] {
  const byPeriode = new Map<string, { total: number; count: number }>()
  for (const ind of indicateurs) {
    const entry = byPeriode.get(ind.periode) ?? { total: 0, count: 0 }
    entry.total += ind.valeur
    entry.count += 1
    byPeriode.set(ind.periode, entry)
  }
  return Array.from(byPeriode.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periode, { total, count }]) => ({
      periode,
      moyenne: Math.round((total / count) * 10) / 10,
    }))
}

function buildAlerts(
  rapports: Rapport[],
  indicateurs: Indicateur[]
): Alert[] {
  const alerts: Alert[] = []

  for (const rapport of rapports) {
    const echeance = new Date(rapport.echeance)
    const now = new Date()
    const diffDays = Math.ceil((echeance.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      alerts.push({
        id: `rapport-overdue-${rapport.id}`,
        severity: 'error',
        title: 'Rapport en retard',
        message: `Le rapport "${rapport.titre}" a dépassé son échéance de ${Math.abs(diffDays)} jour(s).`,
      })
    } else if (diffDays <= 7) {
      alerts.push({
        id: `rapport-soon-${rapport.id}`,
        severity: 'warning',
        title: 'Échéance proche',
        message: `Le rapport "${rapport.titre}" est attendu dans ${diffDays} jour(s).`,
      })
    }
  }

  const SEUIL_BAS = 50
  const lowIndicateurs = indicateurs.filter((ind) => ind.valeur < SEUIL_BAS)
  for (const ind of lowIndicateurs) {
    alerts.push({
      id: `indicateur-low-${ind.id}`,
      severity: 'warning',
      title: 'Indicateur en dessous du seuil',
      message: `L'indicateur "${ind.nom}" est à ${ind.valeur} ${ind.unite} (seuil : ${SEUIL_BAS}).`,
    })
  }

  return alerts
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [etablissementsRes, diagnosticsRes, rapportsRes] = await Promise.all([
        fetch('/api/etablissements'),
        fetch('/api/diagnostics'),
        fetch('/api/rapports'),
      ])

      if (!etablissementsRes.ok || !diagnosticsRes.ok || !rapportsRes.ok) {
        throw new Error('Erreur lors du chargement des données.')
      }

      const etablissementsData = (await etablissementsRes.json()) as {
        etablissements: Etablissement[]
        indicateurs?: Indicateur[]
        recommandations?: Recommandation[]
      }
      const diagnosticsData = (await diagnosticsRes.json()) as {
        diagnostics: Diagnostic[]
        recommandations?: Recommandation[]
        indicateurs?: Indicateur[]
      }
      const rapportsData = (await rapportsRes.json()) as {
        rapports: Rapport[]
      }

      setData({
        etablissements: etablissementsData.etablissements ?? [],
        diagnostics: diagnosticsData.diagnostics ?? [],
        indicateurs:
          diagnosticsData.indicateurs ?? etablissementsData.indicateurs ?? [],
        recommandations:
          diagnosticsData.recommandations ?? etablissementsData.recommandations ?? [],
        rapports: rapportsData.rapports ?? [],
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
          Tableau de bord
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--color-danger, #dc2626)' }}>
              {error}
            </p>
            <button
              onClick={fetchData}
              className="mt-4 rounded px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Réessayer
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const etablissementsActifs = data.etablissements.filter(
    (e) => e.statut === 'actif' || e.statut === 'en_transformation'
  )
  const diagnosticsEnCours = data.diagnostics.filter(
    (d) => d.statut === 'en_cours' || d.statut === 'brouillon'
  )
  const recommandationsOuvertes = data.recommandations.filter(
    (r) => r.statut === 'proposee' || r.statut === 'acceptee' || r.statut === 'en_cours'
  )
  const scoreMoyen = computeScoreMoyen(data.indicateurs)
  const typeDistribution = computeTypeDistribution(data.etablissements)
  const indicateurEvolution = computeIndicateurEvolution(data.indicateurs)
  const alerts = buildAlerts(data.rapports, data.indicateurs)

  const isEmpty =
    data.etablissements.length === 0 &&
    data.diagnostics.length === 0 &&
    data.indicateurs.length === 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>
        Bienvenue, {user?.fullName ?? 'Utilisateur'}
      </h2>

      {isEmpty ? (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              Aucune donnée disponible pour le moment.
            </p>
            <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Les indicateurs et statistiques apparaîtront ici une fois les données saisies.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              title="Établissements suivis"
              value={etablissementsActifs.length}
              color="primary"
            />
            <KPICard
              title="Diagnostics en cours"
              value={diagnosticsEnCours.length}
              color="info"
            />
            <KPICard
              title="Recommandations ouvertes"
              value={recommandationsOuvertes.length}
              color="warning"
            />
            <KPICard
              title="Score moyen indicateurs"
              value={scoreMoyen}
              color="success"
            />
          </div>

          {/* Alertes */}
          {alerts.length > 0 && (
            <AlertPanel alerts={alerts} />
          )}

          {/* Graphiques */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card padding="lg">
              <h3
                className="mb-4 text-lg font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Répartition par type d&apos;établissement
              </h3>
              {typeDistribution.length > 0 ? (
                <ChartWrapper
                  type="pie"
                  data={typeDistribution}
                  config={{
                    xAxisKey: 'type',
                    yAxisKey: 'nombre',
                    showLegend: true,
                  }}
                  height={300}
                />
              ) : (
                <p
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Aucune donnée disponible.
                </p>
              )}
            </Card>

            <Card padding="lg">
              <h3
                className="mb-4 text-lg font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Évolution des indicateurs
              </h3>
              {indicateurEvolution.length > 0 ? (
                <ChartWrapper
                  type="line"
                  data={indicateurEvolution}
                  config={{
                    xAxisKey: 'periode',
                    yAxisKey: 'moyenne',
                    showLegend: false,
                    showGrid: true,
                  }}
                  height={300}
                />
              ) : (
                <p
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Aucune donnée disponible.
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
