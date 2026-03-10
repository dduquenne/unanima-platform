'use client'

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
import { cn } from './cn'

export interface ChartConfig {
  xAxisKey?: string
  yAxisKey?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
}

export interface ChartWrapperProps {
  type: 'bar' | 'line' | 'pie'
  data: Record<string, unknown>[]
  config?: ChartConfig
  height?: number
  className?: string
}

const DEFAULT_COLORS = [
  'var(--color-primary)',
  'var(--color-secondary, var(--color-success))',
  'var(--color-accent, var(--color-warning))',
  'var(--color-info)',
  'var(--color-success)',
]

export function ChartWrapper({
  type,
  data,
  config = {},
  height = 300,
  className,
}: ChartWrapperProps) {
  const {
    xAxisKey = 'name',
    yAxisKey = 'value',
    colors = DEFAULT_COLORS,
    showLegend = true,
    showGrid = true,
  } = config

  return (
    <div className={cn(
      'w-full rounded-[var(--radius-lg,0.75rem)]',
      'border border-[var(--color-border-light,var(--color-border))]',
      'bg-[var(--color-surface,#fff)] p-4',
      'shadow-sm',
      className,
    )}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data}>
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
            <Bar dataKey={yAxisKey} fill={colors[0]} radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
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
              stroke={colors[0]}
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-surface, #fff)' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
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
    </div>
  )
}
