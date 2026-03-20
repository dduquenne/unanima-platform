'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Card, Spinner } from '@unanima/core'
import { AlertPanel, ChartWrapper, KPICard } from '@unanima/dashboard'

import type { Intervention, PieceDetachee } from '@/lib/types'

interface Alert {
  id: string
  severity: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
}

interface ApiResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number }
}

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const daysSinceStart = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7)
  return `S${weekNumber}`
}

function computeDelaiMoyen(interventions: Intervention[]): number {
  const terminated = interventions.filter(
    (i) => i.statut === 'terminee' && i.date_debut && i.date_fin
  )
  if (terminated.length === 0) return 0
  const totalDays = terminated.reduce((sum, i) => {
    const start = new Date(i.date_debut!).getTime()
    const end = new Date(i.date_fin!).getTime()
    return sum + (end - start) / (1000 * 60 * 60 * 24)
  }, 0)
  return Math.round((totalDays / terminated.length) * 10) / 10
}

function computeTauxResolution(interventions: Intervention[]): number {
  const terminated = interventions.filter((i) => i.statut === 'terminee')
  if (terminated.length === 0) return 0
  const firstPass = terminated.filter(
    (i) => i.statut === 'terminee' && i.date_debut && i.date_fin
  )
  const resolved = firstPass.filter((i) => {
    const start = new Date(i.date_debut!).getTime()
    const end = new Date(i.date_fin!).getTime()
    const days = (end - start) / (1000 * 60 * 60 * 24)
    return days <= 1
  })
  return Math.round((resolved.length / terminated.length) * 100)
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [pieces, setPieces] = useState<PieceDetachee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [interventionsRes, piecesRes] = await Promise.all([
        fetch('/api/interventions?limit=1000'),
        fetch('/api/pieces?limit=1000'),
      ])

      if (!interventionsRes.ok || !piecesRes.ok) {
        throw new Error('Erreur lors du chargement des données')
      }

      const interventionsJson: ApiResponse<Intervention> =
        await interventionsRes.json()
      const piecesJson: ApiResponse<PieceDetachee> = await piecesRes.json()

      setInterventions(interventionsJson.data ?? [])
      setPieces(piecesJson.data ?? [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Tableau de bord SAV
        </h2>
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p
              className="text-lg font-medium"
              style={{ color: 'var(--color-danger, #dc2626)' }}
            >
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

  // KPI computations
  const interventionsOuvertes = interventions.filter(
    (i) => i.statut !== 'terminee' && i.statut !== 'annulee'
  )
  const delaiMoyen = computeDelaiMoyen(interventions)
  const tauxResolution = computeTauxResolution(interventions)
  const piecesEnAlerte = pieces.filter(
    (p) => p.stock_actuel < p.seuil_alerte
  )

  // Chart data: interventions par semaine
  const weekCounts = new Map<string, number>()
  for (const intervention of interventions) {
    const dateStr = intervention.date_planifiee ?? intervention.created_at
    if (!dateStr) continue
    const week = getWeekLabel(dateStr)
    weekCounts.set(week, (weekCounts.get(week) ?? 0) + 1)
  }
  const interventionsParSemaine = Array.from(weekCounts.entries())
    .sort(([a], [b]) => {
      const numA = parseInt(a.slice(1), 10)
      const numB = parseInt(b.slice(1), 10)
      return numA - numB
    })
    .map(([semaine, total]) => ({ semaine, total }))

  // Chart data: répartition par type
  const typeCounts = new Map<string, number>()
  const typeLabels: Record<string, string> = {
    garantie: 'Garantie',
    maintenance: 'Maintenance',
    reparation: 'Réparation',
    rappel: 'Rappel',
    diagnostic: 'Diagnostic',
  }
  for (const intervention of interventions) {
    const label = typeLabels[intervention.type] ?? intervention.type
    typeCounts.set(label, (typeCounts.get(label) ?? 0) + 1)
  }
  const repartitionParType = Array.from(typeCounts.entries()).map(
    ([type, nombre]) => ({ type, nombre })
  )

  // Alerts
  const alerts: Alert[] = []

  const interventionsHautesNonAffectees = interventions.filter(
    (i) =>
      (i.priorite === 'haute' || i.priorite === 'critique') &&
      !i.technicien_id &&
      i.statut !== 'terminee' &&
      i.statut !== 'annulee'
  )
  for (const intervention of interventionsHautesNonAffectees) {
    alerts.push({
      id: `intervention-${intervention.id}`,
      severity: 'error',
      title: 'Intervention prioritaire non affectée',
      message: `Intervention ${intervention.type} (priorité ${intervention.priorite}) en attente d'affectation`,
    })
  }

  for (const piece of piecesEnAlerte) {
    alerts.push({
      id: `piece-${piece.id}`,
      severity: 'warning',
      title: 'Stock sous le seuil d\u2019alerte',
      message: `${piece.designation} (${piece.reference}) : ${piece.stock_actuel} en stock, seuil : ${piece.seuil_alerte}`,
    })
  }

  const hasNoData =
    interventions.length === 0 && pieces.length === 0

  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text)' }}
      >
        Bienvenue, {user?.fullName}
      </h2>

      {hasNoData ? (
        <Card padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p
              className="text-lg"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Aucune donnée disponible pour le moment.
            </p>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Les indicateurs s&apos;afficheront dès que des interventions et
              pièces seront enregistrées.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KPICard
              title="Interventions ouvertes"
              value={interventionsOuvertes.length}
              color="primary"
            />
            <KPICard
              title="Délai moyen de traitement"
              value={`${delaiMoyen} jours`}
              color="info"
            />
            <KPICard
              title="Résolution 1er passage"
              value={`${tauxResolution}%`}
              color="success"
            />
            <KPICard
              title="Pièces en alerte stock"
              value={piecesEnAlerte.length}
              color="danger"
            />
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <AlertPanel alerts={alerts} />
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card padding="lg">
              <h3
                className="mb-4 text-lg font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Interventions par semaine
              </h3>
              {interventionsParSemaine.length > 0 ? (
                <ChartWrapper
                  type="bar"
                  data={interventionsParSemaine}
                  config={{
                    xAxisKey: 'semaine',
                    yAxisKey: 'total',
                    showGrid: true,
                  }}
                  height={300}
                />
              ) : (
                <p
                  className="py-8 text-center text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Aucune donnée disponible
                </p>
              )}
            </Card>

            <Card padding="lg">
              <h3
                className="mb-4 text-lg font-medium"
                style={{ color: 'var(--color-text)' }}
              >
                Répartition par type d&apos;intervention
              </h3>
              {repartitionParType.length > 0 ? (
                <ChartWrapper
                  type="pie"
                  data={repartitionParType}
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
                  Aucune donnée disponible
                </p>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
