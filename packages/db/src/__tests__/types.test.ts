import { describe, it, expect } from 'vitest'
import type { Profile, AuditLog, FetchManyOptions, DbResult } from '../types'

describe('db types', () => {
  it('Profile type is well-defined', () => {
    const profile: Profile = {
      id: '123',
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'admin',
      is_active: true,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    expect(profile.id).toBe('123')
    expect(profile.email).toBe('test@example.com')
  })

  it('AuditLog type is well-defined', () => {
    const log: AuditLog = {
      id: 1,
      user_id: '123',
      action: 'login',
      entity_type: 'session',
      entity_id: null,
      details: null,
      ip_address: null,
      created_at: new Date().toISOString(),
    }
    expect(log.action).toBe('login')
  })

  it('FetchManyOptions has sensible defaults', () => {
    const opts: FetchManyOptions = {}
    expect(opts.page).toBeUndefined()
  })

  it('DbResult represents success', () => {
    const result: DbResult<string> = { data: 'ok', error: null }
    expect(result.data).toBe('ok')
    expect(result.error).toBeNull()
  })

  it('DbResult represents error', () => {
    const result: DbResult<string> = { data: null, error: new Error('fail') }
    expect(result.data).toBeNull()
    expect(result.error?.message).toBe('fail')
  })
})
