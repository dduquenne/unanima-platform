import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['admin', 'responsable_sav', 'technicien', 'operateur'],
  defaultRole: 'operateur',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    admin: ['*'],
    responsable_sav: [
      'read:all',
      'write:interventions',
      'read:dashboard',
      'read:kpis',
      'write:affectations',
    ],
    technicien: ['read:interventions', 'write:interventions', 'read:pieces'],
    operateur: ['read:own', 'write:own', 'read:pieces'],
  },
}
