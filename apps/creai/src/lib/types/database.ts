// Types métier CREAI — générés manuellement en attendant supabase gen types
// Ces types seront remplacés par les types auto-générés une fois Supabase connecté

export interface Etablissement {
  id: string
  nom: string
  type: 'ehpad' | 'ime' | 'esat' | 'mecs' | 'savs' | 'sessad' | 'foyer' | 'autre'
  adresse: string | null
  siret: string | null
  capacite: number | null
  statut: 'actif' | 'inactif' | 'en_transformation'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Diagnostic {
  id: string
  etablissement_id: string
  auteur_id: string
  date_diagnostic: string
  statut: 'brouillon' | 'en_cours' | 'finalise' | 'valide'
  synthese: string | null
  created_at: string
  updated_at: string
}

export interface Indicateur {
  id: string
  etablissement_id: string
  categorie: 'qualite' | 'rh' | 'financier' | 'activite' | 'satisfaction'
  nom: string
  valeur: number
  unite: string | null
  periode: string
  created_at: string
}

export interface Rapport {
  id: string
  diagnostic_id: string
  titre: string
  contenu: Record<string, unknown>
  statut: 'brouillon' | 'en_revision' | 'publie'
  date_publication: string | null
  created_at: string
  updated_at: string
}

export interface Recommandation {
  id: string
  diagnostic_id: string
  priorite: 'critique' | 'haute' | 'moyenne' | 'basse'
  description: string
  statut: 'proposee' | 'acceptee' | 'en_cours' | 'realisee' | 'rejetee'
  echeance: string | null
  created_at: string
  updated_at: string
}
