import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { updateSessionNoteSchema } from '@/lib/types/schemas'
import { isSimulationMode } from '@/lib/simulation/config'
import { getSessionNotesForBeneficiary } from '@/lib/simulation/fixtures'

export async function GET(request: NextRequest) {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const beneficiaryId = request.nextUrl.searchParams.get('beneficiary_id')
    if (!beneficiaryId) {
      return NextResponse.json(
        { error: 'beneficiary_id requis', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const notes = getSessionNotesForBeneficiary(beneficiaryId)
    return NextResponse.json({
      data: notes.map((n) => ({
        id: n.id,
        beneficiary_id: n.beneficiary_id,
        session_number: n.session_number,
        content: n.content,
        created_at: n.created_at,
        updated_at: n.updated_at,
      })),
    })
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

  // Verify consultant or super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'consultant' && profile.role !== 'super_admin')) {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const beneficiaryId = request.nextUrl.searchParams.get('beneficiary_id')
  if (!beneficiaryId) {
    return NextResponse.json(
      { error: 'beneficiary_id requis', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Verify assignment (consultants see only their own, super_admin sees all)
  if (profile.role === 'consultant') {
    const { data: beneficiary } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', beneficiaryId)
      .eq('consultant_id', user.id)
      .eq('role', 'beneficiaire')
      .single()

    if (!beneficiary) {
      return NextResponse.json(
        { error: 'Bénéficiaire non trouvé ou non assigné', code: 'FORBIDDEN' },
        { status: 403 }
      )
    }
  }

  const { data: notes, error } = await supabase
    .from('session_notes')
    .select('id, beneficiary_id, session_number, content, created_at, updated_at')
    .eq('beneficiary_id', beneficiaryId)
    .order('session_number', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: notes ?? [] })
}

export async function POST(request: NextRequest) {
  // ── Mode Simulation — succès sans écriture ──
  if (isSimulationMode()) {
    const body = await request.json().catch(() => ({}))
    return NextResponse.json({
      data: {
        success: true,
        beneficiary_id: body?.beneficiary_id ?? '',
        session_number: body?.session_number ?? 1,
      },
    })
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

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: 'Corps de requête invalide', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { beneficiary_id, session_number } = body

  if (!beneficiary_id || typeof beneficiary_id !== 'string') {
    return NextResponse.json(
      { error: 'beneficiary_id requis', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  if (!session_number || typeof session_number !== 'number' || session_number < 1 || session_number > 6) {
    return NextResponse.json(
      { error: 'session_number invalide (1-6)', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Validate content with schema
  const parsed = updateSessionNoteSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json(
      { error: msg, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Verify consultant is assigned to this beneficiary
  const { data: beneficiary } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', beneficiary_id)
    .eq('consultant_id', user.id)
    .eq('role', 'beneficiaire')
    .single()

  if (!beneficiary) {
    return NextResponse.json(
      { error: 'Bénéficiaire non trouvé ou non assigné', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const { content } = parsed.data

  // Check if note already exists to determine action type
  const { data: existingNote } = await supabase
    .from('session_notes')
    .select('id')
    .eq('beneficiary_id', beneficiary_id)
    .eq('session_number', session_number)
    .maybeSingle()

  const auditAction = existingNote ? 'update_session_note' : 'create_session_note'

  const { error } = await supabase
    .from('session_notes')
    .upsert(
      {
        beneficiary_id,
        session_number,
        content,
        consultant_id: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'beneficiary_id,session_number' }
    )

  if (error) {
    return NextResponse.json(
      { error: 'Erreur de sauvegarde', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // RG-CON-07: Audit log for session note creation/modification
  await supabase
    .from('audit_logs')
    .insert({
      user_id: user.id,
      action: auditAction,
      entity_type: 'session_note',
      entity_id: `${beneficiary_id}:${session_number}`,
      details: { beneficiary_id, session_number },
    })

  return NextResponse.json({ data: { success: true, beneficiary_id, session_number } })
}
