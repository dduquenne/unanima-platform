// Tests — Password strength & validation
// Issue: #110 — Sprint 9 : Reset MDP

import { describe, it, expect } from 'vitest'

// Replicate the password logic from reset-password page
type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): { strength: PasswordStrength; label: string } {
  if (password.length < 8) return { strength: 'weak', label: 'Faible' }
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (hasUpper && hasDigit && hasSpecial && password.length >= 12) {
    return { strength: 'strong', label: 'Fort' }
  }
  if (hasUpper && hasDigit) {
    return { strength: 'medium', label: 'Moyen' }
  }
  return { strength: 'weak', label: 'Faible' }
}

function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/

describe('Password strength indicator', () => {
  it('weak: too short', () => {
    expect(getPasswordStrength('Ab1').strength).toBe('weak')
  })

  it('weak: no uppercase or digit', () => {
    expect(getPasswordStrength('abcdefgh').strength).toBe('weak')
  })

  it('medium: 8+ chars with uppercase and digit', () => {
    expect(getPasswordStrength('Abcdef1g').strength).toBe('medium')
  })

  it('strong: 12+ chars with uppercase, digit and special', () => {
    expect(getPasswordStrength('Abcdef1g!@xyz').strength).toBe('strong')
  })

  it('weak: missing digit with long password', () => {
    expect(getPasswordStrength('Abcdefghij').strength).toBe('weak')
  })
})

describe('Password validation', () => {
  it('valid: meets all criteria', () => {
    expect(isPasswordValid('Password1')).toBe(true)
    expect(PASSWORD_REGEX.test('Password1')).toBe(true)
  })

  it('invalid: too short', () => {
    expect(isPasswordValid('Pass1')).toBe(false)
    expect(PASSWORD_REGEX.test('Pass1')).toBe(false)
  })

  it('invalid: no uppercase', () => {
    expect(isPasswordValid('password1')).toBe(false)
    expect(PASSWORD_REGEX.test('password1')).toBe(false)
  })

  it('invalid: no digit', () => {
    expect(isPasswordValid('Passwordd')).toBe(false)
    expect(PASSWORD_REGEX.test('Passwordd')).toBe(false)
  })

  it('valid: complex password', () => {
    expect(isPasswordValid('MyP@ssw0rd!23')).toBe(true)
    expect(PASSWORD_REGEX.test('MyP@ssw0rd!23')).toBe(true)
  })
})
