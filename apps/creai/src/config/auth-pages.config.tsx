import type { AuthPageConfig } from '@unanima/auth'

export const authPageConfig: AuthPageConfig = {
  appName: 'CREAI Île-de-France',
  tagline: "Plateforme d'appui à la transformation de l'offre médico-sociale",
  legalLinks: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
  ],
  roleRedirects: {
    admin_creai: '/admin',
    direction: '/dashboard',
    coordonnateur: '/etablissements',
    professionnel: '/dashboard',
  },
}
