// Tests — Session planning logic
// Issue: #113 — Sprint 9 : Planning séances bénéficiaire

import { describe, it, expect } from 'vitest'

interface SessionData {
  session_number: number
  scheduled_at: string | null
  visio_url: string | null
}

type SessionStatus = 'realisee' | 'a_venir' | 'a_planifier'

function getSessionStatus(session: SessionData): SessionStatus {
  if (!session.scheduled_at) return 'a_planifier'
  return new Date(session.scheduled_at) < new Date() ? 'realisee' : 'a_venir'
}

function getNextSession(sessions: SessionData[]): SessionData | null {
  const now = new Date()
  const upcoming = sessions
    .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > now)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
  return upcoming[0] ?? null
}

describe('getSessionStatus', () => {
  it('returns a_planifier when no date', () => {
    expect(getSessionStatus({ session_number: 1, scheduled_at: null, visio_url: null }))
      .toBe('a_planifier')
  })

  it('returns realisee when date is in the past', () => {
    expect(getSessionStatus({
      session_number: 1,
      scheduled_at: '2020-01-01T10:00:00Z',
      visio_url: null,
    })).toBe('realisee')
  })

  it('returns a_venir when date is in the future', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(getSessionStatus({
      session_number: 1,
      scheduled_at: future,
      visio_url: null,
    })).toBe('a_venir')
  })
})

describe('getNextSession', () => {
  it('returns null when no sessions have dates', () => {
    const sessions: SessionData[] = [
      { session_number: 1, scheduled_at: null, visio_url: null },
      { session_number: 2, scheduled_at: null, visio_url: null },
    ]
    expect(getNextSession(sessions)).toBeNull()
  })

  it('returns null when all sessions are in the past', () => {
    const sessions: SessionData[] = [
      { session_number: 1, scheduled_at: '2020-01-01T10:00:00Z', visio_url: null },
      { session_number: 2, scheduled_at: '2020-02-01T10:00:00Z', visio_url: null },
    ]
    expect(getNextSession(sessions)).toBeNull()
  })

  it('returns the nearest future session', () => {
    const soon = new Date(Date.now() + 3600000).toISOString()
    const later = new Date(Date.now() + 86400000).toISOString()
    const sessions: SessionData[] = [
      { session_number: 1, scheduled_at: '2020-01-01T10:00:00Z', visio_url: null },
      { session_number: 2, scheduled_at: later, visio_url: null },
      { session_number: 3, scheduled_at: soon, visio_url: 'https://meet.example.com' },
    ]
    const next = getNextSession(sessions)
    expect(next?.session_number).toBe(3)
    expect(next?.visio_url).toBe('https://meet.example.com')
  })

  it('returns null when 6 sessions all realized', () => {
    const sessions: SessionData[] = Array.from({ length: 6 }, (_, i) => ({
      session_number: i + 1,
      scheduled_at: '2020-01-01T10:00:00Z',
      visio_url: null,
    }))
    expect(getNextSession(sessions)).toBeNull()
  })
})
