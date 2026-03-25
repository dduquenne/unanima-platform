import { NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Verify super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Count active beneficiaries
  const { count: beneficiairesActifs, error: benefError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'beneficiaire')
    .eq('is_active', true)

  if (benefError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Count active consultants
  const { count: consultantesActives, error: consError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'consultant')
    .eq('is_active', true)

  if (consError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Fetch all phase validations for active beneficiaries to compute progression
  const { data: activeBeneficiaries } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'beneficiaire')
    .eq('is_active', true)

  const benefIds = (activeBeneficiaries ?? []).map(b => b.id)

  let tauxAvancementMoyen = 0
  let bilansTermines = 0

  if (benefIds.length > 0) {
    const { data: validations } = await supabase
      .from('phase_validations')
      .select('beneficiary_id, status')
      .in('beneficiary_id', benefIds)
      .eq('status', 'validee')

    // Count validated phases per beneficiary
    const validatedByBenef = new Map<string, number>()
    for (const v of validations ?? []) {
      const current = validatedByBenef.get(v.beneficiary_id) ?? 0
      validatedByBenef.set(v.beneficiary_id, current + 1)
    }

    // Compute average progression
    let totalProgression = 0
    for (const benefId of benefIds) {
      const validated = validatedByBenef.get(benefId) ?? 0
      totalProgression += validated / 6
      if (validated === 6) {
        bilansTermines++
      }
    }

    tauxAvancementMoyen = benefIds.length > 0
      ? Math.round((totalProgression / benefIds.length) * 10000) / 100
      : 0
  }

  return NextResponse.json({
    data: {
      beneficiaires_actifs: beneficiairesActifs ?? 0,
      taux_avancement_moyen: tauxAvancementMoyen,
      bilans_termines: bilansTermines,
      consultantes_actives: consultantesActives ?? 0,
    },
  })
}
