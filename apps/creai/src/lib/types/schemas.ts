import { z } from 'zod'

// ============================================================
// Etablissements
// ============================================================
export const etablissementTypeEnum = z.enum(['ehpad', 'ime', 'esat', 'mecs', 'savs', 'sessad', 'foyer', 'autre'])
export const etablissementStatutEnum = z.enum(['actif', 'inactif', 'en_transformation'])

export const createEtablissementSchema = z.object({
  nom: z.string().min(1).max(255),
  type: etablissementTypeEnum,
  adresse: z.string().nullable().optional(),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir 14 chiffres').nullable().optional(),
  capacite: z.number().int().positive().nullable().optional(),
  statut: etablissementStatutEnum.optional().default('actif'),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateEtablissementSchema = z.object({
  nom: z.string().min(1).max(255).optional(),
  type: etablissementTypeEnum.optional(),
  adresse: z.string().nullable().optional(),
  siret: z.string().regex(/^\d{14}$/, 'Le SIRET doit contenir 14 chiffres').nullable().optional(),
  capacite: z.number().int().positive().nullable().optional(),
  statut: etablissementStatutEnum.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ============================================================
// Diagnostics
// ============================================================
export const diagnosticStatutEnum = z.enum(['brouillon', 'en_cours', 'finalise', 'valide'])

export const createDiagnosticSchema = z.object({
  etablissement_id: z.string().uuid(),
  auteur_id: z.string().uuid(),
  date_diagnostic: z.string().date().optional(),
  statut: diagnosticStatutEnum.optional().default('brouillon'),
  synthese: z.string().nullable().optional(),
})

export const updateDiagnosticSchema = z.object({
  statut: diagnosticStatutEnum.optional(),
  synthese: z.string().nullable().optional(),
})

// ============================================================
// Indicateurs
// ============================================================
export const indicateurCategorieEnum = z.enum(['qualite', 'rh', 'financier', 'activite', 'satisfaction'])

export const createIndicateurSchema = z.object({
  etablissement_id: z.string().uuid(),
  categorie: indicateurCategorieEnum,
  nom: z.string().min(1).max(255),
  valeur: z.number(),
  unite: z.string().nullable().optional(),
  periode: z.string().date(),
})

export const updateIndicateurSchema = z.object({
  valeur: z.number().optional(),
  unite: z.string().nullable().optional(),
})

// ============================================================
// Rapports
// ============================================================
export const rapportStatutEnum = z.enum(['brouillon', 'en_revision', 'publie'])

export const createRapportSchema = z.object({
  diagnostic_id: z.string().uuid(),
  titre: z.string().min(1).max(255),
  contenu: z.record(z.string(), z.unknown()).optional().default({}),
  statut: rapportStatutEnum.optional().default('brouillon'),
  date_publication: z.string().date().nullable().optional(),
})

export const updateRapportSchema = z.object({
  titre: z.string().min(1).max(255).optional(),
  contenu: z.record(z.string(), z.unknown()).optional(),
  statut: rapportStatutEnum.optional(),
  date_publication: z.string().date().nullable().optional(),
})

// ============================================================
// Recommandations
// ============================================================
export const recommandationPrioriteEnum = z.enum(['critique', 'haute', 'moyenne', 'basse'])
export const recommandationStatutEnum = z.enum(['proposee', 'acceptee', 'en_cours', 'realisee', 'rejetee'])

export const createRecommandationSchema = z.object({
  diagnostic_id: z.string().uuid(),
  priorite: recommandationPrioriteEnum,
  description: z.string().min(1),
  statut: recommandationStatutEnum.optional().default('proposee'),
  echeance: z.string().date().nullable().optional(),
})

export const updateRecommandationSchema = z.object({
  priorite: recommandationPrioriteEnum.optional(),
  description: z.string().min(1).optional(),
  statut: recommandationStatutEnum.optional(),
  echeance: z.string().date().nullable().optional(),
})

// ============================================================
// Types inférés pour les inputs
// ============================================================
export type CreateEtablissementInput = z.infer<typeof createEtablissementSchema>
export type UpdateEtablissementInput = z.infer<typeof updateEtablissementSchema>
export type CreateDiagnosticInput = z.infer<typeof createDiagnosticSchema>
export type UpdateDiagnosticInput = z.infer<typeof updateDiagnosticSchema>
export type CreateIndicateurInput = z.infer<typeof createIndicateurSchema>
export type UpdateIndicateurInput = z.infer<typeof updateIndicateurSchema>
export type CreateRapportInput = z.infer<typeof createRapportSchema>
export type UpdateRapportInput = z.infer<typeof updateRapportSchema>
export type CreateRecommandationInput = z.infer<typeof createRecommandationSchema>
export type UpdateRecommandationInput = z.infer<typeof updateRecommandationSchema>
