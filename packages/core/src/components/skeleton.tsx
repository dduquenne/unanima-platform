import { type HTMLAttributes } from 'react'
import { cn } from '../utils/cn'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  lines?: number
  animate?: boolean
}

function formatDimension(value: string | number | undefined): string | undefined {
  if (value === undefined) return undefined
  return typeof value === 'number' ? `${value}px` : value
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
  className,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-[var(--color-border-light,var(--color-border))]/40',
    animate && 'animate-pulse',
  )

  if (variant === 'circular') {
    return (
      <div
        aria-hidden="true"
        className={cn(baseClasses, 'rounded-full', className)}
        style={{
          width: formatDimension(width) ?? '40px',
          height: formatDimension(height) ?? formatDimension(width) ?? '40px',
          ...style,
        }}
        {...props}
      />
    )
  }

  if (variant === 'rectangular') {
    return (
      <div
        aria-hidden="true"
        className={cn(baseClasses, 'rounded-[var(--radius-md,0.5rem)]', className)}
        style={{
          width: formatDimension(width) ?? '100%',
          height: formatDimension(height) ?? '100px',
          ...style,
        }}
        {...props}
      />
    )
  }

  // variant === 'text'
  if (lines > 1) {
    return (
      <div aria-hidden="true" className={cn('flex flex-col gap-2', className)} {...props}>
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4 rounded')}
            style={{
              width: i === lines - 1 ? '75%' : formatDimension(width) ?? '100%',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn(baseClasses, 'h-4 rounded', className)}
      style={{
        width: formatDimension(width) ?? '100%',
        height: formatDimension(height),
        ...style,
      }}
      {...props}
    />
  )
}

export function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)] border border-[var(--color-border-light,var(--color-border))] bg-[var(--color-surface,#fff)] p-5',
        className,
      )}
      {...props}
    >
      <Skeleton variant="rectangular" height={120} className="mb-4" />
      <Skeleton lines={3} />
    </div>
  )
}

export interface SkeletonTableProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number
}

export function SkeletonTable({ rows = 5, className, ...props }: SkeletonTableProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)] border border-[var(--color-border-light,var(--color-border))] bg-[var(--color-surface,#fff)] overflow-hidden',
        className,
      )}
      {...props}
    >
      <div className="flex gap-4 border-b border-[var(--color-border)] bg-[var(--color-background,#f5f7fa)] px-4 py-3">
        <Skeleton width="20%" height={14} />
        <Skeleton width="30%" height={14} />
        <Skeleton width="25%" height={14} />
        <Skeleton width="15%" height={14} />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-[var(--color-border)]/30 px-4 py-3 last:border-b-0"
        >
          <Skeleton width="20%" />
          <Skeleton width="30%" />
          <Skeleton width="25%" />
          <Skeleton width="15%" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonKPI({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-lg,0.75rem)] border border-[var(--color-border-light,var(--color-border))] bg-[var(--color-surface,#fff)] p-5',
        className,
      )}
      {...props}
    >
      <Skeleton width="60%" height={12} className="mb-3" />
      <Skeleton width="40%" height={32} className="mb-2" />
      <Skeleton width="30%" height={12} />
    </div>
  )
}
