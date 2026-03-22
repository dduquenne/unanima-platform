import { describe, it, expect } from 'vitest'
import type { AuthConfig, UserSession, AuthContextValue } from '../types'

describe('AuthConfig type', () => {
  it('can be instantiated with valid data', () => {
    const config: AuthConfig = {
      roles: ['admin', 'user'],
      defaultRole: 'user',
      redirects: {
        afterLogin: '/dashboard',
        afterLogout: '/login',
        unauthorized: '/login',
      },
      permissions: {
        admin: ['*'],
        user: ['read:own'],
      },
    }

    expect(config.roles).toHaveLength(2)
    expect(config.defaultRole).toBe('user')
    expect(config.redirects.afterLogin).toBe('/dashboard')
    expect(config.permissions.admin).toContain('*')
  })
})

describe('UserSession type', () => {
  it('can be instantiated with valid data', () => {
    const session: UserSession = {
      id: 'uuid-123',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'admin',
      isActive: true,
      metadata: { department: 'IT' },
    }

    expect(session.id).toBe('uuid-123')
    expect(session.email).toBe('test@example.com')
    expect(session.isActive).toBe(true)
    expect(session.metadata).toHaveProperty('department')
  })
})

describe('AuthContextValue type', () => {
  it('can be instantiated with null user', () => {
    const context: AuthContextValue = {
      user: null,
      session: null,
      isLoading: false,
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      resetPassword: async () => ({ error: null }),
    }

    expect(context.user).toBeNull()
    expect(context.isLoading).toBe(false)
  })
})
