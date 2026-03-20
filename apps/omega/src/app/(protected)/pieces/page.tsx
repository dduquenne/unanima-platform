'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@unanima/auth'
import { Card, Spinner, Button } from '@unanima/core'
import { DataTable } from '@unanima/dashboard'
import type { ColumnDef } from '@unanima/dashboard'

import type { PieceDetachee } from '@/lib/types'

interface ApiResponse<T> {
  data: T[]
  meta: { total: number; page: number; limit: number }
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function PiecesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [pieces, setPieces] = useState<PieceDetachee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canCreate =
    user?.role === 'admin' || user?.role === 'responsable_sav'

  const fetchPieces = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/pieces?limit=100')
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des pièces détachées')
      }
      const json: ApiResponse<PieceDetachee> = await res.json()
      setPieces(json.data ?? [])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPieces()
  }, [fetchPieces])

  const columns: ColumnDef<PieceDetachee>[] = [
    {
      key: 'reference',
      header: 'Référence',
      sortable: true,
      render: (row) => (
        <span
          className="font-medium"
          style={{ color: 'var(--color-text)' }}
        >
          {row.reference}
        </span>
      ),
    },
    {
      key: 'designation',
      header: 'Désignation',
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text)' }}>
          {row.designation}
        </span>
      ),
    },
    {
      key: 'stock_actuel',
      header: 'Stock actuel',
      sortable: true,
      render: (row) => (
        <span
          className="font-medium"
          style={{
            color:
              row.stock_actuel < row.seuil_alerte
                ? 'var(--color-danger, #dc2626)'
                : 'var(--color-text)',
          }}
        >
          {row.stock_actuel}
        </span>
      ),
    },
    {
      key: 'seuil_alerte',
      header: "Seuil d'alerte",
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text-secondary, var(--color-text))' }}>
          {row.seuil_alerte}
        </span>
      ),
    },
    {
      key: 'prix_unitaire',
      header: 'Prix unitaire',
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text)' }}>
          {formatPrice(row.prix_unitaire)}
        </span>
      ),
    },
    {
      key: 'updated_at',
      header: 'Date MAJ',
      sortable: true,
      render: (row) => (
        <span style={{ color: 'var(--color-text-secondary, var(--color-text))' }}>
          {formatDate(row.updated_at)}
        </span>
      ),
    },
  ]

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
          Pièces détachées
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
              onClick={fetchPieces}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Pièces détachées
        </h2>
        {canCreate && (
          <Button onClick={() => router.push('/pieces/new')}>
            Nouvelle pièce
          </Button>
        )}
      </div>

      <DataTable<PieceDetachee>
        columns={columns}
        data={pieces}
        searchable
        paginated
        pageSize={10}
        onRowClick={(row) => router.push(`/pieces/${row.id}`)}
        emptyMessage="Aucune pièce détachée trouvée"
      />
    </div>
  )
}
