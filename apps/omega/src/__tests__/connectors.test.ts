import { describe, it, expect } from 'vitest'
import {
  createInterventionSchema,
  updateInterventionSchema,
  createAffectationSchema,
  createPieceDetacheeSchema,
  updatePieceDetacheeSchema,
} from '../lib/types'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('Intervention schemas', () => {
  describe('createInterventionSchema', () => {
    it('accepts valid intervention', () => {
      const result = createInterventionSchema.safeParse({
        client_vehicule_id: UUID,
        type: 'reparation',
        priorite: 'haute',
      })
      expect(result.success).toBe(true)
    })

    it('accepts all intervention types', () => {
      const types = ['garantie', 'maintenance', 'reparation', 'rappel', 'diagnostic']
      for (const type of types) {
        const result = createInterventionSchema.safeParse({
          client_vehicule_id: UUID,
          type,
          priorite: 'normale',
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts all priorities', () => {
      const priorites = ['critique', 'haute', 'normale', 'basse']
      for (const priorite of priorites) {
        const result = createInterventionSchema.safeParse({
          client_vehicule_id: UUID,
          type: 'maintenance',
          priorite,
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid type', () => {
      const result = createInterventionSchema.safeParse({
        client_vehicule_id: UUID,
        type: 'invalid',
        priorite: 'normale',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateInterventionSchema', () => {
    it('accepts status update', () => {
      const result = updateInterventionSchema.safeParse({ statut: 'en_cours' })
      expect(result.success).toBe(true)
    })

    it('accepts all statuts', () => {
      const statuts = ['planifiee', 'en_cours', 'en_attente_pieces', 'terminee', 'annulee']
      for (const statut of statuts) {
        const result = updateInterventionSchema.safeParse({ statut })
        expect(result.success).toBe(true)
      }
    })
  })
})

describe('Affectation schemas', () => {
  describe('createAffectationSchema', () => {
    it('accepts valid affectation', () => {
      const result = createAffectationSchema.safeParse({
        intervention_id: UUID,
        technicien_id: UUID,
        responsable_id: UUID,
      })
      expect(result.success).toBe(true)
    })

    it('accepts affectation with comment', () => {
      const result = createAffectationSchema.safeParse({
        intervention_id: UUID,
        technicien_id: UUID,
        responsable_id: UUID,
        commentaire: 'Urgent — intervention prioritaire',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing technicien_id', () => {
      const result = createAffectationSchema.safeParse({
        intervention_id: UUID,
        responsable_id: UUID,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('PieceDetachee schemas', () => {
  describe('createPieceDetacheeSchema', () => {
    it('accepts valid piece', () => {
      const result = createPieceDetacheeSchema.safeParse({
        reference: 'FIL-001',
        designation: 'Filtre à huile',
        stock_actuel: 45,
        seuil_alerte: 10,
        prix_unitaire: 12.50,
      })
      expect(result.success).toBe(true)
    })

    it('rejects negative stock', () => {
      const result = createPieceDetacheeSchema.safeParse({
        reference: 'FIL-001',
        designation: 'Filtre à huile',
        stock_actuel: -1,
        seuil_alerte: 10,
        prix_unitaire: 12.50,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePieceDetacheeSchema', () => {
    it('accepts stock update', () => {
      const result = updatePieceDetacheeSchema.safeParse({ stock_actuel: 30 })
      expect(result.success).toBe(true)
    })
  })
})
