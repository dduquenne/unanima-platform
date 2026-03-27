import { describe, it, expect } from 'vitest'
import {
  getSimulationSession,
  SIMULATION_ROLE_COOKIE,
  DEFAULT_SIMULATION_ROLE,
} from '@/lib/simulation/auth'
import type { SimulationRole } from '@/lib/simulation/auth'

describe('getSimulationSession', () => {
  it('retourne une session pour le rôle beneficiaire', () => {
    const session = getSimulationSession('beneficiaire')
    expect(session.user.id).toBeDefined()
    expect(session.profile.role).toBe('beneficiaire')
    expect(session.user.user_metadata.role).toBe('beneficiaire')
  })

  it('retourne une session pour le rôle consultant', () => {
    const session = getSimulationSession('consultant')
    expect(session.profile.role).toBe('consultant')
    expect(session.user.email).toContain('@links-demo.fr')
  })

  it('retourne une session pour le rôle super_admin', () => {
    const session = getSimulationSession('super_admin')
    expect(session.profile.role).toBe('super_admin')
    expect(session.profile.full_name).toBeTruthy()
  })

  it('le user.id correspond au profile.id', () => {
    const roles: SimulationRole[] = ['beneficiaire', 'consultant', 'super_admin']
    for (const role of roles) {
      const session = getSimulationSession(role)
      expect(session.user.id).toBe(session.profile.id)
    }
  })
})

describe('Constants', () => {
  it('SIMULATION_ROLE_COOKIE est défini', () => {
    expect(SIMULATION_ROLE_COOKIE).toBe('simulation-role')
  })

  it('DEFAULT_SIMULATION_ROLE est beneficiaire', () => {
    expect(DEFAULT_SIMULATION_ROLE).toBe('beneficiaire')
  })
})
