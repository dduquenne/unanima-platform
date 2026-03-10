import { describe, it, expect } from 'vitest'
import { hasPermission, hasAnyRole } from '../rbac'
import type { AuthConfig } from '../types'

const mockConfig: AuthConfig = {
  roles: ['admin', 'editor', 'viewer'],
  defaultRole: 'viewer',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    admin: ['*'],
    editor: ['read:all', 'write:articles'],
    viewer: ['read:own'],
  },
}

describe('hasPermission', () => {
  it('grants all permissions to wildcard role', () => {
    expect(hasPermission('admin', 'read:all', mockConfig)).toBe(true)
    expect(hasPermission('admin', 'anything', mockConfig)).toBe(true)
  })

  it('checks specific permissions', () => {
    expect(hasPermission('editor', 'read:all', mockConfig)).toBe(true)
    expect(hasPermission('editor', 'write:articles', mockConfig)).toBe(true)
    expect(hasPermission('editor', 'delete:articles', mockConfig)).toBe(false)
  })

  it('returns false for unknown role', () => {
    expect(hasPermission('unknown', 'read:all', mockConfig)).toBe(false)
  })
})

describe('hasAnyRole', () => {
  it('returns true when role matches', () => {
    expect(hasAnyRole('admin', ['admin', 'editor'])).toBe(true)
  })

  it('returns false when role does not match', () => {
    expect(hasAnyRole('viewer', ['admin', 'editor'])).toBe(false)
  })
})
