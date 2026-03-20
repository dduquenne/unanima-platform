'use client'

import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Button, Card, Spinner } from '@unanima/core'
import { ChartWrapper, DataTable, KPICard, StatusBadge } from '@unanima/dashboard'
import type { ColumnDef, StatusConfig } from '@unanima/dashboard'

import type { Etablissement, Indicateur } from '@/lib/types'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const CATEGORIE_CONFIG: Record<string, StatusConfig> = {
  qualite: { label: 'Qualité', color: 'primary' },
  rh: { label: 'RH', color: 'info' },
  financier: { label: 'Financier', color: 'warning' },
  activite: { label: 'Activité', color: 'success' },
  satisfaction: { label: 'Satisfaction', color: 'danger' },
}

const SEUILS = {
  vert: 75,
  orange: 50,
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function IndicateursPage() {
  const { isLoading: authLoading } = useAuth()

  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([])
  const [etablissements, setEtablissements] = useState<Etablissement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterCategorie, setFilterCategorie] = useState<string>('')
  const [filterEtablissement, setFilterEtablissement] = useState<string>('')
  const [filterPeriode, setFilterPeriode] = useState<string>('')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filterCategorie) params.set('categorie', filterCategorie)
      if (filterEtablissement) params.set('etablissement_id', filterEtablissement)
      if (filterPeriode) params.set('periode', filterPeriode)

      const [indRes, etabRes] = await Promise.all([
        fetch(`/api/indicateurs?${params}`),
        fetch('/api/etablissements?limit=100'),
      ])

      if (indRes.ok) {
        const json = await indRes.json()
        setIndicateurs(json.data ?? [])
      }
      if (etabRes.ok) {
        const json = await etabRes.json()
        setEtablissements(json.data ?? [])
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [filterCategorie, filterEtablissement, filterPeriode])

  useEffect(() => {
    if (!authLoading) fetchData()
  }, [authLoading, fetchData])

  // --- KPI computations ---

  const avgValue = indicateurs.length > 0
    ? indicateurs.reduce((sum, i) => sum + i.valeur, 0) / indicateurs.length
    : 0

  const byCategorie = indicateurs.reduce<Record<string, number>>((acc, i) => {
    acc[i.categorie] = (acc[i.categorie] ?? 0) + 1
    return acc
  }, {})

  const alertCount = indicateurs.filter((i) => i.valeur < SEUILS.orange).length

  // --- Chart data ---

  const barData = Object.entries(byCategorie).map(([cat, count]) => ({
    name: CATEGORIE_CONFIG[cat]?.label ?? cat,
    value: count,
  }))

  const lineData = [...indicateurs]
    .sort((a, b) => a.periode.localeCompare(b.periode))
    .reduce<{ name: string; value: number }[]>((acc, ind) => {
      const existing = acc.find((d) => d.name === ind.periode)
      if (existing) {
        existing.value = (existing.value + ind.valeur) / 2
      } else {
        acc.push({ name: ind.periode, value: ind.valeur })
      }
      return acc
    }, [])

  // --- Table columns ---

  const columns: ColumnDef<Indicateur>[] = [
    { key: 'nom', header: 'Indicateur', sortable: true },
    {
      key: 'categorie',
      header: 'Catégorie',
      sortable: true,
      render: (row) => <StatusBadge status={row.categorie} statusConfig={CATEGORIE_CONFIG} />,
    },
    {
      key: 'valeur',
      header: 'Valeur',
      sortable: true,
      render: (row) => {
        const color = row.valeur >= SEUILS.vert
          ? 'var(--color-success)'
          : row.valeur >= SEUILS.orange
            ? 'var(--color-warning)'
            : 'var(--color-danger)'
        return (
          <span style={{ color, fontWeight: 600 }}>
            {row.valeur}{row.unite ? ` ${row.unite}` : ''}
          </span>
        )
      },
    },
    {
      key: 'periode',
      header: 'Période',
      sortable: true,
      render: (row) => new Date(row.periode).toLocaleDateString('fr-FR'),
    },
  ]

  // --- Export CSV ---

  function exportCSV() {
    const header = ['Indicateur', 'Catégorie', 'Valeur', 'Unité', 'Période']
    const rows = indicateurs.map((i) => [i.nom, i.categorie, String(i.valeur), i.unite ?? '', i.periode])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indicateurs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-[var(--color-text)]">Indicateurs</h2>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          Exporter CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total indicateurs" value={indicateurs.length} />
        <KPICard title="Valeur moyenne" value={Math.round(avgValue * 10) / 10} />
        <KPICard title="Catégories" value={Object.keys(byCategorie).length} />
        <KPICard
          title="En alerte"
          value={alertCount}
          color={alertCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Filters */}
      <Card padding="md">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Catégorie</label>
            <select
              value={filterCategorie}
              onChange={(e) => setFilterCategorie(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {Object.entries(CATEGORIE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Établissement</label>
            <select
              value={filterEtablissement}
              onChange={(e) => setFilterEtablissement(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {etablissements.map((e) => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Période</label>
            <input
              type="date"
              value={filterPeriode}
              onChange={(e) => setFilterPeriode(e.target.value)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
            />
          </div>
          {(filterCategorie || filterEtablissement || filterPeriode) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterCategorie('')
                setFilterEtablissement('')
                setFilterPeriode('')
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Répartition par catégorie
          </h3>
          <ChartWrapper
            type="bar"
            data={barData}
            config={{ xAxisKey: 'name', yAxisKey: 'value' }}
            height={250}
          />
        </Card>
        <Card padding="md">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text)]">
            Évolution temporelle
          </h3>
          <ChartWrapper
            type="line"
            data={lineData}
            config={{ xAxisKey: 'name', yAxisKey: 'value' }}
            height={250}
          />
        </Card>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={indicateurs} pageSize={20} />
    </div>
  )
}
