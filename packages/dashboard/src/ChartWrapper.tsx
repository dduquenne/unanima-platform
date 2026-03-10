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
  'var(--color-success)',
  'var(--color-warning)',
  'var(--color-danger)',
  'var(--color-info)',
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
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey={yAxisKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === 'line' ? (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            {showLegend && <Legend />}
            <Line type="monotone" dataKey={yAxisKey} stroke={colors[0]} strokeWidth={2} />
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
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={colors[idx % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
