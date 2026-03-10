'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { cn } from './cn'

export interface ColumnDef<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  searchable?: boolean
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  actions?: (row: T) => ReactNode
  className?: string
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = false,
  sortable = true,
  paginated = false,
  pageSize = 10,
  onRowClick,
  actions,
  className,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!search) return data
    const lower = search.toLowerCase()
    return data.filter((row) =>
      Object.values(row).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(lower),
      ),
    )
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal === bVal) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortAsc ? cmp : -cmp
    })
  }, [filtered, sortKey, sortAsc])

  const totalPages = paginated ? Math.ceil(sorted.length / pageSize) : 1
  const displayed = paginated ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted

  const handleSort = (key: string) => {
    if (!sortable) return
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-[var(--color-border)]', className)}>
      {searchable && (
        <div className="border-b border-[var(--color-border)] p-3">
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => (col.sortable !== false ? handleSort(col.key) : undefined)}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-[var(--color-text)]/70',
                    sortable && col.sortable !== false && 'cursor-pointer select-none hover:text-[var(--color-text)]',
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {sortKey === col.key && (
                      <svg className={cn('h-3 w-3', !sortAsc && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text)]/70">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-[var(--color-border)] last:border-0',
                  onRowClick && 'cursor-pointer hover:bg-[var(--color-background)]',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[var(--color-text)]">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">{actions(row)}</td>
                )}
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-8 text-center text-[var(--color-text)]/50"
                >
                  Aucun résultat
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
          <span className="text-sm text-[var(--color-text)]/60">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-[var(--color-border)] px-3 py-1 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
