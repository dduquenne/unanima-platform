// Fixtures — Profils utilisateurs (3 rôles)
// Issue: #132 — Sprint 12

import type { Profile } from '@/lib/types/database'

// UUIDs déterministes
export const ADMIN_ID = '00000000-0000-4000-a000-000000000001'
export const CONSULTANT_1_ID = '00000000-0000-4000-a000-000000000010'
export const CONSULTANT_2_ID = '00000000-0000-4000-a000-000000000011'
export const BENEFICIAIRE_1_ID = '00000000-0000-4000-a000-000000000100'
export const BENEFICIAIRE_2_ID = '00000000-0000-4000-a000-000000000101'
export const BENEFICIAIRE_3_ID = '00000000-0000-4000-a000-000000000102'
export const BENEFICIAIRE_4_ID = '00000000-0000-4000-a000-000000000103'
export const BENEFICIAIRE_5_ID = '00000000-0000-4000-a000-000000000104'

export const simulationProfiles: Profile[] = [
  // ── Admin ──
  {
    id: ADMIN_ID,
    email: 'admin@links-demo.fr',
    full_name: 'Sophie Martin',
    role: 'super_admin',
    is_active: true,
    consultant_id: null,
    date_debut_bilan: null,
    date_fin_bilan: null,
    metadata: {},
    created_at: '2025-09-01T09:00:00.000Z',
    updated_at: '2026-03-20T14:00:00.000Z',
  },
  // ── Consultants ──
  {
    id: CONSULTANT_1_ID,
    email: 'marie.dupont@links-demo.fr',
    full_name: 'Marie Dupont',
    role: 'consultant',
    is_active: true,
    consultant_id: null,
    date_debut_bilan: null,
    date_fin_bilan: null,
    metadata: {},
    created_at: '2025-09-15T09:00:00.000Z',
    updated_at: '2026-03-18T10:00:00.000Z',
  },
  {
    id: CONSULTANT_2_ID,
    email: 'jean.bernard@links-demo.fr',
    full_name: 'Jean Bernard',
    role: 'consultant',
    is_active: true,
    consultant_id: null,
    date_debut_bilan: null,
    date_fin_bilan: null,
    metadata: {},
    created_at: '2025-10-01T09:00:00.000Z',
    updated_at: '2026-03-15T16:00:00.000Z',
  },
  // ── Bénéficiaires ──
  // #1 — Bilan terminé (6/6 phases validées)
  {
    id: BENEFICIAIRE_1_ID,
    email: 'alice.moreau@demo.fr',
    full_name: 'Alice Moreau',
    role: 'beneficiaire',
    is_active: true,
    consultant_id: CONSULTANT_1_ID,
    date_debut_bilan: '2025-10-01T00:00:00.000Z',
    date_fin_bilan: '2026-02-15T00:00:00.000Z',
    metadata: {},
    created_at: '2025-10-01T09:00:00.000Z',
    updated_at: '2026-02-15T17:00:00.000Z',
  },
  // #2 — Bilan en cours (3/6 phases validées)
  {
    id: BENEFICIAIRE_2_ID,
    email: 'lucas.petit@demo.fr',
    full_name: 'Lucas Petit',
    role: 'beneficiaire',
    is_active: true,
    consultant_id: CONSULTANT_1_ID,
    date_debut_bilan: '2026-01-15T00:00:00.000Z',
    date_fin_bilan: null,
    metadata: {},
    created_at: '2026-01-15T09:00:00.000Z',
    updated_at: '2026-03-20T11:00:00.000Z',
  },
  // #3 — Bilan en cours (1/6 phase en cours)
  {
    id: BENEFICIAIRE_3_ID,
    email: 'emma.garcia@demo.fr',
    full_name: 'Emma Garcia',
    role: 'beneficiaire',
    is_active: true,
    consultant_id: CONSULTANT_1_ID,
    date_debut_bilan: '2026-03-01T00:00:00.000Z',
    date_fin_bilan: null,
    metadata: {},
    created_at: '2026-03-01T09:00:00.000Z',
    updated_at: '2026-03-22T09:30:00.000Z',
  },
  // #4 — Nouveau (aucune phase commencée)
  {
    id: BENEFICIAIRE_4_ID,
    email: 'thomas.roux@demo.fr',
    full_name: 'Thomas Roux',
    role: 'beneficiaire',
    is_active: true,
    consultant_id: CONSULTANT_2_ID,
    date_debut_bilan: '2026-03-20T00:00:00.000Z',
    date_fin_bilan: null,
    metadata: {},
    created_at: '2026-03-20T09:00:00.000Z',
    updated_at: '2026-03-20T09:00:00.000Z',
  },
  // #5 — Bilan en cours (5/6 phases)
  {
    id: BENEFICIAIRE_5_ID,
    email: 'camille.leroy@demo.fr',
    full_name: 'Camille Leroy',
    role: 'beneficiaire',
    is_active: true,
    consultant_id: CONSULTANT_2_ID,
    date_debut_bilan: '2025-11-01T00:00:00.000Z',
    date_fin_bilan: null,
    metadata: {},
    created_at: '2025-11-01T09:00:00.000Z',
    updated_at: '2026-03-19T14:30:00.000Z',
  },
]

/** Retourne le profil simulation pour un rôle donné */
export function getSimulationProfile(role: 'beneficiaire' | 'consultant' | 'super_admin'): Profile {
  const admin = simulationProfiles.find((p) => p.role === 'super_admin')!
  const consultant = simulationProfiles.find((p) => p.role === 'consultant')!
  // Default: bénéficiaire en cours (#2 — Lucas Petit)
  const beneficiaire = simulationProfiles.find((p) => p.id === BENEFICIAIRE_2_ID)!

  if (role === 'super_admin') return admin
  if (role === 'consultant') return consultant
  return beneficiaire
}

/** Retourne tous les profils par rôle */
export function getProfilesByRole(role: string): Profile[] {
  return simulationProfiles.filter((p) => p.role === role)
}

/** Retourne les bénéficiaires assignés à un consultant */
export function getBeneficiairesByConsultant(consultantId: string): Profile[] {
  return simulationProfiles.filter(
    (p) => p.role === 'beneficiaire' && p.consultant_id === consultantId,
  )
}
