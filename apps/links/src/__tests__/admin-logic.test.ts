// Tests — Admin logic (progression, inactivité, documents)
// Issue: #129 — Augmentation couverture tests

import { describe, it, expect } from 'vitest'

// ============================================================
// Progression calculation
// ============================================================

type PhaseStatus = 'libre' | 'en_cours' | 'validee'

const TOTAL_PHASES = 6

function computeProgression(validatedCount: number): number {
  return Math.round((validatedCount / TOTAL_PHASES) * 100)
}

describe('Progression calculation', () => {
  it('0/6 validated phases → 0%', () => {
    expect(computeProgression(0)).toBe(0)
  })

  it('1/6 validated phases → 17%', () => {
    expect(computeProgression(1)).toBe(17)
  })

  it('3/6 validated phases → 50%', () => {
    expect(computeProgression(3)).toBe(50)
  })

  it('6/6 validated phases → 100%', () => {
    expect(computeProgression(6)).toBe(100)
  })
})

// ============================================================
// Inactivity detection
// ============================================================

const INACTIVITY_THRESHOLD_DAYS = 14

function isInactive(lastActivityDate: Date, now: Date = new Date()): boolean {
  const diffMs = now.getTime() - lastActivityDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > INACTIVITY_THRESHOLD_DAYS
}

describe('Inactivity detection', () => {
  it('user with last activity > 14 days ago is inactive', () => {
    const now = new Date('2026-03-25T12:00:00Z')
    const lastActivity = new Date('2026-03-10T12:00:00Z') // 15 days ago
    expect(isInactive(lastActivity, now)).toBe(true)
  })

  it('user with last activity exactly 14 days ago is not inactive', () => {
    const now = new Date('2026-03-25T12:00:00Z')
    const lastActivity = new Date('2026-03-11T12:00:00Z') // exactly 14 days
    expect(isInactive(lastActivity, now)).toBe(false)
  })

  it('user with last activity 1 day ago is not inactive', () => {
    const now = new Date('2026-03-25T12:00:00Z')
    const lastActivity = new Date('2026-03-24T12:00:00Z')
    expect(isInactive(lastActivity, now)).toBe(false)
  })

  it('user with last activity 30 days ago is inactive', () => {
    const now = new Date('2026-03-25T12:00:00Z')
    const lastActivity = new Date('2026-02-23T12:00:00Z')
    expect(isInactive(lastActivity, now)).toBe(true)
  })
})

// ============================================================
// Document upload validation
// ============================================================

const ALLOWED_FILE_TYPES = ['pdf', 'docx'] as const
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo
const MAX_DOCS_PER_PHASE = 3

type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number]

function isFileTypeAllowed(fileType: string): fileType is AllowedFileType {
  return (ALLOWED_FILE_TYPES as readonly string[]).includes(fileType)
}

function isFileSizeValid(sizeInBytes: number): boolean {
  return sizeInBytes > 0 && sizeInBytes <= MAX_FILE_SIZE_BYTES
}

function canUploadToPhase(currentDocCount: number): boolean {
  return currentDocCount < MAX_DOCS_PER_PHASE
}

describe('Document upload — file type validation', () => {
  it('accepts .pdf', () => {
    expect(isFileTypeAllowed('pdf')).toBe(true)
  })

  it('accepts .docx', () => {
    expect(isFileTypeAllowed('docx')).toBe(true)
  })

  it('rejects .xlsx', () => {
    expect(isFileTypeAllowed('xlsx')).toBe(false)
  })

  it('rejects .exe', () => {
    expect(isFileTypeAllowed('exe')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isFileTypeAllowed('')).toBe(false)
  })
})

describe('Document upload — size limit (10 Mo)', () => {
  it('accepts a 1 Mo file', () => {
    expect(isFileSizeValid(1 * 1024 * 1024)).toBe(true)
  })

  it('accepts exactly 10 Mo', () => {
    expect(isFileSizeValid(10 * 1024 * 1024)).toBe(true)
  })

  it('rejects a file exceeding 10 Mo', () => {
    expect(isFileSizeValid(10 * 1024 * 1024 + 1)).toBe(false)
  })

  it('rejects a 0-byte file', () => {
    expect(isFileSizeValid(0)).toBe(false)
  })
})

describe('Document upload — max 3 docs per phase', () => {
  it('allows upload when phase has 0 docs', () => {
    expect(canUploadToPhase(0)).toBe(true)
  })

  it('allows upload when phase has 2 docs', () => {
    expect(canUploadToPhase(2)).toBe(true)
  })

  it('rejects upload when phase already has 3 docs', () => {
    expect(canUploadToPhase(3)).toBe(false)
  })

  it('rejects upload when phase has more than 3 docs', () => {
    expect(canUploadToPhase(5)).toBe(false)
  })
})
