import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockOrder = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import { getAuditAccess } from '../api/audit-access'

const opts = {
  userId: 'user-123',
  supabaseUrl: 'https://test.supabase.co',
  supabaseServiceRoleKey: 'test-key',
}

describe('getAuditAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ order: mockOrder })
  })

  it('returns audit entries', async () => {
    const entries = [
      { id: 1, action: 'login', entity_type: 'auth', entity_id: null, details: null, created_at: '2024-01-01' },
      { id: 2, action: 'export', entity_type: 'profiles', entity_id: 'u1', details: {}, created_at: '2024-01-02' },
    ]
    mockOrder.mockResolvedValue({ data: entries, error: null })

    const result = await getAuditAccess(opts)

    expect(result.data).toHaveLength(2)
    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('audit_logs')
    expect(mockSelect).toHaveBeenCalledWith('id, action, entity_type, entity_id, details, created_at')
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: 'Query failed' },
    })

    const result = await getAuditAccess(opts)

    expect(result.data).toEqual([])
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('Query failed')
  })

  it('handles null data gracefully', async () => {
    mockOrder.mockResolvedValue({ data: null, error: null })

    const result = await getAuditAccess(opts)

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })
})
