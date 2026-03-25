import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beneficiaryId } = await params
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
  const { data: consultantProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!consultantProfile || consultantProfile.role !== 'consultant') {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Fetch beneficiary profile and verify assignment
  const { data: beneficiary, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_active, date_debut_bilan, date_fin_bilan, metadata, consultant_id, created_at, updated_at')
    .eq('id', beneficiaryId)
    .eq('role', 'beneficiaire')
    .single()

  if (profileError || !beneficiary) {
    return NextResponse.json(
      { error: 'Bénéficiaire non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  if (beneficiary.consultant_id !== user.id) {
    return NextResponse.json(
      { error: 'Bénéficiaire non assigné à votre portefeuille', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Fetch phase validations
  const { data: phaseValidations, error: valError } = await supabase
    .from('phase_validations')
    .select('phase_number, status, validated_at')
    .eq('beneficiary_id', beneficiaryId)
    .order('phase_number', { ascending: true })

  if (valError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Fetch phase responses
  const { data: phaseResponses, error: respError } = await supabase
    .from('phase_responses')
    .select('id, question_id, response_text, phase_number, phase_status, created_at, updated_at')
    .eq('beneficiary_id', beneficiaryId)
    .order('phase_number', { ascending: true })

  if (respError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Fetch sessions
  const { data: sessions, error: sessError } = await supabase
    .from('sessions')
    .select('session_number, scheduled_at, visio_url')
    .eq('beneficiary_id', beneficiaryId)
    .order('session_number', { ascending: true })

  if (sessError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    data: {
      profile: beneficiary,
      phase_validations: phaseValidations ?? [],
      phase_responses: phaseResponses ?? [],
      sessions: sessions ?? [],
    },
  })
}
