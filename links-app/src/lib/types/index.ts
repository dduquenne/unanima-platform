// Types métier Links — exports centralisés
// Issue: #106 — Sprint 8 Fondations

export type {
  Profile,
  Questionnaire,
  Question,
  PhaseStatus,
  PhaseResponse,
  PhaseValidation,
  Session,
  SessionNote,
  PhaseDocumentFileType,
  PhaseDocument,
} from './database'

export {
  // Auth
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  // Phases
  phaseStatusEnum,
  phaseNumberSchema,
  phaseResponseSchema,
  updatePhaseResponseSchema,
  autosaveSchema,
  phaseValidationSchema,
  updatePhaseValidationSchema,
  // Sessions
  sessionSchema,
  updateSessionSchema,
  visioUrlSchema,
  // Notes
  sessionNoteSchema,
  updateSessionNoteSchema,
  // Admin
  createUserSchema,
  updateUserSchema,
  phaseDocumentUploadSchema,
} from './schemas'

export type {
  LoginInput,
  ResetPasswordRequestInput,
  ResetPasswordInput,
  PhaseResponseInput,
  UpdatePhaseResponseInput,
  AutosaveInput,
  PhaseValidationInput,
  UpdatePhaseValidationInput,
  SessionInput,
  UpdateSessionInput,
  SessionNoteInput,
  UpdateSessionNoteInput,
  CreateUserInput,
  UpdateUserInput,
  PhaseDocumentUploadInput,
} from './schemas'
