// Fixtures — KPIs admin (statistiques agrégées)
// Issue: #132 — Sprint 12

import { simulationProfiles } from './profiles'
import { simulationPhaseValidations } from './phases'

/** Calcule les stats admin à partir des fixtures */
export function getSimulationAdminStats() {
  const beneficiaires = simulationProfiles.filter((p) => p.role === 'beneficiaire')
  const consultants = simulationProfiles.filter((p) => p.role === 'consultant')

  const activeBeneficiaires = beneficiaires.filter((b) => b.is_active).length

  // Calcul de la progression moyenne
  const progressions = beneficiaires.map((b) => {
    const validations = simulationPhaseValidations.filter(
      (pv) => pv.beneficiary_id === b.id,
    )
    const validatedCount = validations.filter((pv) => pv.status === 'validee').length
    return (validatedCount / 6) * 100
  })
  const averageProgress = progressions.reduce((a, b) => a + b, 0) / progressions.length

  const completedBilans = beneficiaires.filter((b) => {
    const validations = simulationPhaseValidations.filter(
      (pv) => pv.beneficiary_id === b.id,
    )
    return validations.filter((pv) => pv.status === 'validee').length === 6
  }).length

  const activeConsultants = consultants.filter((c) => c.is_active).length

  // Liste bénéficiaires pour le tableau admin
  const beneficiairesList = beneficiaires.map((b) => {
    const consultant = simulationProfiles.find((p) => p.id === b.consultant_id)
    const validations = simulationPhaseValidations.filter(
      (pv) => pv.beneficiary_id === b.id,
    )
    const validatedCount = validations.filter((pv) => pv.status === 'validee').length
    return {
      id: b.id,
      full_name: b.full_name,
      email: b.email,
      consultant_name: consultant?.full_name ?? 'Non assigné',
      progress: Math.round((validatedCount / 6) * 100),
      updated_at: b.updated_at,
      role: b.role,
    }
  })

  return {
    activeBeneficiaires,
    averageProgress: Math.round(averageProgress * 100) / 100,
    completedBilans,
    activeConsultants,
    beneficiaires: beneficiairesList,
  }
}
