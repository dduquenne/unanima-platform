import { describe, it, expect } from 'vitest'
import { cn, formatDate, validateEmail } from '../index'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })
})

describe('formatDate', () => {
  it('formats a date', () => {
    const result = formatDate(new Date('2024-01-15'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('user.name@domain.fr')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('')).toBe(false)
  })
})
