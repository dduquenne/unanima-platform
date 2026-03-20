'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@unanima/auth'
import { Card, Spinner } from '@unanima/core'
import { AlertPanel, DataTable, KPICard } from '@unanima/dashboard'
import type { ColumnDef } from '@unanima/dashboard'

import type { PieceDetachee } from '@/lib/types'

export default function AlertesPage() {
  const { isLoading: authLoading } = useAuth()

  const [pieces, setPieces] = useState<PieceDetachee[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    async function fetchPieces() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/pieces?limit=100')
        if (res.ok) {
          const json = await res.json()
          setPieces(json.data ?? [])
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }

    fetchPieces()
  }, [authLoading])

  const alertPieces = pieces.filter((p) => p.stock_actuel <= p.seuil_alerte)
  const criticalPieces = pieces.filter((p) => p.stock_actuel === 0)
  const lowPieces = alertPieces.filter((p) => p.stock_actuel > 0)

  const alerts = alertPieces.map((p) => ({
    id: p.id,
    title: p.stock_actuel === 0 ? 'Rupture de stock' : 'Stock faible',
    message: `${p.designation} (${p.reference}) : stock ${p.stock_actuel}/${p.seuil_alerte}`,
    severity: (p.stock_actuel === 0 ? 'error' : 'warning') as 'error' | 'warning',
  }))

  const columns: ColumnDef<PieceDetachee>[] = [
    { key: 'reference', header: 'Référence', sortable: true },
    { key: 'designation', header: 'Désignation', sortable: true },
    {
      key: 'stock_actuel',
      header: 'Stock',
      sortable: true,
      render: (row) => {
        const isAlert = row.stock_actuel <= row.seuil_alerte
        const isCritical = row.stock_actuel === 0
        const color = isCritical
          ? 'var(--color-danger)'
          : isAlert
            ? 'var(--color-warning)'
            : 'var(--color-success)'
        return (
          <span style={{ color, fontWeight: 600 }}>
            {row.stock_actuel}
          </span>
        )
      },
    },
    {
      key: 'seuil_alerte',
      header: 'Seuil',
      sortable: true,
    },
    {
      key: 'prix_unitaire',
      header: 'Prix unitaire',
      sortable: true,
      render: (row) => `${row.prix_unitaire.toFixed(2)} €`,
    },
  ]

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">Alertes stock</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Pièces totales" value={pieces.length} />
        <KPICard
          title="En alerte"
          value={alertPieces.length}
          color={alertPieces.length > 0 ? 'warning' : 'success'}
        />
        <KPICard
          title="Rupture de stock"
          value={criticalPieces.length}
          color={criticalPieces.length > 0 ? 'danger' : 'success'}
        />
        <KPICard title="Stock faible" value={lowPieces.length} />
      </div>

      {alerts.length > 0 && (
        <AlertPanel alerts={alerts} />
      )}

      {alertPieces.length === 0 ? (
        <Card padding="lg">
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-lg font-semibold text-[var(--color-success)]">
              Aucune alerte stock
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Toutes les pièces sont au-dessus de leur seuil d&apos;alerte.
            </p>
          </div>
        </Card>
      ) : (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-[var(--color-text)]">
            Pièces en alerte ({alertPieces.length})
          </h3>
          <DataTable columns={columns} data={alertPieces} pageSize={20} />
        </div>
      )}
    </div>
  )
}
