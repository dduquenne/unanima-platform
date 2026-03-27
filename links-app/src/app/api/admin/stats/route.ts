import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'
import { getSimulationAdminStats } from '@/lib/simulation/fixtures'

export async function GET() {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    return NextResponse.json({ data: getSimulationAdminStats() })
  }

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
    .select('id, consultant_id')
    .eq('role', 'beneficiaire')
    .eq('is_active', true)

  const benefIds = (activeBeneficiaries ?? []).map(b => b.id)

  let tauxAvancementMoyen = 0
  let bilansTermines = 0
  const validatedByBenef = new Map<string, number>()

  if (benefIds.length > 0) {
    const { data: validations } = await supabase
      .from('phase_validations')
      .select('beneficiary_id, status')
      .in('beneficiary_id', benefIds)
      .eq('status', 'validee')

    // Count validated phases per beneficiary
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

  // Build beneficiary rows with progression + consultant name + last login
  const consultantIds = [
    ...new Set(
      (activeBeneficiaries ?? [])
        .filter((b: Record<string, unknown>) => b.consultant_id)
        .map((b: Record<string, unknown>) => b.consultant_id as string)
    ),
  ]

  let consultantMap = new Map<string, string>()
  if (consultantIds.length > 0) {
    const { data: consultants } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', consultantIds)

    for (const c of consultants ?? []) {
      consultantMap.set(c.id, c.full_name)
    }
  }

  // Get all beneficiary profiles with full data
  const { data: allBenefProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, consultant_id, updated_at, role')
    .eq('role', 'beneficiaire')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })

  const beneficiaryRows = (allBenefProfiles ?? []).map(b => {
    const validated = validatedByBenef.get(b.id) ?? 0
    return {
      id: b.id,
      full_name: b.full_name,
      email: b.email,
      consultant_name: b.consultant_id ? consultantMap.get(b.consultant_id) ?? 'Non assignée' : 'Non assignée',
      progress: Math.round((validated / 6) * 100),
      updated_at: b.updated_at,
      role: b.role,
    }
  })

  return NextResponse.json({
    data: {
      activeBeneficiaires: beneficiairesActifs ?? 0,
      averageProgress: tauxAvancementMoyen,
      completedBilans: bilansTermines,
      activeConsultants: consultantesActives ?? 0,
      beneficiaires: beneficiaryRows,
    },
  })
}
