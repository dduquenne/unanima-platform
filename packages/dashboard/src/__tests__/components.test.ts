import { describe, it, expect } from 'vitest'
import {
  KPICard, type KPICardProps,
  StatusBadge, type StatusBadgeProps, type StatusConfig,
  ProgressBar, type ProgressBarProps,
  DataTable,
  AlertPanel,
  SearchBar,
  Layout,
  ChartWrapper,
} from '../index'

describe('Dashboard component exports', () => {
  it('exports KPICard as a function', () => {
    expect(typeof KPICard).toBe('function')
  })

  it('exports StatusBadge as a function', () => {
    expect(typeof StatusBadge).toBe('function')
  })

  it('exports ProgressBar as a function', () => {
    expect(typeof ProgressBar).toBe('function')
  })

  it('exports DataTable as a function', () => {
    expect(typeof DataTable).toBe('function')
  })

  it('exports AlertPanel as a function', () => {
    expect(typeof AlertPanel).toBe('function')
  })

  it('exports SearchBar as a function', () => {
    expect(typeof SearchBar).toBe('function')
  })

  it('exports Layout as a function', () => {
    expect(typeof Layout).toBe('function')
  })

  it('exports ChartWrapper as a function', () => {
    expect(typeof ChartWrapper).toBe('function')
  })
})

describe('KPICardProps interface', () => {
  it('accepts valid props', () => {
    const props: KPICardProps = {
      title: 'Revenue',
      value: 42500,
      previousValue: 38000,
      color: 'success',
    }

    expect(props.title).toBe('Revenue')
    expect(props.value).toBe(42500)
    expect(props.previousValue).toBe(38000)
    expect(props.color).toBe('success')
  })

  it('accepts string value', () => {
    const props: KPICardProps = {
      title: 'Status',
      value: 'Active',
    }

    expect(props.value).toBe('Active')
  })
})

describe('StatusBadgeProps interface', () => {
  it('accepts valid config', () => {
    const config: Record<string, StatusConfig> = {
      active: { label: 'Actif', color: 'success' },
      pending: { label: 'En attente', color: 'warning' },
      inactive: { label: 'Inactif', color: 'danger' },
    }

    const props: StatusBadgeProps = {
      status: 'active',
      statusConfig: config,
    }

    expect(props.status).toBe('active')
    expect(props.statusConfig['active']?.label).toBe('Actif')
    expect(props.statusConfig['active']?.color).toBe('success')
  })
})

describe('ProgressBarProps interface', () => {
  it('accepts valid props with defaults', () => {
    const props: ProgressBarProps = {
      value: 75,
    }
    expect(props.value).toBe(75)
  })

  it('accepts all optional props', () => {
    const props: ProgressBarProps = {
      value: 50,
      label: 'Upload',
      showPercentage: true,
      color: 'warning',
      animated: true,
      className: 'custom',
    }
    expect(props.label).toBe('Upload')
    expect(props.showPercentage).toBe(true)
    expect(props.animated).toBe(true)
  })
})
