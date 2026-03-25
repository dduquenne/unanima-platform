// Tests — Schémas Zod Links (nouveau schéma Sprint 8)
// Issue: #106 — Sprint 8 Fondations

import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  resetPasswordRequestSchema,
  resetPasswordSchema,
  phaseStatusEnum,
  phaseResponseSchema,
  updatePhaseResponseSchema,
  autosaveSchema,
  phaseValidationSchema,
  updatePhaseValidationSchema,
  sessionSchema,
  updateSessionSchema,
  visioUrlSchema,
  sessionNoteSchema,
  updateSessionNoteSchema,
  createUserSchema,
  updateUserSchema,
  phaseDocumentUploadSchema,
} from '@/lib/types/schemas'

// ============================================================
// Authentification
// ============================================================

describe('loginSchema', () => {
  it('valide un email + mot de passe corrects', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejette un email invalide', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
  })

  it('rejette un mot de passe trop court', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '1234567' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordRequestSchema', () => {
  it('valide un email valide', () => {
    const result = resetPasswordRequestSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('rejette un email invalide', () => {
    const result = resetPasswordRequestSchema.safeParse({ email: 'invalid' })
    expect(result.success).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('valide un mot de passe + token', () => {
    const result = resetPasswordSchema.safeParse({ password: 'newpassword123', token: 'abc123' })
    expect(result.success).toBe(true)
  })

  it('rejette un token vide', () => {
    const result = resetPasswordSchema.safeParse({ password: 'newpassword123', token: '' })
    expect(result.success).toBe(false)
  })
})

// ============================================================
// phaseStatusEnum
// ============================================================

describe('phaseStatusEnum', () => {
  it('accepte les valeurs valides', () => {
    for (const val of ['libre', 'en_cours', 'validee']) {
      expect(phaseStatusEnum.safeParse(val).success).toBe(true)
    }
  })

  it('rejette les valeurs invalides', () => {
    expect(phaseStatusEnum.safeParse('inconnu').success).toBe(false)
    expect(phaseStatusEnum.safeParse('').success).toBe(false)
  })
})

// ============================================================
// phaseResponseSchema
// ============================================================

describe('phaseResponseSchema', () => {
  const valid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    question_id: '550e8400-e29b-41d4-a716-446655440001',
    phase_number: 3,
    response_text: 'Ma réponse',
  }

  it('valide une réponse valide', () => {
    expect(phaseResponseSchema.safeParse(valid).success).toBe(true)
  })

  it('applique le statut par défaut "en_cours"', () => {
    const result = phaseResponseSchema.safeParse(valid)
    expect(result.success && result.data.phase_status).toBe('en_cours')
  })

  it('rejette une phase_number hors plage', () => {
    expect(phaseResponseSchema.safeParse({ ...valid, phase_number: 0 }).success).toBe(false)
    expect(phaseResponseSchema.safeParse({ ...valid, phase_number: 7 }).success).toBe(false)
  })

  it('accepte response_text null', () => {
    expect(phaseResponseSchema.safeParse({ ...valid, response_text: null }).success).toBe(true)
  })

  it('rejette un beneficiary_id non-UUID', () => {
    expect(phaseResponseSchema.safeParse({ ...valid, beneficiary_id: 'not-a-uuid' }).success).toBe(false)
  })
})

describe('autosaveSchema', () => {
  it('valide un payload autosave minimal', () => {
    const result = autosaveSchema.safeParse({
      question_id: '550e8400-e29b-41d4-a716-446655440001',
      response_text: 'Texte sauvegardé',
      phase_number: 2,
    })
    expect(result.success).toBe(true)
  })

  it('accepte response_text null', () => {
    const result = autosaveSchema.safeParse({
      question_id: '550e8400-e29b-41d4-a716-446655440001',
      response_text: null,
      phase_number: 1,
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// phaseValidationSchema
// ============================================================

describe('phaseValidationSchema', () => {
  const valid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    phase_number: 1,
  }

  it('valide avec statut par défaut "validee"', () => {
    const result = phaseValidationSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.success && result.data.status).toBe('validee')
  })

  it('accepte un statut explicite', () => {
    expect(phaseValidationSchema.safeParse({ ...valid, status: 'libre' }).success).toBe(true)
  })

  it('rejette phase_number = 7', () => {
    expect(phaseValidationSchema.safeParse({ ...valid, phase_number: 7 }).success).toBe(false)
  })
})

// ============================================================
// sessionSchema
// ============================================================

describe('sessionSchema', () => {
  const valid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    session_number: 1,
  }

  it('valide une séance minimale', () => {
    expect(sessionSchema.safeParse(valid).success).toBe(true)
  })

  it('valide avec URL visio et date', () => {
    const result = sessionSchema.safeParse({
      ...valid,
      scheduled_at: '2026-04-01T10:00:00+02:00',
      visio_url: 'https://meet.google.com/abc-def-ghi',
    })
    expect(result.success).toBe(true)
  })

  it('rejette une URL visio invalide', () => {
    expect(sessionSchema.safeParse({ ...valid, visio_url: 'not-a-url' }).success).toBe(false)
  })

  it('rejette session_number hors plage', () => {
    expect(sessionSchema.safeParse({ ...valid, session_number: 0 }).success).toBe(false)
    expect(sessionSchema.safeParse({ ...valid, session_number: 7 }).success).toBe(false)
  })
})

// ============================================================
// sessionNoteSchema
// ============================================================

describe('sessionNoteSchema', () => {
  const valid = {
    beneficiary_id: '550e8400-e29b-41d4-a716-446655440000',
    session_number: 2,
    content: 'Notes de la séance',
  }

  it('valide une note valide', () => {
    expect(sessionNoteSchema.safeParse(valid).success).toBe(true)
  })

  it('accepte content null', () => {
    expect(sessionNoteSchema.safeParse({ ...valid, content: null }).success).toBe(true)
  })

  it('rejette un content dépassant 10 000 caractères', () => {
    const longContent = 'a'.repeat(10001)
    expect(sessionNoteSchema.safeParse({ ...valid, content: longContent }).success).toBe(false)
  })
})

// ============================================================
// createUserSchema / updateUserSchema
// ============================================================

describe('createUserSchema', () => {
  it('valide la création d\'un bénéficiaire', () => {
    const result = createUserSchema.safeParse({
      email: 'ben@example.com',
      full_name: 'Jean Dupont',
      role: 'beneficiaire',
      consultant_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejette un rôle invalide', () => {
    expect(createUserSchema.safeParse({
      email: 'u@e.com',
      full_name: 'Test',
      role: 'manager',
    }).success).toBe(false)
  })

  it('rejette le rôle super_admin', () => {
    const result = createUserSchema.safeParse({
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'super_admin',
    })
    expect(result.success).toBe(false)
  })
})

describe('updateUserSchema', () => {
  it('valide une mise à jour partielle', () => {
    expect(updateUserSchema.safeParse({ is_active: false }).success).toBe(true)
  })

  it('valide une mise à jour de consultant_id', () => {
    expect(updateUserSchema.safeParse({
      consultant_id: '550e8400-e29b-41d4-a716-446655440000',
    }).success).toBe(true)
  })
})

// ============================================================
// phaseDocumentUploadSchema
// ============================================================

describe('phaseDocumentUploadSchema', () => {
  it('valide un upload de document PDF', () => {
    const result = phaseDocumentUploadSchema.safeParse({
      phase_number: 1,
      display_name: 'Guide Phase 1',
      file_type: 'pdf',
    })
    expect(result.success).toBe(true)
    expect(result.success && result.data.sort_order).toBe(0)
  })

  it('accepte docx', () => {
    expect(phaseDocumentUploadSchema.safeParse({
      phase_number: 3,
      display_name: 'Document Word',
      file_type: 'docx',
    }).success).toBe(true)
  })

  it('rejette un type de fichier invalide', () => {
    expect(phaseDocumentUploadSchema.safeParse({
      phase_number: 1,
      display_name: 'Test',
      file_type: 'xlsx',
    }).success).toBe(false)
  })

  it('rejette phase_number hors plage', () => {
    expect(phaseDocumentUploadSchema.safeParse({
      phase_number: 7,
      display_name: 'Test',
      file_type: 'pdf',
    }).success).toBe(false)
  })
})
