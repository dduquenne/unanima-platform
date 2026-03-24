// Tests — Dashboard progression logic
// Issue: #112 — Sprint 9 : Dashboard bénéficiaire

import { describe, it, expect } from 'vitest'

type PhaseStatus = 'libre' | 'en_cours' | 'validee'

interface PhaseData {
  phase_number: number
  status: PhaseStatus
}

const TOTAL_PHASES = 6

function computeProgression(phases: PhaseData[]): { validated: number; percentage: number } {
  const validated = phases.filter((p) => p.status === 'validee').length
  const percentage = Math.round((validated / TOTAL_PHASES) * 100)
  return { validated, percentage }
}

function getCurrentPhase(phases: PhaseData[]): number {
  const inProgress = phases.find((p) => p.status === 'en_cours')
  if (inProgress) return inProgress.phase_number

  const sorted = [...phases].sort((a, b) => a.phase_number - b.phase_number)
  const firstLibre = sorted.find((p) => p.status === 'libre')
  if (firstLibre) return firstLibre.phase_number

  return 1
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] ?? fullName
}

describe('computeProgression', () => {
  it('0/6 phases → 0%', () => {
    const phases: PhaseData[] = Array.from({ length: 6 }, (_, i) => ({
      phase_number: i + 1,
      status: 'libre',
    }))
    const result = computeProgression(phases)
    expect(result.validated).toBe(0)
    expect(result.percentage).toBe(0)
  })

  it('1/6 phases → 17%', () => {
    const phases: PhaseData[] = [
      { phase_number: 1, status: 'validee' },
      { phase_number: 2, status: 'en_cours' },
      { phase_number: 3, status: 'libre' },
      { phase_number: 4, status: 'libre' },
      { phase_number: 5, status: 'libre' },
      { phase_number: 6, status: 'libre' },
    ]
    const result = computeProgression(phases)
    expect(result.validated).toBe(1)
    expect(result.percentage).toBe(17)
  })

  it('3/6 phases → 50%', () => {
    const phases: PhaseData[] = [
      { phase_number: 1, status: 'validee' },
      { phase_number: 2, status: 'validee' },
      { phase_number: 3, status: 'validee' },
      { phase_number: 4, status: 'en_cours' },
      { phase_number: 5, status: 'libre' },
      { phase_number: 6, status: 'libre' },
    ]
    const result = computeProgression(phases)
    expect(result.validated).toBe(3)
    expect(result.percentage).toBe(50)
  })

  it('6/6 phases → 100%', () => {
    const phases: PhaseData[] = Array.from({ length: 6 }, (_, i) => ({
      phase_number: i + 1,
      status: 'validee' as PhaseStatus,
    }))
    const result = computeProgression(phases)
    expect(result.validated).toBe(6)
    expect(result.percentage).toBe(100)
  })
})

describe('getCurrentPhase', () => {
  it('returns in_progress phase if exists', () => {
    const phases: PhaseData[] = [
      { phase_number: 1, status: 'validee' },
      { phase_number: 2, status: 'en_cours' },
      { phase_number: 3, status: 'libre' },
      { phase_number: 4, status: 'libre' },
      { phase_number: 5, status: 'libre' },
      { phase_number: 6, status: 'libre' },
    ]
    expect(getCurrentPhase(phases)).toBe(2)
  })

  it('returns first libre if no in_progress', () => {
    const phases: PhaseData[] = [
      { phase_number: 1, status: 'validee' },
      { phase_number: 2, status: 'validee' },
      { phase_number: 3, status: 'libre' },
      { phase_number: 4, status: 'libre' },
      { phase_number: 5, status: 'libre' },
      { phase_number: 6, status: 'libre' },
    ]
    expect(getCurrentPhase(phases)).toBe(3)
  })

  it('returns 1 if all validated', () => {
    const phases: PhaseData[] = Array.from({ length: 6 }, (_, i) => ({
      phase_number: i + 1,
      status: 'validee' as PhaseStatus,
    }))
    expect(getCurrentPhase(phases)).toBe(1)
  })

  it('returns 1 if all libre', () => {
    const phases: PhaseData[] = Array.from({ length: 6 }, (_, i) => ({
      phase_number: i + 1,
      status: 'libre' as PhaseStatus,
    }))
    expect(getCurrentPhase(phases)).toBe(1)
  })
})

describe('getFirstName (RG-BEN-09)', () => {
  it('extracts first name from full name', () => {
    expect(getFirstName('Jean Dupont')).toBe('Jean')
  })

  it('handles single name', () => {
    expect(getFirstName('Jean')).toBe('Jean')
  })

  it('handles hyphenated names', () => {
    expect(getFirstName('Jean-Pierre Martin')).toBe('Jean-Pierre')
  })
})
