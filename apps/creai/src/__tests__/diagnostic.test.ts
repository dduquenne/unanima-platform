import { describe, it, expect } from 'vitest'
import {
  createDiagnosticSchema,
  updateDiagnosticSchema,
  createIndicateurSchema,
  updateIndicateurSchema,
  createRecommandationSchema,
  updateRecommandationSchema,
  createRapportSchema,
  updateRapportSchema,
} from '../lib/types'

const UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('Diagnostic schemas', () => {
  describe('createDiagnosticSchema', () => {
    it('accepts valid diagnostic', () => {
      const result = createDiagnosticSchema.safeParse({
        etablissement_id: UUID,
        auteur_id: UUID,
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('brouillon')
      }
    })

    it('accepts diagnostic with all fields', () => {
      const result = createDiagnosticSchema.safeParse({
        etablissement_id: UUID,
        auteur_id: UUID,
        date_diagnostic: '2026-03-20',
        statut: 'en_cours',
        synthese: 'Synthèse du diagnostic',
      })
      expect(result.success).toBe(true)
    })

    it('accepts all statuts', () => {
      const statuts = ['brouillon', 'en_cours', 'finalise', 'valide']
      for (const statut of statuts) {
        const result = createDiagnosticSchema.safeParse({
          etablissement_id: UUID,
          auteur_id: UUID,
          statut,
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects invalid statut', () => {
      const result = createDiagnosticSchema.safeParse({
        etablissement_id: UUID,
        auteur_id: UUID,
        statut: 'invalid',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updateDiagnosticSchema', () => {
    it('accepts partial update', () => {
      const result = updateDiagnosticSchema.safeParse({ synthese: 'Nouvelle synthèse' })
      expect(result.success).toBe(true)
    })
  })
})

describe('Indicateur schemas', () => {
  describe('createIndicateurSchema', () => {
    it('accepts valid indicateur', () => {
      const result = createIndicateurSchema.safeParse({
        etablissement_id: UUID,
        categorie: 'qualite',
        nom: 'Taux de satisfaction',
        valeur: 85.5,
        unite: '%',
        periode: '2026-03-01',
      })
      expect(result.success).toBe(true)
    })

    it('accepts all categories', () => {
      const categories = ['qualite', 'rh', 'financier', 'activite', 'satisfaction']
      for (const categorie of categories) {
        const result = createIndicateurSchema.safeParse({
          etablissement_id: UUID,
          categorie,
          nom: 'Test',
          valeur: 50,
          periode: '2026-01-01',
        })
        expect(result.success).toBe(true)
      }
    })

    it('rejects missing required fields', () => {
      const result = createIndicateurSchema.safeParse({
        etablissement_id: UUID,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Recommandation schemas', () => {
  describe('createRecommandationSchema', () => {
    it('accepts valid recommandation', () => {
      const result = createRecommandationSchema.safeParse({
        diagnostic_id: UUID,
        priorite: 'haute',
        description: 'Améliorer la qualité des soins',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('proposee')
      }
    })

    it('accepts all priorities', () => {
      const priorites = ['critique', 'haute', 'moyenne', 'basse']
      for (const priorite of priorites) {
        const result = createRecommandationSchema.safeParse({
          diagnostic_id: UUID,
          priorite,
          description: 'Test',
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts all statuts', () => {
      const statuts = ['proposee', 'acceptee', 'en_cours', 'realisee', 'rejetee']
      for (const statut of statuts) {
        const result = createRecommandationSchema.safeParse({
          diagnostic_id: UUID,
          priorite: 'moyenne',
          description: 'Test',
          statut,
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('updateRecommandationSchema', () => {
    it('accepts partial update', () => {
      const result = updateRecommandationSchema.safeParse({
        statut: 'en_cours',
        echeance: '2026-06-01',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('Rapport schemas', () => {
  describe('createRapportSchema', () => {
    it('accepts valid rapport', () => {
      const result = createRapportSchema.safeParse({
        diagnostic_id: UUID,
        titre: 'Rapport annuel',
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.statut).toBe('brouillon')
      }
    })

    it('accepts rapport with contenu', () => {
      const result = createRapportSchema.safeParse({
        diagnostic_id: UUID,
        titre: 'Rapport',
        contenu: { section1: 'data', section2: { nested: true } },
      })
      expect(result.success).toBe(true)
    })
  })

  describe('updateRapportSchema', () => {
    it('accepts status update', () => {
      const result = updateRapportSchema.safeParse({
        statut: 'publie',
        date_publication: '2026-03-20',
      })
      expect(result.success).toBe(true)
    })
  })
})
