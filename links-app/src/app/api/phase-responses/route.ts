import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { autosaveSchema } from '@/lib/types/schemas'
import { isSimulationMode } from '@/lib/simulation/config'
import { getSimulationUser } from '@/lib/simulation/handlers'
import { getResponsesForBeneficiaryPhase } from '@/lib/simulation/fixtures'

// GET — Fetch all responses for a phase
export async function GET(request: NextRequest) {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const phaseNumber = request.nextUrl.searchParams.get('phase')
    if (!phaseNumber) {
      return NextResponse.json({ error: 'Paramètre phase requis', code: 'VALIDATION_ERROR' }, { status: 400 })
    }
    const simUser = await getSimulationUser()
    const responses = getResponsesForBeneficiaryPhase(simUser.id, Number(phaseNumber))
    return NextResponse.json({
      data: responses.map((r) => ({
        id: r.id,
        question_id: r.question_id,
        response_text: r.response_text,
        phase_status: r.phase_status,
        last_saved_at: r.last_saved_at,
      })),
    })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const phaseNumber = request.nextUrl.searchParams.get('phase')
  if (!phaseNumber) {
    return NextResponse.json({ error: 'Paramètre phase requis', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data: responses, error } = await supabase
    .from('phase_responses')
    .select('id, question_id, response_text, phase_status, last_saved_at')
    .eq('beneficiary_id', user.id)
    .eq('phase_number', Number(phaseNumber))

  if (error) {
    return NextResponse.json({ error: 'Erreur serveur', code: 'SERVER_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ data: responses ?? [] })
}

// POST — Autosave a single response (upsert)
export async function POST(request: NextRequest) {
  // ── Mode Simulation — succès sans écriture ──
  if (isSimulationMode()) {
    return NextResponse.json({
      success: true,
      saved_at: new Date().toISOString(),
    })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = autosaveSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json({ error: msg, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { question_id, response_text, phase_number } = parsed.data

  // Upsert response
  const { data: response, error } = await supabase
    .from('phase_responses')
    .upsert(
      {
        beneficiary_id: user.id,
        question_id,
        response_text,
        phase_number,
        phase_status: 'en_cours',
        last_saved_at: new Date().toISOString(),
      },
      { onConflict: 'beneficiary_id,question_id' }
    )
    .select('id, last_saved_at')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur de sauvegarde', code: 'SERVER_ERROR' }, { status: 500 })
  }

  // Also upsert the phase validation to 'en_cours' if it's still 'libre'
  await supabase
    .from('phase_validations')
    .upsert(
      {
        beneficiary_id: user.id,
        phase_number,
        status: 'en_cours',
      },
      { onConflict: 'beneficiary_id,phase_number' }
    )
    // Don't override 'validee' status — only upgrade from 'libre' to 'en_cours'
    // The upsert will not downgrade from 'validee' since we handle that in the validation endpoint

  return NextResponse.json({
    success: true,
    saved_at: response?.last_saved_at ?? new Date().toISOString(),
  })
}
