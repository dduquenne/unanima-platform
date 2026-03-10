import { describe, it, expect } from 'vitest'
import {
  KPICard,
  DataTable,
  StatusBadge,
  ProgressBar,
  AlertPanel,
  ChartWrapper,
  SearchBar,
  Layout,
} from '../index'

describe('dashboard exports', () => {
  it('exports KPICard', () => {
    expect(KPICard).toBeDefined()
  })

  it('exports DataTable', () => {
    expect(DataTable).toBeDefined()
  })

  it('exports StatusBadge', () => {
    expect(StatusBadge).toBeDefined()
  })

  it('exports ProgressBar', () => {
    expect(ProgressBar).toBeDefined()
  })

  it('exports AlertPanel', () => {
    expect(AlertPanel).toBeDefined()
  })

  it('exports ChartWrapper', () => {
    expect(ChartWrapper).toBeDefined()
  })

  it('exports SearchBar', () => {
    expect(SearchBar).toBeDefined()
  })

  it('exports Layout', () => {
    expect(Layout).toBeDefined()
  })
})
