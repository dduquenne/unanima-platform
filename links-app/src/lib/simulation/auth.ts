// Auth bypass pour le mode simulation
// Issue: #133 — Sprint 12

import type { Profile } from '@/lib/types/database'
import { getSimulationProfile } from './fixtures'

export type SimulationRole = 'beneficiaire' | 'consultant' | 'super_admin'

/**
 * Retourne un objet session fictif pour le rôle donné.
 * Utilisé par le middleware et les route handlers en mode simulation.
 */
export function getSimulationSession(role: SimulationRole): {
  user: { id: string; email: string; user_metadata: { full_name: string; role: string } }
  profile: Profile
} {
  const profile = getSimulationProfile(role)
  return {
    user: {
      id: profile.id,
      email: profile.email,
      user_metadata: {
        full_name: profile.full_name,
        role: profile.role,
      },
    },
    profile,
  }
}

/** Nom du cookie stockant le rôle simulation */
export const SIMULATION_ROLE_COOKIE = 'simulation-role'

/** Rôle par défaut en mode simulation */
export const DEFAULT_SIMULATION_ROLE: SimulationRole = 'beneficiaire'
