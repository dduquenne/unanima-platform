import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import { exportUserData } from '../api/export-data'

const baseOpts = {
  userId: 'user-123',
  supabaseUrl: 'https://test.supabase.co',
  supabaseServiceRoleKey: 'test-key',
  allowedTables: ['beneficiaires', 'bilans'],
}

describe('exportUserData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exports profile and audit logs', async () => {
    // Mock profile query
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: 'user-123', email: 'test@test.com' },
                error: null,
              }),
            }),
          }),
        }
      }
      if (table === 'audit_logs') {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({
                data: [{ id: 1, action: 'login' }],
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
        }),
      }
    })

    const result = await exportUserData(baseOpts)

    expect(result.error).toBeNull()
    expect(result.data?.profile).toEqual({ id: 'user-123', email: 'test@test.com' })
    expect(result.data?.audit_logs).toEqual([{ id: 1, action: 'login' }])
  })

  it('rejects non-whitelisted tables', async () => {
    const result = await exportUserData({
      ...baseOpts,
      additionalTables: ['auth_users'],
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('not in the allowed list')
    expect(result.data).toBeNull()
  })

  it('rejects tables with invalid names', async () => {
    const result = await exportUserData({
      ...baseOpts,
      additionalTables: ['profiles; DROP TABLE users'],
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Invalid table name')
  })

  it('exports additional whitelisted tables', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({
                data: { id: 'user-123' },
                error: null,
              }),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () =>
            table === 'audit_logs'
              ? { order: () => Promise.resolve({ data: [], error: null }) }
              : Promise.resolve({ data: [{ id: 1 }], error: null }),
        }),
      }
    })

    const result = await exportUserData({
      ...baseOpts,
      additionalTables: ['beneficiaires'],
    })

    expect(result.error).toBeNull()
    expect(result.data?.beneficiaires).toEqual([{ id: 1 }])
  })

  it('returns error when profile fetch fails', async () => {
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({
            data: null,
            error: { message: 'Profile not found' },
          }),
        }),
      }),
    })

    const result = await exportUserData(baseOpts)

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('Profile not found')
  })
})
