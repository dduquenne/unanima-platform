import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockFrom = vi.fn(() => ({ insert: mockInsert }))

vi.mock('../client', () => ({
  createBrowserClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

import { logAudit } from '../audit'

describe('logAudit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  it('logs audit entry with all fields', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const result = await logAudit(
      'user-123',
      'profile_update',
      'profiles',
      'entity-456',
      { field: 'email' }
    )

    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('audit_logs')
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      action: 'profile_update',
      entity_type: 'profiles',
      entity_id: 'entity-456',
      details: { field: 'email' },
    })
  })

  it('handles optional entityId and details', async () => {
    mockInsert.mockResolvedValue({ error: null })

    await logAudit('user-123', 'login', 'auth')

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      action: 'login',
      entity_type: 'auth',
      entity_id: null,
      details: null,
    })
  })

  it('returns error on failure', async () => {
    mockInsert.mockResolvedValue({
      error: { message: 'Insert failed' },
    })

    const result = await logAudit('user-123', 'login', 'auth')
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('Insert failed')
  })
})
