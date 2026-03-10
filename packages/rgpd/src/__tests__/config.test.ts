import { describe, it, expect } from 'vitest'
import type { RGPDConfig } from '../config'

describe('RGPDConfig type', () => {
  it('accepts a valid config', () => {
    const config: RGPDConfig = {
      organizationName: 'Test Org',
      organizationAddress: '1 rue de la Paix, Paris',
      dpoEmail: 'dpo@test.org',
      dataFinalites: ['Gestion des utilisateurs', 'Suivi des parcours'],
      dataRetentionDays: 365,
      hostingLocation: 'Union européenne',
    }
    expect(config.organizationName).toBe('Test Org')
    expect(config.dataFinalites).toHaveLength(2)
    expect(config.dataRetentionDays).toBe(365)
  })
})
