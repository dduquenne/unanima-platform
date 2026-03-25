// Configuration du mode simulation
// Issue: #131 — Sprint 12

/**
 * Retourne `true` si le mode simulation est activé.
 * Fonctionne côté client ET serveur (variable NEXT_PUBLIC_*).
 */
export function isSimulationMode(): boolean {
  return process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true'
}
