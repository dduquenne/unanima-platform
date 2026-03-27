// Fixtures — Phase validations par bénéficiaire
// Issue: #132 — Sprint 12

import type { PhaseValidation, PhaseStatus } from '@/lib/types/database'
import {
  BENEFICIAIRE_1_ID,
  BENEFICIAIRE_2_ID,
  BENEFICIAIRE_3_ID,
  BENEFICIAIRE_4_ID,
  BENEFICIAIRE_5_ID,
} from './profiles'

function makeValidation(
  beneficiaryId: string,
  phaseNumber: number,
  status: PhaseStatus,
  validatedAt: string | null = null,
): PhaseValidation {
  return {
    id: `pv-${beneficiaryId.slice(-3)}-${phaseNumber}`,
    beneficiary_id: beneficiaryId,
    phase_number: phaseNumber,
    status,
    validated_at: validatedAt,
    created_at: '2025-10-01T09:00:00.000Z',
    updated_at: validatedAt ?? '2026-03-20T09:00:00.000Z',
  }
}

// Bénéficiaire 1 — Alice Moreau — Bilan terminé (6/6)
const b1Phases: PhaseValidation[] = [1, 2, 3, 4, 5, 6].map((n) =>
  makeValidation(BENEFICIAIRE_1_ID, n, 'validee', `2026-0${n < 7 ? n + 1 : 6}-15T10:00:00.000Z`),
)

// Bénéficiaire 2 — Lucas Petit — 3 validées, 1 en cours, 2 libres
const b2Phases: PhaseValidation[] = [
  makeValidation(BENEFICIAIRE_2_ID, 1, 'validee', '2026-01-25T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_2_ID, 2, 'validee', '2026-02-10T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_2_ID, 3, 'validee', '2026-03-01T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_2_ID, 4, 'en_cours'),
  makeValidation(BENEFICIAIRE_2_ID, 5, 'libre'),
  makeValidation(BENEFICIAIRE_2_ID, 6, 'libre'),
]

// Bénéficiaire 3 — Emma Garcia — 1 en cours, 5 libres
const b3Phases: PhaseValidation[] = [
  makeValidation(BENEFICIAIRE_3_ID, 1, 'en_cours'),
  makeValidation(BENEFICIAIRE_3_ID, 2, 'libre'),
  makeValidation(BENEFICIAIRE_3_ID, 3, 'libre'),
  makeValidation(BENEFICIAIRE_3_ID, 4, 'libre'),
  makeValidation(BENEFICIAIRE_3_ID, 5, 'libre'),
  makeValidation(BENEFICIAIRE_3_ID, 6, 'libre'),
]

// Bénéficiaire 4 — Thomas Roux — Nouveau (6 libres)
const b4Phases: PhaseValidation[] = [1, 2, 3, 4, 5, 6].map((n) =>
  makeValidation(BENEFICIAIRE_4_ID, n, 'libre'),
)

// Bénéficiaire 5 — Camille Leroy — 5 validées, 1 en cours
const b5Phases: PhaseValidation[] = [
  makeValidation(BENEFICIAIRE_5_ID, 1, 'validee', '2025-11-20T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_5_ID, 2, 'validee', '2025-12-10T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_5_ID, 3, 'validee', '2026-01-05T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_5_ID, 4, 'validee', '2026-02-01T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_5_ID, 5, 'validee', '2026-03-01T10:00:00.000Z'),
  makeValidation(BENEFICIAIRE_5_ID, 6, 'en_cours'),
]

export const simulationPhaseValidations: PhaseValidation[] = [
  ...b1Phases,
  ...b2Phases,
  ...b3Phases,
  ...b4Phases,
  ...b5Phases,
]

/** Retourne les validations de phase pour un bénéficiaire */
export function getPhaseValidationsForBeneficiary(beneficiaryId: string): PhaseValidation[] {
  return simulationPhaseValidations.filter((pv) => pv.beneficiary_id === beneficiaryId)
}
