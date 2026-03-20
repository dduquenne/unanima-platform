import { describe, it, expect } from 'vitest'
import {
  createClientVehiculeSchema,
  updateClientVehiculeSchema,
  createInterventionSchema,
  updateInterventionSchema,
  createAffectationSchema,
  createPieceDetacheeSchema,
  updatePieceDetacheeSchema,
  createKpiSavSchema,
} from '../lib/types'

describe('Omega Zod schemas', () => {
  describe('createClientVehiculeSchema', () => {
    it('accepts valid data', () => {
      const data = {
        raison_sociale: 'Garage Martin',
        vehicule_marque: 'Renault',
        vehicule_modele: 'Clio V',
      }
      const result = createClientVehiculeSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('validates VIN length (17 chars)', () => {
      const valid = createClientVehiculeSchema.safeParse({
        raison_sociale: 'Test',
        vehicule_marque: 'BMW',
        vehicule_modele: 'X3',
        vin: 'WBAPH5C55BA123456',
      })
      expect(valid.success).toBe(true)

      const invalid = createClientVehiculeSchema.safeParse({
        raison_sociale: 'Test',
        vehicule_marque: 'BMW',
        vehicule_modele: 'X3',
        vin: 'SHORT',
      })
      expect(invalid.success).toBe(false)
    })

    it('rejects missing required fields', () => {
      const result = createClientVehiculeSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('updateClientVehiculeSchema', () => {
    it('accepts partial updates', () => {
      const result = updateClientVehiculeSchema.safeParse({ contact: 'Jean Dupont' })
      expect(result.success).toBe(true)
    })
  })

  describe('createInterventionSchema', () => {
    it('accepts valid data with defaults', () => {
      const data = {
        client_vehicule_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'maintenance',
      }
      const result = createInterventionSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('planifiee')
        expect(result.data.priorite).toBe('normale')
      }
    })

    it('rejects invalid type', () => {
      const data = {
        client_vehicule_id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'invalid',
      }
      const result = createInterventionSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts all valid statuts', () => {
      const statuts = ['planifiee', 'en_cours', 'en_attente_pieces', 'terminee', 'annulee']
      for (const statut of statuts) {
        const result = createInterventionSchema.safeParse({
          client_vehicule_id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'reparation',
          statut,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('updateInterventionSchema', () => {
    it('accepts statut update', () => {
      const result = updateInterventionSchema.safeParse({ statut: 'terminee' })
      expect(result.success).toBe(true)
    })

    it('accepts datetime for date_debut', () => {
      const result = updateInterventionSchema.safeParse({
        date_debut: '2026-04-01T09:00:00Z',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('createAffectationSchema', () => {
    it('accepts valid data', () => {
      const data = {
        intervention_id: '550e8400-e29b-41d4-a716-446655440000',
        technicien_id: '550e8400-e29b-41d4-a716-446655440001',
        responsable_id: '550e8400-e29b-41d4-a716-446655440002',
      }
      const result = createAffectationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing technicien_id', () => {
      const data = {
        intervention_id: '550e8400-e29b-41d4-a716-446655440000',
        responsable_id: '550e8400-e29b-41d4-a716-446655440002',
      }
      const result = createAffectationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('createPieceDetacheeSchema', () => {
    it('accepts valid data with defaults', () => {
      const data = {
        reference: 'FILT-OIL-001',
        designation: 'Filtre à huile',
      }
      const result = createPieceDetacheeSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.stock_actuel).toBe(0)
        expect(result.data.seuil_alerte).toBe(5)
        expect(result.data.prix_unitaire).toBe(0)
      }
    })

    it('rejects negative stock', () => {
      const data = {
        reference: 'TEST',
        designation: 'Test',
        stock_actuel: -1,
      }
      const result = createPieceDetacheeSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('updatePieceDetacheeSchema', () => {
    it('accepts stock update', () => {
      const result = updatePieceDetacheeSchema.safeParse({ stock_actuel: 42 })
      expect(result.success).toBe(true)
    })

    it('rejects negative prix_unitaire', () => {
      const result = updatePieceDetacheeSchema.safeParse({ prix_unitaire: -5 })
      expect(result.success).toBe(false)
    })
  })

  describe('createKpiSavSchema', () => {
    it('accepts valid data', () => {
      const data = {
        periode: '2026-03-01',
        type: 'taux_resolution',
        valeur: 92.5,
        objectif: 95,
      }
      const result = createKpiSavSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects invalid KPI type', () => {
      const data = {
        periode: '2026-03-01',
        type: 'invalid_kpi',
        valeur: 50,
      }
      const result = createKpiSavSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
