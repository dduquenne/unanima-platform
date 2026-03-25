/**
 * Configuration centralisée des 6 phases du bilan de compétences.
 * Source unique de vérité — ne pas redéfinir localement.
 */

export const TOTAL_PHASES = 6

/** Labels courts orientés bénéficiaire (dashboard, cartes de phase). */
export const PHASE_LABELS: Record<number, string> = {
  1: 'Définir mon projet',
  2: 'Explorer mes compétences',
  3: 'Analyser mon marché',
  4: 'Construire mon plan',
  5: 'Préparer mon entretien',
  6: 'Finaliser mon bilan',
}

/** Descriptions longues (page de phase, vue consultant). */
export const PHASE_DESCRIPTIONS: Record<number, string> = {
  1: 'Phase préliminaire — Accueil et définition du projet',
  2: 'Investigation — Parcours personnel et aptitudes',
  3: 'Investigation — Parcours professionnel et compétences',
  4: 'Investigation — Projet professionnel et motivations',
  5: 'Conclusion — Plan d\u2019action et préparation',
  6: 'Suivi à 6 mois — Synthèse finale',
}
