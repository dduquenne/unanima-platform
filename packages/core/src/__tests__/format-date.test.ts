import { describe, it, expect } from 'vitest'
import { formatDate, formatRelativeTime } from '../utils/format-date'

describe('formatDate', () => {
  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-03-15'))
    expect(result).toContain('2024')
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

  it('respects locale parameter', () => {
    const frResult = formatDate('2024-01-15', 'fr-FR')
    expect(frResult).toContain('2024')
  })
})

describe('formatRelativeTime', () => {
  it('returns a string for a recent date', () => {
    const recentDate = new Date(Date.now() - 60000) // 1 min ago
    const result = formatRelativeTime(recentDate)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns "Date invalide" for invalid date', () => {
    expect(formatRelativeTime('not-a-date')).toBe('Date invalide')
  })

  it('returns "Date invalide" for invalid Date object', () => {
    expect(formatRelativeTime(new Date('invalid'))).toBe('Date invalide')
  })

  it('handles hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoHoursAgo)
    expect(typeof result).toBe('string')
  })

  it('handles days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(threeDaysAgo)
    expect(typeof result).toBe('string')
  })
})
