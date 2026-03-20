// Types métier Links — générés manuellement en attendant supabase gen types
// Ces types seront remplacés par les types auto-générés une fois Supabase connecté

export interface Beneficiaire {
  id: string
  profile_id: string
  consultant_id: string
  statut: 'actif' | 'en_pause' | 'termine' | 'abandonne'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Bilan {
  id: string
  beneficiaire_id: string
  type: 'initial' | 'intermediaire' | 'final'
  statut: 'brouillon' | 'en_cours' | 'termine' | 'valide'
  date_debut: string | null
  date_fin: string | null
  created_at: string
  updated_at: string
}

export interface Questionnaire {
  id: string
  titre: string
  description: string | null
  version: number
  is_active: boolean
  created_at: string
}

export interface Question {
  id: string
  questionnaire_id: string
  ordre: number
  texte: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'scale'
  options: unknown[]
  required: boolean
}

export interface Response {
  id: string
  bilan_id: string
  question_id: string
  valeur: unknown
  created_at: string
}

export interface Document {
  id: string
  beneficiaire_id: string
  bilan_id: string | null
  nom: string
  type: 'cv' | 'lettre_motivation' | 'synthese' | 'attestation' | 'autre'
  storage_path: string
  uploaded_by: string
  created_at: string
}
