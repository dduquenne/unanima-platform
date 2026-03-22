import { describe, it, expect } from 'vitest'
import {
  AuthProvider,
  AuthContext,
  AuthConfigContext,
  useAuth,
  useAuthConfig,
  useRequireRole,
  usePermission,
  createAuthMiddleware,
  hasPermission,
  hasAnyRole,
  LoginForm,
  ResetPasswordForm,
  ProtectedRoute,
  checkRateLimit,
} from '../index'

describe('Auth package exports', () => {
  it.each([
    ['AuthProvider', AuthProvider],
    ['useAuth', useAuth],
    ['useAuthConfig', useAuthConfig],
    ['useRequireRole', useRequireRole],
    ['usePermission', usePermission],
    ['createAuthMiddleware', createAuthMiddleware],
    ['hasPermission', hasPermission],
    ['hasAnyRole', hasAnyRole],
    ['LoginForm', LoginForm],
    ['ResetPasswordForm', ResetPasswordForm],
    ['ProtectedRoute', ProtectedRoute],
    ['checkRateLimit', checkRateLimit],
  ])('exports %s as a function', (_, exportedItem) => {
    expect(typeof exportedItem).toBe('function')
  })

  it('exports AuthContext', () => {
    expect(AuthContext).toBeDefined()
  })

  it('exports AuthConfigContext', () => {
    expect(AuthConfigContext).toBeDefined()
  })
})
