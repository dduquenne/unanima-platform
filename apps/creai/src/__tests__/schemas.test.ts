import { describe, it, expect } from 'vitest'
import {
  createEtablissementSchema,
  updateEtablissementSchema,
  createDiagnosticSchema,
  createIndicateurSchema,
  createRapportSchema,
  createRecommandationSchema,
  updateRecommandationSchema,
} from '../lib/types'

describe('CREAI Zod schemas', () => {
  describe('createEtablissementSchema', () => {
    it('accepts valid data', () => {
      const data = { nom: 'EHPAD Les Lilas', type: 'ehpad' }
      const result = createEtablissementSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('actif')
      }
    })

    it('validates SIRET format (14 digits)', () => {
      const valid = createEtablissementSchema.safeParse({
        nom: 'Test', type: 'ime', siret: '12345678901234',
      })
      expect(valid.success).toBe(true)

      const invalid = createEtablissementSchema.safeParse({
        nom: 'Test', type: 'ime', siret: '123',
      })
      expect(invalid.success).toBe(false)
    })

    it('rejects invalid type', () => {
      const result = createEtablissementSchema.safeParse({ nom: 'Test', type: 'invalid' })
      expect(result.success).toBe(false)
    })
  })

  describe('updateEtablissementSchema', () => {
    it('accepts partial updates', () => {
      const result = updateEtablissementSchema.safeParse({ statut: 'en_transformation' })
      expect(result.success).toBe(true)
    })

    it('accepts empty object', () => {
      const result = updateEtablissementSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('createDiagnosticSchema', () => {
    it('accepts valid data', () => {
      const data = {
        etablissement_id: '550e8400-e29b-41d4-a716-446655440000',
        auteur_id: '550e8400-e29b-41d4-a716-446655440001',
      }
      const result = createDiagnosticSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('brouillon')
      }
    })

    it('rejects missing required fields', () => {
      const result = createDiagnosticSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('createIndicateurSchema', () => {
    it('accepts valid data', () => {
      const data = {
        etablissement_id: '550e8400-e29b-41d4-a716-446655440000',
        categorie: 'qualite',
        nom: 'Taux de satisfaction',
        valeur: 87.5,
        periode: '2026-03-01',
      }
      const result = createIndicateurSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects invalid categorie', () => {
      const data = {
        etablissement_id: '550e8400-e29b-41d4-a716-446655440000',
        categorie: 'invalid',
        nom: 'Test',
        valeur: 1,
        periode: '2026-03-01',
      }
      const result = createIndicateurSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('createRapportSchema', () => {
    it('accepts valid data with defaults', () => {
      const data = {
        diagnostic_id: '550e8400-e29b-41d4-a716-446655440000',
        titre: 'Rapport diagnostic 2026',
      }
      const result = createRapportSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('brouillon')
      }
    })
  })

  describe('createRecommandationSchema', () => {
    it('accepts valid data', () => {
      const data = {
        diagnostic_id: '550e8400-e29b-41d4-a716-446655440000',
        priorite: 'haute',
        description: 'Améliorer le processus de recrutement',
      }
      const result = createRecommandationSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('proposee')
      }
    })

    it('rejects invalid priorite', () => {
      const data = {
        diagnostic_id: '550e8400-e29b-41d4-a716-446655440000',
        priorite: 'invalid',
        description: 'Test',
      }
      const result = createRecommandationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('updateRecommandationSchema', () => {
    it('accepts statut transition', () => {
      const result = updateRecommandationSchema.safeParse({ statut: 'realisee' })
      expect(result.success).toBe(true)
    })

    it('accepts echeance update', () => {
      const result = updateRecommandationSchema.safeParse({ echeance: '2026-06-30' })
      expect(result.success).toBe(true)
    })
  })
})
