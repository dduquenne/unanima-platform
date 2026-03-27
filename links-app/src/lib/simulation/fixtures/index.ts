// Fixtures — barrel export
// Issue: #132 — Sprint 12

export {
  simulationProfiles,
  getSimulationProfile,
  getProfilesByRole,
  getBeneficiairesByConsultant,
  ADMIN_ID,
  CONSULTANT_1_ID,
  CONSULTANT_2_ID,
  BENEFICIAIRE_1_ID,
  BENEFICIAIRE_2_ID,
  BENEFICIAIRE_3_ID,
  BENEFICIAIRE_4_ID,
  BENEFICIAIRE_5_ID,
} from './profiles'

export {
  simulationPhaseValidations,
  getPhaseValidationsForBeneficiary,
} from './phases'

export {
  simulationQuestionnaires,
  simulationQuestions,
  getQuestionnairesByPhase,
  getQuestionsForQuestionnaire,
  getQuestionsForPhase,
} from './questionnaires'

export {
  simulationResponses,
  getResponsesForBeneficiaryPhase,
} from './responses'

export {
  simulationSessions,
  getSessionsForBeneficiary,
  simulationSessionNotes,
  getSessionNotesForBeneficiary,
} from './sessions'

export {
  simulationDocuments,
  getDocumentsForPhase,
} from './documents'

export {
  getSimulationAdminStats,
} from './stats'
