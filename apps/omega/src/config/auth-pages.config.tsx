import type { AuthPageConfig } from '@unanima/auth'

export const authPageConfig: AuthPageConfig = {
  appName: 'Omega Automotive',
  tagline: 'Dashboard opérationnel SAV',
  legalLinks: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
  ],
  roleRedirects: {
    admin: '/admin',
    responsable_sav: '/dashboard',
    technicien: '/interventions',
    operateur: '/dashboard',
  },
}
