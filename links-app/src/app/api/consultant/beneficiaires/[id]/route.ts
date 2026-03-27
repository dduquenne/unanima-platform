import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'
import {
  simulationProfiles,
  getPhaseValidationsForBeneficiary,
  simulationQuestionnaires,
  simulationQuestions,
  simulationResponses,
  getSessionsForBeneficiary,
} from '@/lib/simulation/fixtures'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beneficiaryId } = await params

  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const beneficiary = simulationProfiles.find(
      (p) => p.id === beneficiaryId && p.role === 'beneficiaire',
    )
    if (!beneficiary) {
      return NextResponse.json(
        { error: 'Bénéficiaire non trouvé', code: 'NOT_FOUND' },
        { status: 404 },
      )
    }

    const validations = getPhaseValidationsForBeneficiary(beneficiaryId)
    const benResponses = simulationResponses.filter((r) => r.beneficiary_id === beneficiaryId)
    const sessions = getSessionsForBeneficiary(beneficiaryId)

    const responsesByQuestion = new Map<string, string | null>()
    for (const r of benResponses) {
      responsesByQuestion.set(r.question_id, r.response_text)
    }

    const validationByPhase = new Map<number, string>()
    for (const v of validations) {
      validationByPhase.set(v.phase_number, v.status)
    }

    const phases = Array.from({ length: 6 }, (_, i) => {
      const phaseNumber = i + 1
      const questionnaire = simulationQuestionnaires.find((q) => q.phase_number === phaseNumber)
      const phaseQuestions = simulationQuestions.filter(
        (q) => q.questionnaire_id === `q-phase-${phaseNumber}`,
      )
      const validationStatus = validationByPhase.get(phaseNumber) ?? 'libre'

      let status: 'validated' | 'active' | 'locked'
      if (validationStatus === 'validee') status = 'validated'
      else if (validationStatus === 'en_cours') status = 'active'
      else status = 'locked'

      return {
        number: phaseNumber,
        label: questionnaire?.title ?? `Phase ${phaseNumber}`,
        status,
        questions: phaseQuestions.map((q, idx) => ({
          id: q.id,
          number: idx + 1,
          label: q.text,
        })),
        responses: phaseQuestions.map((q) => ({
          question_id: q.id,
          text: responsesByQuestion.get(q.id) ?? null,
        })),
      }
    })

    const validatedCount = validations.filter((v) => v.status === 'validee').length

    return NextResponse.json({
      profile: {
        id: beneficiary.id,
        full_name: beneficiary.full_name,
        email: beneficiary.email,
        started_at: beneficiary.date_debut_bilan ?? beneficiary.created_at,
        status: validatedCount === 6 ? 'termine' : 'en_cours',
      },
      phases,
      sessions: sessions.map((s) => ({
        session_number: s.session_number,
        scheduled_at: s.scheduled_at,
        visio_url: s.visio_url,
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

  // Fetch questionnaires and questions for all 6 phases
  const { data: questionnaires, error: questError } = await supabase
    .from('questionnaires')
    .select('id, phase_number, title, description')
    .order('phase_number', { ascending: true })

  if (questError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  const questionnaireIds = (questionnaires ?? []).map(q => q.id)
  let questions: Array<{ id: string; questionnaire_id: string; text: string; sort_order: number }> = []

  if (questionnaireIds.length > 0) {
    const { data: questionsData, error: qError } = await supabase
      .from('questions')
      .select('id, questionnaire_id, text, sort_order')
      .in('questionnaire_id', questionnaireIds)
      .order('sort_order', { ascending: true })

    if (qError) {
      return NextResponse.json(
        { error: 'Erreur serveur', code: 'SERVER_ERROR' },
        { status: 500 }
      )
    }
    questions = questionsData ?? []
  }

  // Build structured phases with questions and responses
  const responsesByQuestion = new Map<string, string | null>()
  for (const r of phaseResponses ?? []) {
    responsesByQuestion.set(r.question_id, r.response_text)
  }

  const validationByPhase = new Map<number, string>()
  for (const v of phaseValidations ?? []) {
    validationByPhase.set(v.phase_number, v.status)
  }

  const questionsByQuestionnaire = new Map<string, typeof questions>()
  for (const q of questions) {
    const list = questionsByQuestionnaire.get(q.questionnaire_id) ?? []
    list.push(q)
    questionsByQuestionnaire.set(q.questionnaire_id, list)
  }

  const phases = Array.from({ length: 6 }, (_, i) => {
    const phaseNumber = i + 1
    const questionnaire = (questionnaires ?? []).find(q => q.phase_number === phaseNumber)
    const phaseQuestions = questionnaire ? (questionsByQuestionnaire.get(questionnaire.id) ?? []) : []
    const validationStatus = validationByPhase.get(phaseNumber) ?? 'libre'

    let status: 'validated' | 'active' | 'locked'
    if (validationStatus === 'validee') {
      status = 'validated'
    } else if (validationStatus === 'en_cours') {
      status = 'active'
    } else {
      status = 'locked'
    }

    return {
      number: phaseNumber,
      label: questionnaire?.title ?? `Phase ${phaseNumber}`,
      status,
      questions: phaseQuestions.map((q, idx) => ({
        id: q.id,
        number: idx + 1,
        label: q.text,
      })),
      responses: phaseQuestions.map(q => ({
        question_id: q.id,
        text: responsesByQuestion.get(q.id) ?? null,
      })),
    }
  })

  // Determine beneficiary status
  const validatedCount = (phaseValidations ?? []).filter(v => v.status === 'validee').length
  const profileStatus = validatedCount === 6 ? 'termine' : 'en_cours'

  return NextResponse.json({
    profile: {
      id: beneficiary.id,
      full_name: beneficiary.full_name,
      email: beneficiary.email,
      started_at: beneficiary.date_debut_bilan ?? beneficiary.created_at,
      status: profileStatus,
    },
    phases,
    sessions: sessions ?? [],
  })
}
