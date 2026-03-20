import type { AuthConfig } from '@unanima/auth'

export const authConfig: AuthConfig = {
  roles: ['beneficiaire', 'consultant', 'super_admin'],
  defaultRole: 'beneficiaire',
  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    unauthorized: '/login',
  },
  permissions: {
    super_admin: ['*'],
    consultant: [
      'read:beneficiaires',
      'write:beneficiaires',
      'read:bilans',
      'write:bilans',
      'read:responses',
      'read:dashboard',
      'read:documents',
    ],
    beneficiaire: ['read:own', 'write:own', 'read:documents'],
  },
}
