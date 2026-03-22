import { describe, it, expect } from 'vitest'
import { cn, formatDate, validateEmail } from '../index'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })
})

describe('formatDate', () => {
  it('formats a date', () => {
    const result = formatDate(new Date('2024-01-15'))
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats a date string', () => {
    const result = formatDate('2024-06-01')
    expect(result).toContain('2024')
  })

  it('returns "Date invalide" for invalid string', () => {
    expect(formatDate('not-a-date')).toBe('Date invalide')
  })

  it('returns "Date invalide" for invalid Date object', () => {
    expect(formatDate(new Date('invalid'))).toBe('Date invalide')
  })

  it('returns "Date invalide" for empty string', () => {
    expect(formatDate('')).toBe('Date invalide')
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
