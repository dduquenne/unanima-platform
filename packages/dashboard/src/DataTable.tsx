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
  emptyMessage?: string
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
  emptyMessage = 'Aucun resultat',
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
    <div className={cn(
      'overflow-hidden',
      'rounded-[var(--radius-lg,0.75rem)]',
      'border border-[var(--color-border-light,var(--color-border))]',
      'bg-[var(--color-surface,#fff)]',
      'shadow-sm',
      className,
    )}>
      {searchable && (
        <div className="border-b border-[var(--color-border-light,var(--color-border))] p-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted,var(--color-text))]/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className={cn(
                'w-full rounded-[var(--radius-md,0.5rem)]',
                'border border-[var(--color-border)] bg-[var(--color-background,#f8fafc)]',
                'py-2 pl-10 pr-3 text-sm text-[var(--color-text)]',
                'placeholder:text-[var(--color-text-muted,var(--color-text))]/50',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus,var(--color-primary))]/30',
                'focus:border-[var(--color-border-focus,var(--color-primary))]',
              )}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border-light,var(--color-border))] bg-[var(--color-muted,var(--color-background))]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => (col.sortable !== false ? handleSort(col.key) : undefined)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
                    'text-[var(--color-text-secondary,var(--color-text))]/70',
                    sortable && col.sortable !== false && 'cursor-pointer select-none hover:text-[var(--color-text)]',
                    'transition-colors duration-150',
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {sortKey === col.key && (
                      <svg
                        className={cn('h-3.5 w-3.5 transition-transform duration-150', !sortAsc && 'rotate-180')}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary,var(--color-text))]/70">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border-light,var(--color-border))]">
            {displayed.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors duration-100',
                  onRowClick && 'cursor-pointer hover:bg-[var(--color-surface-hover,var(--color-background))]',
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-[var(--color-text)]">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3.5 text-right">{actions(row)}</td>
                )}
              </tr>
            ))}
            {displayed.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="h-8 w-8 text-[var(--color-text-muted,var(--color-text))]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <p className="text-sm text-[var(--color-text-muted,var(--color-text))]/50">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--color-border-light,var(--color-border))] px-4 py-3">
          <span className="text-sm text-[var(--color-text-secondary,var(--color-text))]/60">
            Page {page} sur {totalPages} ({sorted.length} resultats)
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                'rounded-[var(--radius-md,0.5rem)]',
                'border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium',
                'text-[var(--color-text)] bg-[var(--color-surface,#fff)]',
                'hover:bg-[var(--color-surface-hover,var(--color-background))]',
                'disabled:opacity-50 disabled:pointer-events-none',
                'transition-colors duration-150',
              )}
            >
              Precedent
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-[var(--radius-md,0.5rem)]',
                'border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium',
                'text-[var(--color-text)] bg-[var(--color-surface,#fff)]',
                'hover:bg-[var(--color-surface-hover,var(--color-background))]',
                'disabled:opacity-50 disabled:pointer-events-none',
                'transition-colors duration-150',
              )}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
