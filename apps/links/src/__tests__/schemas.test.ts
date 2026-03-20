import { describe, it, expect } from 'vitest'
import {
  createBeneficiaireSchema,
  updateBeneficiaireSchema,
  createBilanSchema,
  updateBilanSchema,
  createQuestionnaireSchema,
  createQuestionSchema,
  createResponseSchema,
  createDocumentSchema,
} from '../lib/types'

describe('Links Zod schemas', () => {
  describe('createBeneficiaireSchema', () => {
    it('accepts valid data', () => {
      const data = {
        profile_id: '550e8400-e29b-41d4-a716-446655440000',
        consultant_id: '550e8400-e29b-41d4-a716-446655440001',
      }
      const result = createBeneficiaireSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('actif')
      }
    })

    it('rejects invalid UUID', () => {
      const data = { profile_id: 'not-a-uuid', consultant_id: '550e8400-e29b-41d4-a716-446655440001' }
      const result = createBeneficiaireSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects missing required fields', () => {
      const result = createBeneficiaireSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('updateBeneficiaireSchema', () => {
    it('accepts partial updates', () => {
      const result = updateBeneficiaireSchema.safeParse({ statut: 'termine' })
      expect(result.success).toBe(true)
    })

    it('rejects invalid statut', () => {
      const result = updateBeneficiaireSchema.safeParse({ statut: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('accepts empty object', () => {
      const result = updateBeneficiaireSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })

  describe('createBilanSchema', () => {
    it('accepts valid data', () => {
      const data = {
        beneficiaire_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'initial',
      }
      const result = createBilanSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('brouillon')
      }
    })

    it('rejects invalid type', () => {
      const data = {
        beneficiaire_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'invalid_type',
      }
      const result = createBilanSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('updateBilanSchema', () => {
    it('accepts valid statut update', () => {
      const result = updateBilanSchema.safeParse({ statut: 'en_cours' })
      expect(result.success).toBe(true)
    })

    it('accepts date updates', () => {
      const result = updateBilanSchema.safeParse({
        date_debut: '2026-04-01',
        date_fin: '2026-06-30',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createQuestionnaireSchema', () => {
    it('accepts valid data', () => {
      const data = { titre: 'Mon questionnaire' }
      const result = createQuestionnaireSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.version).toBe(1)
        expect(result.data.is_active).toBe(true)
      }
    })

    it('rejects empty titre', () => {
      const result = createQuestionnaireSchema.safeParse({ titre: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('createQuestionSchema', () => {
    it('accepts valid data', () => {
      const data = {
        questionnaire_id: '550e8400-e29b-41d4-a716-446655440000',
        ordre: 1,
        texte: 'Quelle est votre motivation ?',
        type: 'textarea',
      }
      const result = createQuestionSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects invalid type', () => {
      const data = {
        questionnaire_id: '550e8400-e29b-41d4-a716-446655440000',
        ordre: 1,
        texte: 'Test',
        type: 'invalid',
      }
      const result = createQuestionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('createResponseSchema', () => {
    it('accepts valid data', () => {
      const data = {
        bilan_id: '550e8400-e29b-41d4-a716-446655440000',
        question_id: '550e8400-e29b-41d4-a716-446655440001',
        valeur: { text: 'Ma réponse' },
      }
      const result = createResponseSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('createDocumentSchema', () => {
    it('accepts valid data', () => {
      const data = {
        beneficiaire_id: '550e8400-e29b-41d4-a716-446655440000',
        nom: 'mon-cv.pdf',
        type: 'cv',
        storage_path: '/documents/mon-cv.pdf',
        uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      }
      const result = createDocumentSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects invalid document type', () => {
      const data = {
        beneficiaire_id: '550e8400-e29b-41d4-a716-446655440000',
        nom: 'test.pdf',
        type: 'invalid',
        storage_path: '/test.pdf',
        uploaded_by: '550e8400-e29b-41d4-a716-446655440001',
      }
      const result = createDocumentSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
