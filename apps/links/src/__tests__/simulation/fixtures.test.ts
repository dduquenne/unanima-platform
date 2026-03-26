import { describe, it, expect } from 'vitest'
import {
  simulationProfiles,
  getSimulationProfile,
  getBeneficiairesByConsultant,
  simulationPhaseValidations,
  getPhaseValidationsForBeneficiary,
  simulationQuestionnaires,
  simulationQuestions,
  getQuestionsForPhase,
  simulationResponses,
  getResponsesForBeneficiaryPhase,
  simulationSessions,
  getSessionsForBeneficiary,
  simulationSessionNotes,
  simulationDocuments,
  getDocumentsForPhase,
  getSimulationAdminStats,
  ADMIN_ID,
  CONSULTANT_1_ID,
  CONSULTANT_2_ID,
  BENEFICIAIRE_1_ID,
  BENEFICIAIRE_2_ID,
  BENEFICIAIRE_3_ID,
  BENEFICIAIRE_4_ID,
  BENEFICIAIRE_5_ID,
} from '@/lib/simulation/fixtures'

describe('Fixtures — Profils', () => {
  it('contient 8 profils (1 admin, 2 consultants, 5 bénéficiaires)', () => {
    expect(simulationProfiles).toHaveLength(8)
    expect(simulationProfiles.filter((p) => p.role === 'super_admin')).toHaveLength(1)
    expect(simulationProfiles.filter((p) => p.role === 'consultant')).toHaveLength(2)
    expect(simulationProfiles.filter((p) => p.role === 'beneficiaire')).toHaveLength(5)
  })

  it('retourne le bon profil par rôle', () => {
    expect(getSimulationProfile('super_admin').id).toBe(ADMIN_ID)
    expect(getSimulationProfile('consultant').id).toBe(CONSULTANT_1_ID)
    expect(getSimulationProfile('beneficiaire').id).toBe(BENEFICIAIRE_2_ID)
  })

  it('retourne les bénéficiaires assignés au consultant 1', () => {
    const beneficiaires = getBeneficiairesByConsultant(CONSULTANT_1_ID)
    expect(beneficiaires.length).toBe(3) // Alice, Lucas, Emma
    expect(beneficiaires.every((b) => b.consultant_id === CONSULTANT_1_ID)).toBe(true)
  })

  it('retourne les bénéficiaires assignés au consultant 2', () => {
    const beneficiaires = getBeneficiairesByConsultant(CONSULTANT_2_ID)
    expect(beneficiaires.length).toBe(2) // Thomas, Camille
  })

  it('tous les profils ont des UUIDs déterministes', () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    for (const p of simulationProfiles) {
      expect(p.id).toMatch(uuidRegex)
    }
  })
})

describe('Fixtures — Phase validations', () => {
  it('contient 30 validations (6 phases × 5 bénéficiaires)', () => {
    expect(simulationPhaseValidations).toHaveLength(30)
  })

  it('Alice (B1) a 6 phases validées', () => {
    const phases = getPhaseValidationsForBeneficiary(BENEFICIAIRE_1_ID)
    expect(phases).toHaveLength(6)
    expect(phases.every((p) => p.status === 'validee')).toBe(true)
  })

  it('Lucas (B2) a 3 validées, 1 en cours, 2 libres', () => {
    const phases = getPhaseValidationsForBeneficiary(BENEFICIAIRE_2_ID)
    expect(phases.filter((p) => p.status === 'validee')).toHaveLength(3)
    expect(phases.filter((p) => p.status === 'en_cours')).toHaveLength(1)
    expect(phases.filter((p) => p.status === 'libre')).toHaveLength(2)
  })

  it('Thomas (B4) a 6 phases libres (nouveau)', () => {
    const phases = getPhaseValidationsForBeneficiary(BENEFICIAIRE_4_ID)
    expect(phases).toHaveLength(6)
    expect(phases.every((p) => p.status === 'libre')).toBe(true)
  })
})

describe('Fixtures — Questionnaires et questions', () => {
  it('contient 6 questionnaires (1 par phase)', () => {
    expect(simulationQuestionnaires).toHaveLength(6)
  })

  it('contient 79 questions (12-15 par phase × 6 phases)', () => {
    expect(simulationQuestions).toHaveLength(79)
  })

  it('chaque phase a entre 12 et 15 questions', () => {
    const expectedCounts: Record<number, number> = { 1: 12, 2: 13, 3: 14, 4: 15, 5: 13, 6: 12 }
    for (let phase = 1; phase <= 6; phase++) {
      expect(getQuestionsForPhase(phase)).toHaveLength(expectedCounts[phase])
    }
  })
})

describe('Fixtures — Réponses', () => {
  it('Alice (B1) a des réponses pour les 6 phases', () => {
    for (let phase = 1; phase <= 6; phase++) {
      const responses = getResponsesForBeneficiaryPhase(BENEFICIAIRE_1_ID, phase)
      expect(responses.length).toBeGreaterThan(0)
    }
  })

  it('Thomas (B4) n\'a aucune réponse', () => {
    const allResponses = simulationResponses.filter(
      (r) => r.beneficiary_id === BENEFICIAIRE_4_ID,
    )
    expect(allResponses).toHaveLength(0)
  })

  it('Lucas (B2) a des réponses partielles pour la phase 4', () => {
    const responses = getResponsesForBeneficiaryPhase(BENEFICIAIRE_2_ID, 4)
    expect(responses.length).toBe(2) // 2 réponses sur 4
  })
})

describe('Fixtures — Sessions', () => {
  it('contient 30 sessions (6 par bénéficiaire)', () => {
    expect(simulationSessions).toHaveLength(30)
  })

  it('chaque bénéficiaire a 6 sessions', () => {
    for (const id of [BENEFICIAIRE_1_ID, BENEFICIAIRE_2_ID, BENEFICIAIRE_3_ID, BENEFICIAIRE_4_ID, BENEFICIAIRE_5_ID]) {
      expect(getSessionsForBeneficiary(id)).toHaveLength(6)
    }
  })

  it('contient des notes de session', () => {
    expect(simulationSessionNotes.length).toBeGreaterThan(0)
    // Notes for Alice and Lucas
    expect(simulationSessionNotes.filter((n) => n.beneficiary_id === BENEFICIAIRE_1_ID)).toHaveLength(3)
    expect(simulationSessionNotes.filter((n) => n.beneficiary_id === BENEFICIAIRE_2_ID)).toHaveLength(3)
  })
})

describe('Fixtures — Documents', () => {
  it('contient 7 documents (1-2 par phase)', () => {
    expect(simulationDocuments).toHaveLength(7)
  })

  it('chaque phase a au moins 1 document', () => {
    for (let phase = 1; phase <= 6; phase++) {
      expect(getDocumentsForPhase(phase).length).toBeGreaterThanOrEqual(1)
    }
  })

  it('les types de fichier sont valides (pdf ou docx)', () => {
    for (const doc of simulationDocuments) {
      expect(['pdf', 'docx']).toContain(doc.file_type)
    }
  })
})

describe('Fixtures — Stats admin', () => {
  it('calcule les KPIs correctement', () => {
    const stats = getSimulationAdminStats()
    expect(stats.activeBeneficiaires).toBe(5)
    expect(stats.activeConsultants).toBe(2)
    expect(stats.completedBilans).toBe(1) // Alice only
    expect(stats.averageProgress).toBeGreaterThan(0)
    expect(stats.beneficiaires).toHaveLength(5)
  })

  it('la progression d\'Alice est de 100%', () => {
    const stats = getSimulationAdminStats()
    const alice = stats.beneficiaires.find((b) => b.id === BENEFICIAIRE_1_ID)
    expect(alice?.progress).toBe(100)
  })

  it('la progression de Thomas est de 0%', () => {
    const stats = getSimulationAdminStats()
    const thomas = stats.beneficiaires.find((b) => b.id === BENEFICIAIRE_4_ID)
    expect(thomas?.progress).toBe(0)
  })
})
