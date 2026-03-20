'use client'

import { Component, useMemo, type ReactNode } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@unanima/core'

export interface ChartConfig {
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
}

export interface ChartWrapperProps {
  type: 'bar' | 'line' | 'pie'
  data: object[]
  config?: ChartConfig
  height?: number
  className?: string
}

const DEFAULT_CSS_COLORS = [
  '--color-primary',
  '--color-secondary',
  '--color-accent',
  '--color-info',
  '--color-success',
]

const FALLBACK_COLORS = [
  '#1E6FC0',
  '#28A745',
  '#FF6B35',
  '#17A2B8',
  '#28A745',
]

function resolveColor(cssVar: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim()
  return resolved || fallback
}

function useResolvedColors(cssVars: string[], fallbacks: string[]): string[] {
  return useMemo(
    () => cssVars.map((v, i) => resolveColor(v, fallbacks[i] ?? '#1E6FC0')),
    [cssVars, fallbacks],
  )
}

function EmptyState({ height }: { height: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      style={{ height }}
    >
      <svg
        className="h-12 w-12 text-[var(--color-text-muted,var(--color-text))]/40"
        fill="none"
        viewBox="0 0 48 48"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <rect x="6" y="20" width="8" height="20" rx="1" />
        <rect x="20" y="12" width="8" height="28" rx="1" />
        <rect x="34" y="24" width="8" height="16" rx="1" />
        <line x1="4" y1="44" x2="44" y2="44" strokeLinecap="round" />
        <line x1="2" y1="2" x2="46" y2="46" strokeWidth={2} strokeLinecap="round" />
      </svg>
      <p className="text-sm text-[var(--color-text-muted,var(--color-text))]/60">
        Aucune donnée à afficher
      </p>
    </div>
  )
}

interface ChartErrorBoundaryProps {
  children: ReactNode
  height: number
}

interface ChartErrorBoundaryState {
  hasError: boolean
}

class ChartErrorBoundary extends Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ChartErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ChartWrapper] Erreur de rendu du graphique :', error)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-3"
          style={{ height: this.props.height }}
        >
          <p className="text-sm text-[var(--color-danger)]">
            Erreur d'affichage du graphique
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function ChartWrapper({
  type,
  data,
  config = {},
  height = 300,
  className,
}: ChartWrapperProps) {
  const chartData = data as Record<string, unknown>[]
  const {
    xAxisKey = 'name',
    yAxisKey = 'value',
    colors: configColors,
    showLegend = true,
    showGrid = true,
  } = config

  const resolvedColors = useResolvedColors(
    configColors ?? DEFAULT_CSS_COLORS,
    configColors ?? FALLBACK_COLORS,
  )

  const isEmpty = !chartData || chartData.length === 0

  return (
    <div className={cn(
      'w-full rounded-[var(--radius-lg,0.75rem)]',
      'border border-[var(--color-border-light,var(--color-border))]',
      'bg-[var(--color-surface,#fff)] p-4',
      'shadow-sm',
      className,
    )}>
      {isEmpty ? (
        <EmptyState height={height} />
      ) : (
        <ChartErrorBoundary height={height}>
          <ResponsiveContainer width="100%" height={height}>
            {type === 'bar' ? (
              <BarChart data={chartData}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, var(--color-border))" />}
                <XAxis dataKey={xAxisKey} stroke="var(--color-text-muted, var(--color-text))" fontSize={12} />
                <YAxis stroke="var(--color-text-muted, var(--color-text))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border-light, var(--color-border))',
                    borderRadius: 'var(--radius-md, 0.5rem)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                />
                {showLegend && <Legend />}
                <Bar dataKey={yAxisKey} fill={resolvedColors[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : type === 'line' ? (
              <LineChart data={chartData}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light, var(--color-border))" />}
                <XAxis dataKey={xAxisKey} stroke="var(--color-text-muted, var(--color-text))" fontSize={12} />
                <YAxis stroke="var(--color-text-muted, var(--color-text))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border-light, var(--color-border))',
                    borderRadius: 'var(--radius-md, 0.5rem)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                />
                {showLegend && <Legend />}
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  stroke={resolvedColors[0]}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface, #fff)' }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={yAxisKey}
                  nameKey={xAxisKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {chartData.map((_, idx) => (
                    <Cell key={idx} fill={resolvedColors[idx % resolvedColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface, #fff)',
                    border: '1px solid var(--color-border-light, var(--color-border))',
                    borderRadius: 'var(--radius-md, 0.5rem)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                />
                {showLegend && <Legend />}
              </PieChart>
            )}
          </ResponsiveContainer>
        </ChartErrorBoundary>
      )}
    </div>
  )
}
