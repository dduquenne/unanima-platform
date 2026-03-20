import { z } from 'zod'

// ============================================================
// Beneficiaires
// ============================================================
export const beneficiaireStatutEnum = z.enum(['actif', 'en_pause', 'termine', 'abandonne'])

export const createBeneficiaireSchema = z.object({
  profile_id: z.string().uuid(),
  consultant_id: z.string().uuid(),
  statut: beneficiaireStatutEnum.optional().default('actif'),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateBeneficiaireSchema = z.object({
  statut: beneficiaireStatutEnum.optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ============================================================
// Bilans
// ============================================================
export const bilanTypeEnum = z.enum(['initial', 'intermediaire', 'final'])
export const bilanStatutEnum = z.enum(['brouillon', 'en_cours', 'termine', 'valide'])

export const createBilanSchema = z.object({
  beneficiaire_id: z.string().uuid(),
  type: bilanTypeEnum,
  statut: bilanStatutEnum.optional().default('brouillon'),
  date_debut: z.string().date().nullable().optional(),
  date_fin: z.string().date().nullable().optional(),
})

export const updateBilanSchema = z.object({
  statut: bilanStatutEnum.optional(),
  date_debut: z.string().date().nullable().optional(),
  date_fin: z.string().date().nullable().optional(),
})

// ============================================================
// Questionnaires
// ============================================================
export const createQuestionnaireSchema = z.object({
  titre: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  version: z.number().int().positive().optional().default(1),
  is_active: z.boolean().optional().default(true),
})

export const updateQuestionnaireSchema = z.object({
  titre: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  version: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
})

// ============================================================
// Questions
// ============================================================
export const questionTypeEnum = z.enum(['text', 'textarea', 'select', 'multiselect', 'radio', 'checkbox', 'scale'])

export const createQuestionSchema = z.object({
  questionnaire_id: z.string().uuid(),
  ordre: z.number().int().nonnegative(),
  texte: z.string().min(1),
  type: questionTypeEnum,
  options: z.array(z.unknown()).optional().default([]),
  required: z.boolean().optional().default(false),
})

export const updateQuestionSchema = z.object({
  ordre: z.number().int().nonnegative().optional(),
  texte: z.string().min(1).optional(),
  type: questionTypeEnum.optional(),
  options: z.array(z.unknown()).optional(),
  required: z.boolean().optional(),
})

// ============================================================
// Responses
// ============================================================
export const createResponseSchema = z.object({
  bilan_id: z.string().uuid(),
  question_id: z.string().uuid(),
  valeur: z.unknown(),
})

export const updateResponseSchema = z.object({
  valeur: z.unknown(),
})

// ============================================================
// Documents
// ============================================================
export const documentTypeEnum = z.enum(['cv', 'lettre_motivation', 'synthese', 'attestation', 'autre'])

export const createDocumentSchema = z.object({
  beneficiaire_id: z.string().uuid(),
  bilan_id: z.string().uuid().nullable().optional(),
  nom: z.string().min(1).max(255),
  type: documentTypeEnum,
  storage_path: z.string().min(1),
  uploaded_by: z.string().uuid(),
})

// ============================================================
// Types inférés pour les inputs
// ============================================================
export type CreateBeneficiaireInput = z.infer<typeof createBeneficiaireSchema>
export type UpdateBeneficiaireInput = z.infer<typeof updateBeneficiaireSchema>
export type CreateBilanInput = z.infer<typeof createBilanSchema>
export type UpdateBilanInput = z.infer<typeof updateBilanSchema>
export type CreateQuestionnaireInput = z.infer<typeof createQuestionnaireSchema>
export type UpdateQuestionnaireInput = z.infer<typeof updateQuestionnaireSchema>
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>
export type CreateResponseInput = z.infer<typeof createResponseSchema>
export type UpdateResponseInput = z.infer<typeof updateResponseSchema>
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
