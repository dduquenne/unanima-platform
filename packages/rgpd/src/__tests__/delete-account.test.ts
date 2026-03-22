import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRpc = vi.fn()
const mockDeleteUser = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: mockRpc,
    auth: {
      admin: {
        deleteUser: mockDeleteUser,
      },
    },
  })),
}))

import { deleteAccount } from '../api/delete-account'

const baseOpts = {
  userId: 'user-123',
  supabaseUrl: 'https://test.supabase.co',
  supabaseServiceRoleKey: 'test-key',
  allowedTables: ['beneficiaires', 'bilans'],
}

describe('deleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes account atomically via RPC', async () => {
    mockRpc.mockResolvedValue({ error: null })
    mockDeleteUser.mockResolvedValue({ error: null })

    const result = await deleteAccount({
      ...baseOpts,
      additionalTables: ['beneficiaires'],
    })

    expect(result.error).toBeNull()
    expect(mockRpc).toHaveBeenCalledWith('delete_user_account', {
      target_user_id: 'user-123',
      additional_tables: ['beneficiaires'],
    })
    expect(mockDeleteUser).toHaveBeenCalledWith('user-123')
  })

  it('rejects non-whitelisted tables', async () => {
    const result = await deleteAccount({
      ...baseOpts,
      additionalTables: ['auth.users'],
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Invalid table name')
    expect(mockRpc).not.toHaveBeenCalled()
  })

  it('returns error when RPC fails', async () => {
    mockRpc.mockResolvedValue({
      error: { message: 'Transaction failed' },
    })

    const result = await deleteAccount({
      ...baseOpts,
      additionalTables: ['beneficiaires'],
    })

    expect(result.error?.message).toContain('Atomic deletion failed')
    expect(mockDeleteUser).not.toHaveBeenCalled()
  })

  it('returns error when auth delete fails', async () => {
    mockRpc.mockResolvedValue({ error: null })
    mockDeleteUser.mockResolvedValue({
      error: { message: 'Auth error' },
    })

    const result = await deleteAccount({
      ...baseOpts,
      additionalTables: [],
    })

    expect(result.error?.message).toContain('Failed to delete auth user')
  })

  it('works with no additional tables', async () => {
    mockRpc.mockResolvedValue({ error: null })
    mockDeleteUser.mockResolvedValue({ error: null })

    const result = await deleteAccount(baseOpts)

    expect(result.error).toBeNull()
    expect(mockRpc).toHaveBeenCalledWith('delete_user_account', {
      target_user_id: 'user-123',
      additional_tables: [],
    })
  })
})
