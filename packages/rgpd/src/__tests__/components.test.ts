import { describe, it, expect } from 'vitest'
import {
  LegalNotice,
  PrivacyPolicy,
  CookieBanner,
  exportUserData,
  deleteAccount,
  getAuditAccess,
  validateTableNames,
} from '../index'
import type { RGPDConfig } from '../index'

describe('RGPD exports', () => {
  it('exports LegalNotice component', () => {
    expect(typeof LegalNotice).toBe('function')
  })

  it('exports PrivacyPolicy component', () => {
    expect(typeof PrivacyPolicy).toBe('function')
  })

  it('exports CookieBanner component', () => {
    expect(typeof CookieBanner).toBe('function')
  })

  it('exports exportUserData function', () => {
    expect(typeof exportUserData).toBe('function')
  })

  it('exports deleteAccount function', () => {
    expect(typeof deleteAccount).toBe('function')
  })

  it('exports getAuditAccess function', () => {
    expect(typeof getAuditAccess).toBe('function')
  })

  it('exports validateTableNames function', () => {
    expect(typeof validateTableNames).toBe('function')
  })
})

describe('RGPDConfig type', () => {
  it('can be instantiated with valid data', () => {
    const config: RGPDConfig = {
      organizationName: 'Unanima',
      organizationAddress: '123 Rue Test',
      dpoEmail: 'dpo@unanima.fr',
      dataFinalites: ['Gestion des bilans', 'Suivi des bénéficiaires'],
      dataRetentionDays: 365,
      hostingLocation: 'France',
    }

    expect(config.organizationName).toBe('Unanima')
    expect(config.dataFinalites).toHaveLength(2)
    expect(config.dataRetentionDays).toBe(365)
  })

  it('allows optional dpoEmail', () => {
    const config: RGPDConfig = {
      organizationName: 'Test',
      organizationAddress: '1 Rue',
      dataFinalites: ['Test'],
      dataRetentionDays: 30,
      hostingLocation: 'EU',
    }

    expect(config.dpoEmail).toBeUndefined()
  })
})
