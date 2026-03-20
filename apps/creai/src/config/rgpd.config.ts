import type { RGPDConfig } from '@unanima/rgpd'

export const rgpdConfig: RGPDConfig = {
  organizationName: 'CREAI Île-de-France',
  organizationAddress: 'Paris, France',
  dpoEmail: 'dpo@creai-idf.fr',
  dataFinalites: [
    "Appui à la transformation de l'offre médico-sociale",
    'Gestion des diagnostics et évaluations des établissements',
    'Suivi des indicateurs de qualité et de performance',
    'Génération de rapports et recommandations',
    'Communication avec les coordonnateurs et professionnels',
  ],
  dataRetentionDays: 1825, // 5 ans
  hostingLocation: 'Union européenne',
}
