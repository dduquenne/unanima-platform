import { z } from 'zod'

// ============================================================
// Authentification
// ============================================================

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
})

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Email invalide'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
  token: z.string().min(1, 'Token requis'),
})

// ============================================================
// Phases — enum partagé
// ============================================================

export const phaseStatusEnum = z.enum(['libre', 'en_cours', 'validee'])
export const phaseNumberSchema = z.number().int().min(1).max(6)

// ============================================================
// Phase responses (bénéficiaire — saisie + autosave)
// ============================================================

export const phaseResponseSchema = z.object({
  beneficiary_id: z.string().uuid(),
  question_id: z.string().uuid(),
  response_text: z.string().nullable().optional(),
  phase_number: phaseNumberSchema,
  phase_status: phaseStatusEnum.optional().default('en_cours'),
})

export const updatePhaseResponseSchema = z.object({
  response_text: z.string().nullable().optional(),
  phase_status: phaseStatusEnum.optional(),
})

/** Payload minimal pour l'autosave (déclenché au blur + toutes les 30s) */
export const autosaveSchema = z.object({
  question_id: z.string().uuid(),
  response_text: z.string().nullable(),
  phase_number: phaseNumberSchema,
})

// ============================================================
// Phase validations (bénéficiaire — valider / dé-valider une phase)
// ============================================================

export const phaseValidationSchema = z.object({
  beneficiary_id: z.string().uuid(),
  phase_number: phaseNumberSchema,
  status: phaseStatusEnum.optional().default('validee'),
})

export const updatePhaseValidationSchema = z.object({
  status: phaseStatusEnum,
})

// ============================================================
// Sessions (consultant — planification des 6 séances)
// ============================================================

export const sessionSchema = z.object({
  beneficiary_id: z.string().uuid(),
  session_number: z.number().int().min(1).max(6),
  scheduled_at: z.string().datetime({ offset: true }).nullable().optional(),
  visio_url: z.string().url('URL de visioconférence invalide').nullable().optional(),
})

export const updateSessionSchema = z.object({
  scheduled_at: z.string().datetime({ offset: true }).nullable().optional(),
  visio_url: z.string().url('URL de visioconférence invalide').nullable().optional(),
})

export const visioUrlSchema = z.object({
  url: z.string().url('URL de visioconférence invalide'),
})

// ============================================================
// Session notes (consultant — comptes-rendus confidentiels)
// ============================================================

export const sessionNoteSchema = z.object({
  beneficiary_id: z.string().uuid(),
  session_number: z.number().int().min(1).max(6),
  content: z.string().max(10000, '10 000 caractères maximum').nullable().optional(),
})

export const updateSessionNoteSchema = z.object({
  content: z.string().max(10000, '10 000 caractères maximum').nullable(),
})

// ============================================================
// Admin — gestion des comptes utilisateurs
// ============================================================

export const createUserSchema = z.object({
  email: z.string().email('Email invalide'),
  full_name: z.string().min(1, 'Nom requis').max(255),
  role: z.enum(['beneficiaire', 'consultant'], {
    error: 'Rôle invalide : seuls beneficiaire et consultant sont autorisés',
  }),
  consultant_id: z.string().uuid().nullable().optional(),
})

export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  role: z.enum(['beneficiaire', 'consultant', 'super_admin']).optional(),
  is_active: z.boolean().optional(),
  consultant_id: z.string().uuid().nullable().optional(),
  date_debut_bilan: z.string().date().nullable().optional(),
  date_fin_bilan: z.string().date().nullable().optional(),
})

// ============================================================
// Admin — documents de phase (upload)
// ============================================================

export const phaseDocumentUploadSchema = z.object({
  phase_number: phaseNumberSchema,
  display_name: z.string().min(1).max(255),
  file_type: z.enum(['pdf', 'docx']),
  sort_order: z.number().int().nonnegative().optional().default(0),
})

// ============================================================
// Types inférés depuis les schémas
// ============================================================

export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export type PhaseResponseInput = z.infer<typeof phaseResponseSchema>
export type UpdatePhaseResponseInput = z.infer<typeof updatePhaseResponseSchema>
export type AutosaveInput = z.infer<typeof autosaveSchema>

export type PhaseValidationInput = z.infer<typeof phaseValidationSchema>
export type UpdatePhaseValidationInput = z.infer<typeof updatePhaseValidationSchema>

export type SessionInput = z.infer<typeof sessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>

export type SessionNoteInput = z.infer<typeof sessionNoteSchema>
export type UpdateSessionNoteInput = z.infer<typeof updateSessionNoteSchema>

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export type PhaseDocumentUploadInput = z.infer<typeof phaseDocumentUploadSchema>
