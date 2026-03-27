// Helpers pour les mock handlers API en mode simulation
// Issue: #134, #135, #136 — Sprint 12

import { cookies } from 'next/headers'
import { getSimulationSession, SIMULATION_ROLE_COOKIE, DEFAULT_SIMULATION_ROLE } from './auth'
import type { SimulationRole } from './auth'

/**
 * Retourne l'utilisateur simulé à partir du cookie de rôle.
 * À utiliser dans les route handlers en mode simulation.
 */
export async function getSimulationUser() {
  const cookieStore = await cookies()
  const role = (cookieStore.get(SIMULATION_ROLE_COOKIE)?.value ?? DEFAULT_SIMULATION_ROLE) as SimulationRole
  const session = getSimulationSession(role)
  return {
    id: session.user.id,
    role: session.profile.role,
    profile: session.profile,
  }
}
