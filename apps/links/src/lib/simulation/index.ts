// Module simulation — barrel export
// Issue: #131, #132 — Sprint 12

export { isSimulationMode } from './config'
export { getSimulationSession, SIMULATION_ROLE_COOKIE, DEFAULT_SIMULATION_ROLE } from './auth'
export type { SimulationRole } from './auth'
export { SimulationAuthProvider } from './simulation-auth-provider'
export * from './fixtures'
