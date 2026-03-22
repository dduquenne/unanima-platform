import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: vi.fn(),
  })),
}))

import { checkRateLimit } from '../rate-limit'
import { createClient } from '@supabase/supabase-js'

describe('checkRateLimit', () => {
  const opts = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseServiceRoleKey: 'test-key',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns allowed: true when under limit', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: true, error: null })
    vi.mocked(createClient).mockReturnValue({ rpc: mockRpc } as never)

    const result = await checkRateLimit(opts, {
      key: 'test:key',
      maxRequests: 5,
      windowSeconds: 3600,
    })

    expect(result.allowed).toBe(true)
    expect(result.error).toBeNull()
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      rate_key: 'test:key',
      max_requests: 5,
      window_seconds: 3600,
    })
  })

  it('returns allowed: false when over limit', async () => {
    const mockRpc = vi.fn().mockResolvedValue({ data: false, error: null })
    vi.mocked(createClient).mockReturnValue({ rpc: mockRpc } as never)

    const result = await checkRateLimit(opts, {
      key: 'test:key',
      maxRequests: 3,
      windowSeconds: 3600,
    })

    expect(result.allowed).toBe(false)
    expect(result.error).toBeNull()
  })

  it('returns error on database failure', async () => {
    const mockRpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'DB error' },
    })
    vi.mocked(createClient).mockReturnValue({ rpc: mockRpc } as never)

    const result = await checkRateLimit(opts, {
      key: 'test:key',
      maxRequests: 3,
      windowSeconds: 3600,
    })

    expect(result.allowed).toBe(false)
    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toBe('DB error')
  })
})
