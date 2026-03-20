// Types métier Omega — générés manuellement en attendant supabase gen types
// Ces types seront remplacés par les types auto-générés une fois Supabase connecté

export interface ClientVehicule {
  id: string
  raison_sociale: string
  contact: string | null
  vehicule_marque: string
  vehicule_modele: string
  immatriculation: string | null
  vin: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Intervention {
  id: string
  client_vehicule_id: string
  technicien_id: string | null
  type: 'garantie' | 'maintenance' | 'reparation' | 'rappel' | 'diagnostic'
  statut: 'planifiee' | 'en_cours' | 'en_attente_pieces' | 'terminee' | 'annulee'
  priorite: 'critique' | 'haute' | 'normale' | 'basse'
  description: string | null
  date_planifiee: string | null
  date_debut: string | null
  date_fin: string | null
  created_at: string
  updated_at: string
}

export interface Affectation {
  id: string
  intervention_id: string
  technicien_id: string
  responsable_id: string
  date_affectation: string
  commentaire: string | null
  created_at: string
}

export interface PieceDetachee {
  id: string
  reference: string
  designation: string
  stock_actuel: number
  seuil_alerte: number
  prix_unitaire: number
  created_at: string
  updated_at: string
}

export interface KpiSav {
  id: string
  periode: string
  type: 'delai_moyen' | 'taux_resolution' | 'satisfaction' | 'interventions_total' | 'pieces_consommees' | 'cout_moyen'
  valeur: number
  objectif: number | null
  metadata: Record<string, unknown>
  created_at: string
}
