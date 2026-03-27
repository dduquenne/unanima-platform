// Fixtures — Réponses aux questionnaires
// Issue: #132 — Sprint 12

import type { PhaseResponse } from '@/lib/types/database'
import { BENEFICIAIRE_1_ID, BENEFICIAIRE_2_ID, BENEFICIAIRE_3_ID, BENEFICIAIRE_5_ID } from './profiles'

// Réponses pré-remplies pour les phases validées/en cours
const SAMPLE_RESPONSES: Record<string, string> = {
  'q-1-1': 'J\'ai commencé ma carrière en 2015 comme assistante de direction dans une PME industrielle. Après 3 ans, j\'ai évolué vers un poste de coordinatrice de projets.',
  'q-1-2': 'Le poste de coordinatrice m\'a le plus marquée car j\'ai pu développer mon autonomie et gérer des projets transversaux impliquant plusieurs services.',
  'q-1-3': 'BTS Assistant de Manager, Licence professionnelle en management de projet, et plusieurs formations courtes en gestion de projet agile.',
  'q-1-4': 'Ma plus grande réussite a été le déploiement d\'un ERP dans mon entreprise. La difficulté principale a été la résistance au changement des équipes.',
  'q-2-1': 'Gestion de projet, coordination d\'équipes, maîtrise des outils bureautiques avancés, ERP (SAP), méthodes agiles (Scrum).',
  'q-2-2': 'Communication, écoute active, capacité d\'adaptation, leadership collaboratif, résolution de conflits.',
  'q-2-3': 'Je souhaite développer mes compétences en data analysis et en management stratégique.',
  'q-2-4': 'Gestion de projet : 5/5, Communication : 4/5, Data analysis : 2/5, Management : 3/5.',
  'q-3-1': 'La variété des missions, le contact humain, et le sentiment d\'accomplissement quand un projet aboutit.',
  'q-3-2': 'L\'autonomie, le respect mutuel, l\'équilibre vie pro/perso, et l\'impact social de mon travail.',
  'q-3-3': 'Un environnement collaboratif, en mode hybride (2j télétravail), avec des projets stimulants et une hiérarchie bienveillante.',
  'q-3-4': 'Les missions de transformation organisationnelle et d\'accompagnement au changement.',
  'q-4-1': 'Je vise le métier de consultante en conduite du changement, dans le secteur du conseil ou en indépendante.',
  'q-4-2': 'Mes compétences en gestion de projet et ma capacité d\'écoute sont directement transférables. Ma motivation pour l\'accompagnement humain est un moteur fort.',
  'q-4-3': 'Le principal frein est le manque de certification en conduite du changement. Le réseau à construire dans le secteur du conseil est aussi un défi.',
  'q-4-4': 'Le marché du conseil en transformation est en croissance. Les entreprises recherchent de plus en plus des profils hybrides technique/humain.',
  'q-5-1': 'M1 : S\'inscrire à la certification PROSCI. M2 : Participer à 3 événements réseau du secteur. M3 : Contacter 10 cabinets de conseil pour des entretiens exploratoires.',
  'q-5-2': 'Certification PROSCI en conduite du changement (finançable CPF), et un MOOC en data visualization.',
  'q-5-3': 'Je vais rejoindre l\'AFITEP et le réseau des Alumni de ma licence pro. Je compte aussi activer mon réseau LinkedIn.',
  'q-5-4': 'CPF pour la certification PROSCI (3 200 €). La formation MOOC sera autofinancée.',
  'q-6-1': 'Mon projet est de devenir consultante en conduite du changement, en combinant mes compétences en gestion de projet avec ma passion pour l\'accompagnement humain.',
  'q-6-2': '1) Mes compétences sont plus transférables que je ne le pensais. 2) Le réseau est un levier majeur. 3) Ma capacité d\'adaptation est ma plus grande force.',
  'q-6-3': 'Je suis confiante et motivée. Le bilan m\'a permis de clarifier mon projet et de structurer un plan d\'action concret.',
  'q-6-4': 'J\'aimerais approfondir la partie financière de mon projet, notamment les aides à la création d\'activité indépendante.',
}

function makeResponse(
  beneficiaryId: string,
  questionId: string,
  phaseNumber: number,
  responseText: string | null,
  savedAt: string,
): PhaseResponse {
  return {
    id: `resp-${beneficiaryId.slice(-3)}-${questionId}`,
    beneficiary_id: beneficiaryId,
    question_id: questionId,
    response_text: responseText,
    phase_number: phaseNumber,
    phase_status: responseText ? 'en_cours' : 'libre',
    last_saved_at: savedAt,
    created_at: savedAt,
    updated_at: savedAt,
  }
}

// Alice (B1) — Toutes les phases complétées
const b1Responses: PhaseResponse[] = Object.entries(SAMPLE_RESPONSES).map(([qId, text]) => {
  const phase = Number(qId.split('-')[1])
  return makeResponse(BENEFICIAIRE_1_ID, qId, phase, text, '2026-02-15T10:00:00.000Z')
})

// Lucas (B2) — Phases 1-3 complètes, phase 4 partiellement remplie
const b2Responses: PhaseResponse[] = [
  // Phases 1-3 complètes
  ...Object.entries(SAMPLE_RESPONSES)
    .filter(([qId]) => {
      const phase = Number(qId.split('-')[1])
      return phase <= 3
    })
    .map(([qId, text]) => {
      const phase = Number(qId.split('-')[1])
      return makeResponse(BENEFICIAIRE_2_ID, qId, phase, text, '2026-03-01T10:00:00.000Z')
    }),
  // Phase 4 — 2 réponses sur 4
  makeResponse(BENEFICIAIRE_2_ID, 'q-4-1', 4, 'Je m\'oriente vers le secteur de la formation professionnelle.', '2026-03-20T11:00:00.000Z'),
  makeResponse(BENEFICIAIRE_2_ID, 'q-4-2', 4, 'Mon expérience en animation d\'ateliers est un atout direct.', '2026-03-20T11:15:00.000Z'),
]

// Emma (B3) — Phase 1 en cours, 2 réponses
const b3Responses: PhaseResponse[] = [
  makeResponse(BENEFICIAIRE_3_ID, 'q-1-1', 1, 'Après mon BTS Commerce, j\'ai travaillé 5 ans en grande distribution comme responsable de rayon.', '2026-03-22T09:30:00.000Z'),
  makeResponse(BENEFICIAIRE_3_ID, 'q-1-2', 1, 'Le management d\'équipe m\'a beaucoup apporté sur le plan humain.', '2026-03-22T09:45:00.000Z'),
]

// Camille (B5) — Phases 1-5 complètes, phase 6 en cours
const b5Responses: PhaseResponse[] = [
  ...Object.entries(SAMPLE_RESPONSES)
    .filter(([qId]) => {
      const phase = Number(qId.split('-')[1])
      return phase <= 5
    })
    .map(([qId, text]) => {
      const phase = Number(qId.split('-')[1])
      return makeResponse(BENEFICIAIRE_5_ID, qId, phase, text, '2026-03-01T10:00:00.000Z')
    }),
  // Phase 6 — 1 réponse sur 4
  makeResponse(BENEFICIAIRE_5_ID, 'q-6-1', 6, 'Mon projet est de créer un organisme de formation en soft skills.', '2026-03-19T14:30:00.000Z'),
]

export const simulationResponses: PhaseResponse[] = [
  ...b1Responses,
  ...b2Responses,
  ...b3Responses,
  ...b5Responses,
]

/** Retourne les réponses pour un bénéficiaire et une phase */
export function getResponsesForBeneficiaryPhase(
  beneficiaryId: string,
  phaseNumber: number,
): PhaseResponse[] {
  return simulationResponses.filter(
    (r) => r.beneficiary_id === beneficiaryId && r.phase_number === phaseNumber,
  )
}
