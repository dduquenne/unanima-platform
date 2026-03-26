import { describe, it, expect } from 'vitest'
import { TOTAL_PHASES, PHASE_LABELS, PHASE_DESCRIPTIONS } from '../config/phases.config'

describe('phases.config', () => {
  it('TOTAL_PHASES equals 6', () => {
    expect(TOTAL_PHASES).toBe(6)
  })

  it('PHASE_LABELS has entries for all 6 phases', () => {
    for (let i = 1; i <= TOTAL_PHASES; i++) {
      const label = PHASE_LABELS[i]
      expect(label).toBeDefined()
      expect(label!.length).toBeGreaterThan(0)
    }
  })

  it('PHASE_DESCRIPTIONS has entries for all 6 phases', () => {
    for (let i = 1; i <= TOTAL_PHASES; i++) {
      const desc = PHASE_DESCRIPTIONS[i]
      expect(desc).toBeDefined()
      expect(desc!.length).toBeGreaterThan(0)
    }
  })

  it('all labels contain proper accents', () => {
    expect(PHASE_LABELS[1]).toContain('Définir')
    expect(PHASE_LABELS[2]).toContain('compétences')
    expect(PHASE_LABELS[3]).toContain('marché')
    expect(PHASE_LABELS[5]).toContain('Préparer')
  })
})
