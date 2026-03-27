import type { AuthPageConfig } from '@/lib/auth'

export const authPageConfig: AuthPageConfig = {
  appName: "Link's Accompagnement",
  tagline: 'Votre espace de suivi personnalisé',
  supportEmail: 'support@links-accompagnement.fr',
  legalLinks: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
    { label: 'RGPD', href: '/cookies' },
  ],
  roleRedirects: {
    beneficiaire: '/dashboard',
    consultant: '/beneficiaires',
    super_admin: '/admin',
  },
}
