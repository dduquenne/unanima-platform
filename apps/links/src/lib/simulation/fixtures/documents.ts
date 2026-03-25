// Fixtures — Documents de phase (PDF/DOCX fictifs)
// Issue: #132 — Sprint 12

import type { PhaseDocument } from '@/lib/types/database'
import { ADMIN_ID } from './profiles'

export const simulationDocuments: PhaseDocument[] = [
  {
    id: 'doc-p1-guide',
    phase_number: 1,
    filename: 'guide-phase-1.pdf',
    storage_path: 'simulation/guide-phase-1.pdf',
    display_name: 'Guide Phase 1 — Analyse du parcours',
    file_type: 'pdf',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p1-fiche',
    phase_number: 1,
    filename: 'fiche-parcours.docx',
    storage_path: 'simulation/fiche-parcours.docx',
    display_name: 'Fiche de parcours professionnel',
    file_type: 'docx',
    sort_order: 2,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p2-grille',
    phase_number: 2,
    filename: 'grille-competences.pdf',
    storage_path: 'simulation/grille-competences.pdf',
    display_name: 'Grille d\'évaluation des compétences',
    file_type: 'pdf',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p3-valeurs',
    phase_number: 3,
    filename: 'test-valeurs.pdf',
    storage_path: 'simulation/test-valeurs.pdf',
    display_name: 'Test de valeurs professionnelles',
    file_type: 'pdf',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p4-fiche-metier',
    phase_number: 4,
    filename: 'fiche-metier-cible.docx',
    storage_path: 'simulation/fiche-metier-cible.docx',
    display_name: 'Fiche métier cible',
    file_type: 'docx',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p5-plan',
    phase_number: 5,
    filename: 'plan-action-template.pdf',
    storage_path: 'simulation/plan-action-template.pdf',
    display_name: 'Template plan d\'action',
    file_type: 'pdf',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
  {
    id: 'doc-p6-synthese',
    phase_number: 6,
    filename: 'synthese-bilan-template.pdf',
    storage_path: 'simulation/synthese-bilan-template.pdf',
    display_name: 'Template de synthèse du bilan',
    file_type: 'pdf',
    sort_order: 1,
    uploaded_by: ADMIN_ID,
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2025-09-15T09:00:00.000Z',
  },
]

/** Retourne les documents pour une phase donnée */
export function getDocumentsForPhase(phaseNumber: number): PhaseDocument[] {
  return simulationDocuments.filter((d) => d.phase_number === phaseNumber)
}
