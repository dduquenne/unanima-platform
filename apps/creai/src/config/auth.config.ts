import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['admin_creai', 'direction', 'coordonnateur', 'professionnel'],
  defaultRole: 'professionnel',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    admin_creai: ['*'],
    direction: ['read:all', 'read:dashboard', 'read:reports', 'read:etablissements'],
    coordonnateur: [
      'read:etablissements',
      'write:etablissements',
      'read:dashboard',
      'read:reports',
    ],
    professionnel: ['read:own', 'write:own'],
  },
}
