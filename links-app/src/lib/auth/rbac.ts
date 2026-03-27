import type { AuthConfig } from './types'

export function hasPermission(
  userRole: string,
  permission: string,
  config: AuthConfig,
): boolean {
  const rolePermissions = config.permissions[userRole]
  if (!rolePermissions) return false
  if (rolePermissions.includes('*')) return true
  return rolePermissions.includes(permission)
}

export function hasAnyRole(userRole: string, roles: string[]): boolean {
  return roles.includes(userRole)
}
