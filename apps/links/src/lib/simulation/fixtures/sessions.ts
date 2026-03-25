// Fixtures — Sessions de suivi
// Issue: #132 — Sprint 12

import type { Session, SessionNote } from '@/lib/types/database'
import {
  BENEFICIAIRE_1_ID,
  BENEFICIAIRE_2_ID,
  BENEFICIAIRE_3_ID,
  BENEFICIAIRE_4_ID,
  BENEFICIAIRE_5_ID,
  CONSULTANT_1_ID,
  CONSULTANT_2_ID,
} from './profiles'

function makeSession(
  beneficiaryId: string,
  sessionNumber: number,
  scheduledAt: string | null,
): Session {
  return {
    id: `sess-${beneficiaryId.slice(-3)}-${sessionNumber}`,
    beneficiary_id: beneficiaryId,
    session_number: sessionNumber,
    scheduled_at: scheduledAt,
    visio_url: scheduledAt ? `https://meet.links-demo.fr/session-${beneficiaryId.slice(-3)}-${sessionNumber}` : null,
    created_at: '2025-10-01T09:00:00.000Z',
    updated_at: scheduledAt ?? '2025-10-01T09:00:00.000Z',
  }
}

// Alice (B1) — 6 sessions passées
const b1Sessions = [
  makeSession(BENEFICIAIRE_1_ID, 1, '2025-10-10T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_1_ID, 2, '2025-10-31T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_1_ID, 3, '2025-11-21T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_1_ID, 4, '2025-12-12T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_1_ID, 5, '2026-01-16T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_1_ID, 6, '2026-02-13T14:00:00.000Z'),
]

// Lucas (B2) — 3 passées, 1 à venir, 2 non planifiées
const b2Sessions = [
  makeSession(BENEFICIAIRE_2_ID, 1, '2026-01-25T10:00:00.000Z'),
  makeSession(BENEFICIAIRE_2_ID, 2, '2026-02-15T10:00:00.000Z'),
  makeSession(BENEFICIAIRE_2_ID, 3, '2026-03-08T10:00:00.000Z'),
  makeSession(BENEFICIAIRE_2_ID, 4, '2026-04-05T10:00:00.000Z'),
  makeSession(BENEFICIAIRE_2_ID, 5, null),
  makeSession(BENEFICIAIRE_2_ID, 6, null),
]

// Emma (B3) — 1 passée, 1 à venir, 4 non planifiées
const b3Sessions = [
  makeSession(BENEFICIAIRE_3_ID, 1, '2026-03-10T09:00:00.000Z'),
  makeSession(BENEFICIAIRE_3_ID, 2, '2026-04-10T09:00:00.000Z'),
  makeSession(BENEFICIAIRE_3_ID, 3, null),
  makeSession(BENEFICIAIRE_3_ID, 4, null),
  makeSession(BENEFICIAIRE_3_ID, 5, null),
  makeSession(BENEFICIAIRE_3_ID, 6, null),
]

// Thomas (B4) — 1 à venir, 5 non planifiées
const b4Sessions = [
  makeSession(BENEFICIAIRE_4_ID, 1, '2026-04-01T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_4_ID, 2, null),
  makeSession(BENEFICIAIRE_4_ID, 3, null),
  makeSession(BENEFICIAIRE_4_ID, 4, null),
  makeSession(BENEFICIAIRE_4_ID, 5, null),
  makeSession(BENEFICIAIRE_4_ID, 6, null),
]

// Camille (B5) — 5 passées, 1 à venir
const b5Sessions = [
  makeSession(BENEFICIAIRE_5_ID, 1, '2025-11-15T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_5_ID, 2, '2025-12-13T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_5_ID, 3, '2026-01-10T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_5_ID, 4, '2026-02-07T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_5_ID, 5, '2026-03-07T14:00:00.000Z'),
  makeSession(BENEFICIAIRE_5_ID, 6, '2026-04-04T14:00:00.000Z'),
]

export const simulationSessions: Session[] = [
  ...b1Sessions,
  ...b2Sessions,
  ...b3Sessions,
  ...b4Sessions,
  ...b5Sessions,
]

/** Retourne les sessions pour un bénéficiaire */
export function getSessionsForBeneficiary(beneficiaryId: string): Session[] {
  return simulationSessions.filter((s) => s.beneficiary_id === beneficiaryId)
}

// ── Notes de session (confidentielles — consultant only) ──

const SAMPLE_NOTES: Record<string, string> = {
  'note-100-1': 'Première séance d\'accueil. Alice est très motivée et a une vision claire de sa situation. Parcours riche en gestion de projet. Points à approfondir : motivations profondes et compétences transversales.',
  'note-100-2': 'Travail approfondi sur les compétences. Alice a identifié un fort intérêt pour l\'accompagnement au changement. Excellente capacité d\'auto-analyse.',
  'note-100-3': 'Exploration des motivations. Les valeurs d\'autonomie et d\'impact social sont prédominantes. Environnement idéal : conseil/indépendant.',
  'note-101-1': 'Lucas est en reconversion après 8 ans dans la grande distribution. Bonne énergie mais manque de confiance en ses compétences transférables.',
  'note-101-2': 'Identification de compétences solides en management opérationnel et en animation d\'équipe. À creuser : piste de la formation professionnelle.',
  'note-101-3': 'Lucas a trouvé sa voie : la formation professionnelle. Son expérience terrain est un vrai atout. Plan d\'action à construire.',
}

export const simulationSessionNotes: SessionNote[] = [
  // Alice — 3 notes (consultant 1)
  {
    id: 'note-100-1',
    beneficiary_id: BENEFICIAIRE_1_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 1,
    content: SAMPLE_NOTES['note-100-1'],
    max_length: 5000,
    created_at: '2025-10-10T16:00:00.000Z',
    updated_at: '2025-10-10T16:00:00.000Z',
  },
  {
    id: 'note-100-2',
    beneficiary_id: BENEFICIAIRE_1_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 2,
    content: SAMPLE_NOTES['note-100-2'],
    max_length: 5000,
    created_at: '2025-10-31T16:00:00.000Z',
    updated_at: '2025-10-31T16:00:00.000Z',
  },
  {
    id: 'note-100-3',
    beneficiary_id: BENEFICIAIRE_1_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 3,
    content: SAMPLE_NOTES['note-100-3'],
    max_length: 5000,
    created_at: '2025-11-21T16:00:00.000Z',
    updated_at: '2025-11-21T16:00:00.000Z',
  },
  // Lucas — 3 notes (consultant 1)
  {
    id: 'note-101-1',
    beneficiary_id: BENEFICIAIRE_2_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 1,
    content: SAMPLE_NOTES['note-101-1'],
    max_length: 5000,
    created_at: '2026-01-25T12:00:00.000Z',
    updated_at: '2026-01-25T12:00:00.000Z',
  },
  {
    id: 'note-101-2',
    beneficiary_id: BENEFICIAIRE_2_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 2,
    content: SAMPLE_NOTES['note-101-2'],
    max_length: 5000,
    created_at: '2026-02-15T12:00:00.000Z',
    updated_at: '2026-02-15T12:00:00.000Z',
  },
  {
    id: 'note-101-3',
    beneficiary_id: BENEFICIAIRE_2_ID,
    consultant_id: CONSULTANT_1_ID,
    session_number: 3,
    content: SAMPLE_NOTES['note-101-3'],
    max_length: 5000,
    created_at: '2026-03-08T12:00:00.000Z',
    updated_at: '2026-03-08T12:00:00.000Z',
  },
]

/** Retourne les notes de session pour un bénéficiaire */
export function getSessionNotesForBeneficiary(beneficiaryId: string): SessionNote[] {
  return simulationSessionNotes.filter((n) => n.beneficiary_id === beneficiaryId)
}
