// Types métier Links — Schéma 6 phases (bilans de compétences)
// Issue: #106 — Sprint 8 Fondations
// Généré depuis le schéma Supabase — apps/links/supabase/migrations/001_links_schema.sql

// ============================================================
// Extension de profiles (socle @unanima/db)
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'beneficiaire' | 'consultant' | 'super_admin'
  is_active: boolean
  /** FK → profiles.id : consultant assigné à ce bénéficiaire */
  consultant_id: string | null
  date_debut_bilan: string | null
  date_fin_bilan: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ============================================================
// Questionnaires et questions
// ============================================================

export interface Questionnaire {
  id: string
  /** Phase concernée : 1 à 6 */
  phase_number: number
  title: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Question {
  id: string
  questionnaire_id: string
  text: string
  sort_order: number
  created_at: string
}

// ============================================================
// Réponses et validation des phases
// ============================================================

export type PhaseStatus = 'libre' | 'en_cours' | 'validee'

export interface PhaseResponse {
  id: string
  beneficiary_id: string
  question_id: string
  response_text: string | null
  /** Phase concernée : 1 à 6 */
  phase_number: number
  phase_status: PhaseStatus
  last_saved_at: string
  created_at: string
  updated_at: string
}

export interface PhaseValidation {
  id: string
  beneficiary_id: string
  /** Phase concernée : 1 à 6 */
  phase_number: number
  status: PhaseStatus
  validated_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Séances de suivi
// ============================================================

export interface Session {
  id: string
  beneficiary_id: string
  /** Numéro de séance : 1 à 6 */
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// Comptes-rendus de séances (confidentiels — consultant only)
// ============================================================

export interface SessionNote {
  id: string
  beneficiary_id: string
  /** Consultant auteur de la note */
  consultant_id: string
  /** Numéro de séance : 1 à 6 */
  session_number: number
  content: string | null
  max_length: number
  created_at: string
  updated_at: string
}

// ============================================================
// Consultant portfolio — bénéficiaire avec parcours
// ============================================================

export interface BeneficiaireWithParcours {
  id: string
  full_name: string
  email: string
  is_active: boolean
  date_debut_bilan: string | null
  phases: Array<{ phase_number: number; status: PhaseStatus }>
  next_session: string | null
  validated_count: number
  created_at: string
}

// ============================================================
// Documents de phase (super_admin only)
// ============================================================

export type PhaseDocumentFileType = 'pdf' | 'docx'

export interface PhaseDocument {
  id: string
  /** Phase concernée : 1 à 6 */
  phase_number: number
  filename: string
  storage_path: string
  display_name: string
  file_type: PhaseDocumentFileType
  sort_order: number
  uploaded_by: string | null
  created_at: string
  updated_at: string
}
