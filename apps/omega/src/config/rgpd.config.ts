import type { RGPDConfig } from '@unanima/rgpd'

export const rgpdConfig: RGPDConfig = {
  organizationName: 'Omega Automotive',
  organizationAddress: 'France',
  dpoEmail: 'dpo@omega-automotive.fr',
  dataFinalites: [
    'Gestion des interventions SAV et maintenance',
    'Suivi des affectations de techniciens',
    'Gestion du stock de pièces détachées',
    'Consolidation des données Salesforce et SAP',
    "Génération de KPIs et tableaux de bord opérationnels",
  ],
  dataRetentionDays: 1825, // 5 ans
  hostingLocation: 'Union européenne',
}
