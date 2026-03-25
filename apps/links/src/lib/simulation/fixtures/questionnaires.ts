// Fixtures — Questionnaires et questions par phase
// Issue: #132 — Sprint 12

import type { Questionnaire, Question } from '@/lib/types/database'

const PHASE_TITLES: Record<number, string> = {
  1: 'Analyse du parcours professionnel',
  2: 'Identification des compétences',
  3: 'Exploration des motivations',
  4: 'Définition du projet professionnel',
  5: 'Élaboration du plan d\'action',
  6: 'Synthèse et conclusion',
}

const PHASE_QUESTIONS: Record<number, string[]> = {
  1: [
    'Décrivez votre parcours professionnel depuis votre premier emploi.',
    'Quels sont les postes qui vous ont le plus marqué(e) et pourquoi ?',
    'Quelles formations avez-vous suivies au cours de votre carrière ?',
    'Quels ont été les moments clés (réussites, difficultés) de votre parcours ?',
  ],
  2: [
    'Listez vos compétences techniques principales.',
    'Quelles sont vos compétences relationnelles (soft skills) ?',
    'Quelles compétences souhaitez-vous développer ?',
    'Comment évaluez-vous votre niveau dans vos compétences clés (1 à 5) ?',
  ],
  3: [
    'Qu\'est-ce qui vous motive dans votre travail au quotidien ?',
    'Quelles sont vos valeurs professionnelles non négociables ?',
    'Décrivez votre environnement de travail idéal.',
    'Quels types de missions vous passionnent ?',
  ],
  4: [
    'Quel(s) métier(s) ou secteur(s) avez-vous identifié(s) comme cible(s) ?',
    'Comment ce projet s\'aligne-t-il avec vos compétences et motivations ?',
    'Avez-vous identifié des freins ou obstacles à ce projet ?',
    'Quelles sont les opportunités du marché pour ce projet ?',
  ],
  5: [
    'Quelles actions concrètes allez-vous mettre en place dans les 3 prochains mois ?',
    'Quelles formations ou certifications envisagez-vous ?',
    'Quel réseau professionnel allez-vous mobiliser ?',
    'Comment allez-vous financer votre transition (CPF, entreprise, autre) ?',
  ],
  6: [
    'Résumez votre projet professionnel en quelques phrases.',
    'Quels sont les 3 apprentissages majeurs de ce bilan ?',
    'Comment vous sentez-vous par rapport à votre avenir professionnel ?',
    'Y a-t-il des points que vous souhaitez approfondir après le bilan ?',
  ],
}

export const simulationQuestionnaires: Questionnaire[] = Object.entries(PHASE_TITLES).map(
  ([phase, title]) => ({
    id: `q-phase-${phase}`,
    phase_number: Number(phase),
    title,
    description: `Questionnaire de la phase ${phase} du bilan de compétences.`,
    sort_order: Number(phase),
    created_at: '2025-09-01T09:00:00.000Z',
  }),
)

export const simulationQuestions: Question[] = Object.entries(PHASE_QUESTIONS).flatMap(
  ([phase, questions]) =>
    questions.map((text, idx) => ({
      id: `q-${phase}-${idx + 1}`,
      questionnaire_id: `q-phase-${phase}`,
      text,
      sort_order: idx + 1,
      created_at: '2025-09-01T09:00:00.000Z',
    })),
)

/** Retourne les questionnaires pour une phase donnée */
export function getQuestionnairesByPhase(phaseNumber: number): Questionnaire[] {
  return simulationQuestionnaires.filter((q) => q.phase_number === phaseNumber)
}

/** Retourne les questions pour un questionnaire */
export function getQuestionsForQuestionnaire(questionnaireId: string): Question[] {
  return simulationQuestions.filter((q) => q.questionnaire_id === questionnaireId)
}

/** Retourne les questions pour une phase */
export function getQuestionsForPhase(phaseNumber: number): Question[] {
  return simulationQuestions.filter((q) => q.questionnaire_id === `q-phase-${phaseNumber}`)
}
