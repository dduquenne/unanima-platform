// Tests — Schémas questionnaires et questions (nouveau schéma Sprint 8)
// Issue: #106 — Sprint 8 Fondations

import { describe, it, expect } from 'vitest'
import {
  phaseResponseSchema,
  updatePhaseResponseSchema,
  autosaveSchema,
  phaseValidationSchema,
  phaseStatusEnum,
} from '@/lib/types/schemas'

// ============================================================
// phaseResponseSchema — tests avancés
// ============================================================

describe('phaseResponseSchema — saisie de réponses', () => {
  const baseValid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    question_id: '550e8400-e29b-41d4-a716-446655440001',
    phase_number: 1,
  }

  it('accepte toutes les phases de 1 à 6', () => {
    for (let i = 1; i <= 6; i++) {
      expect(phaseResponseSchema.safeParse({ ...baseValid, phase_number: i }).success).toBe(true)
    }
  })

  it('rejette la phase 0 et la phase 7', () => {
    expect(phaseResponseSchema.safeParse({ ...baseValid, phase_number: 0 }).success).toBe(false)
    expect(phaseResponseSchema.safeParse({ ...baseValid, phase_number: 7 }).success).toBe(false)
  })

  it('accepte tous les statuts valides', () => {
    for (const status of ['libre', 'en_cours', 'validee'] as const) {
      expect(phaseResponseSchema.safeParse({ ...baseValid, phase_status: status }).success).toBe(true)
    }
  })

  it('applique le statut par défaut "en_cours" si absent', () => {
    const result = phaseResponseSchema.safeParse(baseValid)
    expect(result.success && result.data.phase_status).toBe('en_cours')
  })

  it('accepte response_text vide (brouillon)', () => {
    expect(phaseResponseSchema.safeParse({ ...baseValid, response_text: '' }).success).toBe(true)
  })

  it('accepte response_text avec contenu long', () => {
    expect(phaseResponseSchema.safeParse({
      ...baseValid,
      response_text: 'a'.repeat(5000),
    }).success).toBe(true)
  })
})

describe('updatePhaseResponseSchema — mise à jour partielle', () => {
  it('valide une mise à jour du texte uniquement', () => {
    expect(updatePhaseResponseSchema.safeParse({ response_text: 'Nouveau texte' }).success).toBe(true)
  })

  it('valide une mise à jour du statut uniquement', () => {
    expect(updatePhaseResponseSchema.safeParse({ phase_status: 'validee' }).success).toBe(true)
  })

  it('valide une mise à jour vide (aucun champ requis)', () => {
    expect(updatePhaseResponseSchema.safeParse({}).success).toBe(true)
  })
})

// ============================================================
// autosaveSchema — payload minimal pour l'autosave
// ============================================================

describe('autosaveSchema — autosave (blur + 30s)', () => {
  it('valide le payload minimal attendu', () => {
    const result = autosaveSchema.safeParse({
      question_id: '550e8400-e29b-41d4-a716-446655440001',
      response_text: 'Réponse en cours de saisie...',
      phase_number: 2,
    })
    expect(result.success).toBe(true)
  })

  it('accepte response_text null (champ vidé)', () => {
    expect(autosaveSchema.safeParse({
      question_id: '550e8400-e29b-41d4-a716-446655440001',
      response_text: null,
      phase_number: 1,
    }).success).toBe(true)
  })

  it('rejette sans question_id', () => {
    expect(autosaveSchema.safeParse({
      response_text: 'test',
      phase_number: 1,
    }).success).toBe(false)
  })

  it('rejette un question_id non-UUID', () => {
    expect(autosaveSchema.safeParse({
      question_id: 'not-a-uuid',
      response_text: 'test',
      phase_number: 1,
    }).success).toBe(false)
  })
})

// ============================================================
// phaseValidationSchema — validation / dé-validation de phase
// ============================================================

describe('phaseValidationSchema — validation de phase', () => {
  const baseValid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    phase_number: 1,
  }

  it('valide la validation d\'une phase (statut par défaut : validee)', () => {
    const result = phaseValidationSchema.safeParse(baseValid)
    expect(result.success).toBe(true)
    expect(result.success && result.data.status).toBe('validee')
  })

  it('valide la dé-validation d\'une phase (statut libre)', () => {
    const result = phaseValidationSchema.safeParse({ ...baseValid, status: 'libre' })
    expect(result.success).toBe(true)
  })

  it('valide le statut "en_cours"', () => {
    expect(phaseValidationSchema.safeParse({ ...baseValid, status: 'en_cours' }).success).toBe(true)
  })

  it('accepte toutes les phases de 1 à 6', () => {
    for (let i = 1; i <= 6; i++) {
      expect(phaseValidationSchema.safeParse({ ...baseValid, phase_number: i }).success).toBe(true)
    }
  })

  it('rejette phase_number invalide', () => {
    expect(phaseValidationSchema.safeParse({ ...baseValid, phase_number: 0 }).success).toBe(false)
    expect(phaseValidationSchema.safeParse({ ...baseValid, phase_number: 7 }).success).toBe(false)
  })
})

// ============================================================
// phaseStatusEnum
// ============================================================

describe('phaseStatusEnum — enum partagé', () => {
  it('contient exactement 3 valeurs', () => {
    const values = phaseStatusEnum.options
    expect(values).toHaveLength(3)
    expect(values).toContain('libre')
    expect(values).toContain('en_cours')
    expect(values).toContain('validee')
  })
})
