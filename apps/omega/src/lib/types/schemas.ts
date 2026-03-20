import { z } from 'zod'

// ============================================================
// Clients Véhicules
// ============================================================
export const createClientVehiculeSchema = z.object({
  raison_sociale: z.string().min(1).max(255),
  contact: z.string().nullable().optional(),
  vehicule_marque: z.string().min(1).max(100),
  vehicule_modele: z.string().min(1).max(100),
  immatriculation: z.string().nullable().optional(),
  vin: z.string().length(17).nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
})

export const updateClientVehiculeSchema = z.object({
  raison_sociale: z.string().min(1).max(255).optional(),
  contact: z.string().nullable().optional(),
  vehicule_marque: z.string().min(1).max(100).optional(),
  vehicule_modele: z.string().min(1).max(100).optional(),
  immatriculation: z.string().nullable().optional(),
  vin: z.string().length(17).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================
// Interventions
// ============================================================
export const interventionTypeEnum = z.enum(['garantie', 'maintenance', 'reparation', 'rappel', 'diagnostic'])
export const interventionStatutEnum = z.enum(['planifiee', 'en_cours', 'en_attente_pieces', 'terminee', 'annulee'])
export const interventionPrioriteEnum = z.enum(['critique', 'haute', 'normale', 'basse'])

export const createInterventionSchema = z.object({
  client_vehicule_id: z.string().uuid(),
  technicien_id: z.string().uuid().nullable().optional(),
  type: interventionTypeEnum,
  statut: interventionStatutEnum.optional().default('planifiee'),
  priorite: interventionPrioriteEnum.optional().default('normale'),
  description: z.string().nullable().optional(),
  date_planifiee: z.string().date().nullable().optional(),
  date_debut: z.string().datetime().nullable().optional(),
  date_fin: z.string().datetime().nullable().optional(),
})

export const updateInterventionSchema = z.object({
  technicien_id: z.string().uuid().nullable().optional(),
  statut: interventionStatutEnum.optional(),
  priorite: interventionPrioriteEnum.optional(),
  description: z.string().nullable().optional(),
  date_planifiee: z.string().date().nullable().optional(),
  date_debut: z.string().datetime().nullable().optional(),
  date_fin: z.string().datetime().nullable().optional(),
})

// ============================================================
// Affectations
// ============================================================
export const createAffectationSchema = z.object({
  intervention_id: z.string().uuid(),
  technicien_id: z.string().uuid(),
  responsable_id: z.string().uuid(),
  commentaire: z.string().nullable().optional(),
})

// ============================================================
// Pièces détachées
// ============================================================
export const createPieceDetacheeSchema = z.object({
  reference: z.string().min(1).max(50),
  designation: z.string().min(1).max(255),
  stock_actuel: z.number().int().nonnegative().optional().default(0),
  seuil_alerte: z.number().int().nonnegative().optional().default(5),
  prix_unitaire: z.number().nonnegative().optional().default(0),
})

export const updatePieceDetacheeSchema = z.object({
  designation: z.string().min(1).max(255).optional(),
  stock_actuel: z.number().int().nonnegative().optional(),
  seuil_alerte: z.number().int().nonnegative().optional(),
  prix_unitaire: z.number().nonnegative().optional(),
})

// ============================================================
// KPIs SAV
// ============================================================
export const kpiSavTypeEnum = z.enum(['delai_moyen', 'taux_resolution', 'satisfaction', 'interventions_total', 'pieces_consommees', 'cout_moyen'])

export const createKpiSavSchema = z.object({
  periode: z.string().date(),
  type: kpiSavTypeEnum,
  valeur: z.number(),
  objectif: z.number().nullable().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
})

export const updateKpiSavSchema = z.object({
  valeur: z.number().optional(),
  objectif: z.number().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// ============================================================
// Types inférés pour les inputs
// ============================================================
export type CreateClientVehiculeInput = z.infer<typeof createClientVehiculeSchema>
export type UpdateClientVehiculeInput = z.infer<typeof updateClientVehiculeSchema>
export type CreateInterventionInput = z.infer<typeof createInterventionSchema>
export type UpdateInterventionInput = z.infer<typeof updateInterventionSchema>
export type CreateAffectationInput = z.infer<typeof createAffectationSchema>
export type CreatePieceDetacheeInput = z.infer<typeof createPieceDetacheeSchema>
export type UpdatePieceDetacheeInput = z.infer<typeof updatePieceDetacheeSchema>
export type CreateKpiSavInput = z.infer<typeof createKpiSavSchema>
export type UpdateKpiSavInput = z.infer<typeof updateKpiSavSchema>
