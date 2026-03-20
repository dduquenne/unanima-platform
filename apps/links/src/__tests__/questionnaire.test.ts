import { describe, it, expect } from 'vitest'
import {
  createQuestionnaireSchema,
  updateQuestionnaireSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createResponseSchema,
  updateResponseSchema,
  createDocumentSchema,
} from '../lib/types'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('Questionnaire schemas', () => {
  describe('createQuestionnaireSchema', () => {
    it('accepts valid questionnaire', () => {
      const result = createQuestionnaireSchema.safeParse({
        titre: 'Questionnaire initial',
        description: 'Description du questionnaire',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.version).toBe(1)
        expect(result.data.is_active).toBe(true)
      }
    })

    it('rejects empty title', () => {
      const result = createQuestionnaireSchema.safeParse({ titre: '' })
      expect(result.success).toBe(false)
    })

    it('rejects title exceeding max length', () => {
      const result = createQuestionnaireSchema.safeParse({ titre: 'a'.repeat(256) })
      expect(result.success).toBe(false)
    })
  })

  describe('updateQuestionnaireSchema', () => {
    it('accepts partial update', () => {
      const result = updateQuestionnaireSchema.safeParse({ is_active: false })
      expect(result.success).toBe(true)
    })

    it('accepts empty object', () => {
      const result = updateQuestionnaireSchema.safeParse({})
      expect(result.success).toBe(true)
    })
  })
})

describe('Question schemas', () => {
  describe('createQuestionSchema', () => {
    it('accepts valid text question', () => {
      const result = createQuestionSchema.safeParse({
        questionnaire_id: UUID,
        ordre: 0,
        texte: 'Quel est votre parcours ?',
        type: 'text',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.required).toBe(false)
        expect(result.data.options).toEqual([])
      }
    })

    it('accepts valid scale question', () => {
      const result = createQuestionSchema.safeParse({
        questionnaire_id: UUID,
        ordre: 1,
        texte: 'Sur une échelle de 1 à 10',
        type: 'scale',
        options: [1, 10],
        required: true,
      })
      expect(result.success).toBe(true)
    })

    it('accepts all question types', () => {
      const types = ['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'scale']
      for (const type of types) {
        const result = createQuestionSchema.safeParse({
          questionnaire_id: UUID,
          ordre: 0,
          texte: 'Test',
          type,
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid question type', () => {
      const result = createQuestionSchema.safeParse({
        questionnaire_id: UUID,
        ordre: 0,
        texte: 'Test',
        type: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing texte', () => {
      const result = createQuestionSchema.safeParse({
        questionnaire_id: UUID,
        ordre: 0,
        type: 'text',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateQuestionSchema', () => {
    it('accepts partial update', () => {
      const result = updateQuestionSchema.safeParse({ required: true })
      expect(result.success).toBe(true)
    })
  })
})

describe('Response schemas', () => {
  describe('createResponseSchema', () => {
    it('accepts valid response with string value', () => {
      const result = createResponseSchema.safeParse({
        bilan_id: UUID,
        question_id: UUID,
        valeur: 'Ma réponse',
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid response with number value', () => {
      const result = createResponseSchema.safeParse({
        bilan_id: UUID,
        question_id: UUID,
        valeur: 7,
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid response with array value', () => {
      const result = createResponseSchema.safeParse({
        bilan_id: UUID,
        question_id: UUID,
        valeur: ['option1', 'option2'],
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing bilan_id', () => {
      const result = createResponseSchema.safeParse({
        question_id: UUID,
        valeur: 'test',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateResponseSchema', () => {
    it('accepts value update', () => {
      const result = updateResponseSchema.safeParse({ valeur: 'updated' })
      expect(result.success).toBe(true)
    })
  })
})

describe('Document schemas', () => {
  describe('createDocumentSchema', () => {
    it('accepts valid document', () => {
      const result = createDocumentSchema.safeParse({
        beneficiaire_id: UUID,
        nom: 'cv.pdf',
        type: 'cv',
        storage_path: 'beneficiaire-123/cv.pdf',
        uploaded_by: UUID,
      })
      expect(result.success).toBe(true)
    })

    it('accepts all document types', () => {
      const types = ['cv', 'lettre_motivation', 'synthese', 'attestation', 'autre']
      for (const type of types) {
        const result = createDocumentSchema.safeParse({
          beneficiaire_id: UUID,
          nom: 'file.pdf',
          type,
          storage_path: 'path/file.pdf',
          uploaded_by: UUID,
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid document type', () => {
      const result = createDocumentSchema.safeParse({
        beneficiaire_id: UUID,
        nom: 'file.pdf',
        type: 'invalid',
        storage_path: 'path/file.pdf',
        uploaded_by: UUID,
      })
      expect(result.success).toBe(false)
    })
  })
})
