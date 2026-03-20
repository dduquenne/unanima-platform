import type { RGPDConfig } from '@unanima/rgpd'

export const rgpdConfig: RGPDConfig = {
  organizationName: "Link's Accompagnement",
  organizationAddress: 'Paris, France',
  dpoEmail: 'dpo@links-accompagnement.fr',
  dataFinalites: [
    'Gestion des bilans de compétences',
    'Suivi des bénéficiaires et de leur parcours',
    'Communication entre consultants et bénéficiaires',
    'Génération de rapports et documents de bilan',
    'Envoi de notifications par e-mail',
  ],
  dataRetentionDays: 1095, // 3 ans
  hostingLocation: 'Union européenne',
}
