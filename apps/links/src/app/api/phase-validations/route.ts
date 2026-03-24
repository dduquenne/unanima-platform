import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { updatePhaseValidationSchema } from '@/lib/types/schemas'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: 'Profil non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Beneficiaire: own validations only
  const { data: validations, error } = await supabase
    .from('phase_validations')
    .select('phase_number, status, validated_at')
    .eq('beneficiary_id', user.id)
    .order('phase_number', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: validations ?? [] })
}

// PATCH — Validate or de-validate a phase
export async function PATCH(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => null)
  const phaseNumber = body?.phase_number
  if (!phaseNumber || typeof phaseNumber !== 'number' || phaseNumber < 1 || phaseNumber > 6) {
    return NextResponse.json(
      { error: 'phase_number invalide (1-6)', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = updatePhaseValidationSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json({ error: msg, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { status } = parsed.data
  const validatedAt = status === 'validee' ? new Date().toISOString() : null

  const { error } = await supabase
    .from('phase_validations')
    .upsert(
      {
        beneficiary_id: user.id,
        phase_number: phaseNumber,
        status,
        validated_at: validatedAt,
      },
      { onConflict: 'beneficiary_id,phase_number' }
    )

  if (error) {
    return NextResponse.json(
      { error: 'Erreur de mise à jour', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, status, phase_number: phaseNumber })
}
