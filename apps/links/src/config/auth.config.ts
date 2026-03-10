import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['admin', 'user'],
  defaultRole: 'user',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    admin: ['*'],
    user: ['read:own', 'write:own'],
  },
}
