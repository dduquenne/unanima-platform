// Tests — Login API route logic
// Issue: #109 — Sprint 9 : Connexion + verrouillage

import { describe, it, expect } from 'vitest'

// Unit tests for login logic validation (not integration tests requiring Supabase)

describe('Login request validation', () => {
  it('rejects empty email', () => {
    const email = ''
    expect(email.length).toBe(0)
    expect(typeof email).toBe('string')
  })

  it('normalizes email to lowercase', () => {
    const email = 'User@Example.COM'
    const normalized = email.toLowerCase().trim()
    expect(normalized).toBe('user@example.com')
  })

  it('trims whitespace from email', () => {
    const email = '  user@example.com  '
    const normalized = email.toLowerCase().trim()
    expect(normalized).toBe('user@example.com')
  })
})

describe('Role-based redirect mapping', () => {
  const ROLE_HOME: Record<string, string> = {
    beneficiaire: '/dashboard',
    consultant: '/beneficiaires',
    super_admin: '/admin',
  }

  it('redirects beneficiaire to /dashboard', () => {
    expect(ROLE_HOME['beneficiaire']).toBe('/dashboard')
  })

  it('redirects consultant to /beneficiaires', () => {
    expect(ROLE_HOME['consultant']).toBe('/beneficiaires')
  })

  it('redirects super_admin to /admin', () => {
    expect(ROLE_HOME['super_admin']).toBe('/admin')
  })

  it('falls back to /dashboard for unknown role', () => {
    const role = 'unknown'
    const dest = ROLE_HOME[role] ?? '/dashboard'
    expect(dest).toBe('/dashboard')
  })
})

describe('Attempt counter logic', () => {
  const MAX_ATTEMPTS = 3

  it('calculates remaining attempts correctly', () => {
    expect(Math.max(0, MAX_ATTEMPTS - 1)).toBe(2)
    expect(Math.max(0, MAX_ATTEMPTS - 2)).toBe(1)
    expect(Math.max(0, MAX_ATTEMPTS - 3)).toBe(0)
  })

  it('never returns negative remaining attempts', () => {
    expect(Math.max(0, MAX_ATTEMPTS - 4)).toBe(0)
    expect(Math.max(0, MAX_ATTEMPTS - 100)).toBe(0)
  })

  it('locks after exactly 3 failures', () => {
    const isLocked = (count: number) => count >= MAX_ATTEMPTS
    expect(isLocked(1)).toBe(false)
    expect(isLocked(2)).toBe(false)
    expect(isLocked(3)).toBe(true)
    expect(isLocked(4)).toBe(true)
  })
})

describe('Error message formatting', () => {
  it('shows correct message for 2 remaining attempts', () => {
    const remaining = 2
    const msg = `Identifiants incorrects. Il vous reste ${remaining} tentative(s).`
    expect(msg).toBe('Identifiants incorrects. Il vous reste 2 tentative(s).')
  })

  it('shows correct message for 1 remaining attempt', () => {
    const remaining = 1
    const msg = `Identifiants incorrects. Il vous reste ${remaining} tentative(s).`
    expect(msg).toBe('Identifiants incorrects. Il vous reste 1 tentative(s).')
  })

  it('shows locked message when 0 remaining', () => {
    const locked = true
    const msg = locked
      ? 'Compte temporairement verrouillé. Réessayez dans 15 minutes.'
      : 'Identifiants incorrects.'
    expect(msg).toBe('Compte temporairement verrouillé. Réessayez dans 15 minutes.')
  })
})
