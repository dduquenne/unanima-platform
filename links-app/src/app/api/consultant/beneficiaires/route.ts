import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'
import { getSimulationUser } from '@/lib/simulation/handlers'
import {
  getBeneficiairesByConsultant,
  getPhaseValidationsForBeneficiary,
  getSessionsForBeneficiary,
  simulationResponses,
} from '@/lib/simulation/fixtures'

export async function GET() {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const simUser = await getSimulationUser()
    const beneficiaries = getBeneficiairesByConsultant(simUser.id)
    const now = new Date()

    const data = beneficiaries.map((b) => {
      const phases = getPhaseValidationsForBeneficiary(b.id).map((pv) => ({
        phase_number: pv.phase_number,
        status: pv.status,
      }))
      const validatedCount = phases.filter((p) => p.status === 'validee').length
      const sessions = getSessionsForBeneficiary(b.id)
      const nextSession = sessions
        .filter((s) => s.scheduled_at && new Date(s.scheduled_at) > now)
        .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())[0]
      const lastResponse = simulationResponses
        .filter((r) => r.beneficiary_id === b.id)
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]

      return {
        id: b.id,
        full_name: b.full_name,
        email: b.email,
        is_active: b.is_active,
        date_debut_bilan: b.date_debut_bilan,
        phases,
        next_session: nextSession?.scheduled_at ?? null,
        validated_count: validatedCount,
        created_at: b.created_at,
        last_activity_at: lastResponse?.updated_at ?? b.created_at,
      }
    })

    data.sort((a, b) => {
      if (a.next_session === null && b.next_session === null) return 0
      if (a.next_session === null) return 1
      if (b.next_session === null) return -1
      return new Date(a.next_session).getTime() - new Date(b.next_session).getTime()
    })

    return NextResponse.json({ data })
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

  // Verify consultant role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'consultant') {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Fetch assigned beneficiaries
  const { data: beneficiaries, error: benefError } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_active, date_debut_bilan, created_at')
    .eq('consultant_id', user.id)
    .eq('role', 'beneficiaire')

  if (benefError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  if (!beneficiaries || beneficiaries.length === 0) {
    return NextResponse.json({ data: [] })
  }

  const beneficiaryIds = beneficiaries.map(b => b.id)

  // Fetch phase validations for all beneficiaries
  const { data: validations, error: valError } = await supabase
    .from('phase_validations')
    .select('beneficiary_id, phase_number, status')
    .in('beneficiary_id', beneficiaryIds)
    .order('phase_number', { ascending: true })

  if (valError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Fetch next session for each beneficiary
  const { data: sessions, error: sessError } = await supabase
    .from('sessions')
    .select('beneficiary_id, scheduled_at')
    .in('beneficiary_id', beneficiaryIds)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })

  if (sessError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Fetch last activity (most recent phase_response) per beneficiary
  const { data: lastResponses } = await supabase
    .from('phase_responses')
    .select('beneficiary_id, updated_at')
    .in('beneficiary_id', beneficiaryIds)
    .order('updated_at', { ascending: false })

  // Group validations by beneficiary
  const validationsByBenef = new Map<string, { phase_number: number; status: string }[]>()
  for (const v of validations ?? []) {
    const list = validationsByBenef.get(v.beneficiary_id) ?? []
    list.push({ phase_number: v.phase_number, status: v.status })
    validationsByBenef.set(v.beneficiary_id, list)
  }

  // Get next session per beneficiary (first upcoming session)
  const nextSessionByBenef = new Map<string, string | null>()
  for (const s of sessions ?? []) {
    if (!nextSessionByBenef.has(s.beneficiary_id)) {
      nextSessionByBenef.set(s.beneficiary_id, s.scheduled_at)
    }
  }

  // Get last activity per beneficiary (most recent response update)
  const lastActivityByBenef = new Map<string, string | null>()
  for (const r of lastResponses ?? []) {
    if (!lastActivityByBenef.has(r.beneficiary_id)) {
      lastActivityByBenef.set(r.beneficiary_id, r.updated_at)
    }
  }

  // Build response
  const data = beneficiaries.map(b => {
    const phases = validationsByBenef.get(b.id) ?? []
    const validatedCount = phases.filter(p => p.status === 'validee').length
    const nextSession = nextSessionByBenef.get(b.id) ?? null
    const lastActivity = lastActivityByBenef.get(b.id) ?? b.created_at

    return {
      id: b.id,
      full_name: b.full_name,
      email: b.email,
      is_active: b.is_active,
      date_debut_bilan: b.date_debut_bilan,
      phases,
      next_session: nextSession,
      validated_count: validatedCount,
      created_at: b.created_at,
      last_activity_at: lastActivity,
    }
  })

  // Sort by next session ASC, nulls last
  data.sort((a, b) => {
    if (a.next_session === null && b.next_session === null) return 0
    if (a.next_session === null) return 1
    if (b.next_session === null) return -1
    return new Date(a.next_session).getTime() - new Date(b.next_session).getTime()
  })

  return NextResponse.json({ data })
}
