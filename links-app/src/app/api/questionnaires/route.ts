import { NextRequest, NextResponse } from 'next/server'
import { getQuestionnaires, getQuestionnairesByPhase } from '@/lib/api'
import {
  getCurrentUser,
  getPaginationParams,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/api/utils'
import { isSimulationMode } from '@/lib/simulation/config'
import {
  simulationQuestionnaires,
  getQuestionnairesByPhase as getSimQuestionnairesByPhase,
  getQuestionsForPhase,
} from '@/lib/simulation/fixtures'

export async function GET(request: NextRequest) {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const phaseParam = request.nextUrl.searchParams.get('phase_number')
    if (phaseParam) {
      const phaseNumber = Number(phaseParam)
      if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
        return NextResponse.json(
          { error: 'phase_number invalide : valeur attendue entre 1 et 6', code: 'VALIDATION_ERROR' },
          { status: 400 },
        )
      }
      const questionnaires = getSimQuestionnairesByPhase(phaseNumber)
      const questions = getQuestionsForPhase(phaseNumber)
      // Return questionnaires with their questions embedded
      const data = questionnaires.map((q) => ({
        ...q,
        questions: questions.filter((qu) => qu.questionnaire_id === q.id),
      }))
      return NextResponse.json({ data, meta: { total: data.length } })
    }
    return NextResponse.json({
      data: simulationQuestionnaires,
      meta: { total: simulationQuestionnaires.length, page: 1, limit: 50 },
    })
  }

  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const phaseParam = request.nextUrl.searchParams.get('phase_number')

  if (phaseParam) {
    const phaseNumber = Number(phaseParam)
    if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
      return NextResponse.json(
        { error: 'phase_number invalide : valeur attendue entre 1 et 6', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const { data, count, error } = await getQuestionnairesByPhase(phaseNumber)
    if (error) return serverErrorResponse(error.message)
    return NextResponse.json({ data, meta: { total: count } })
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const { data, count, error } = await getQuestionnaires({
    page,
    pageSize: limit,
    orderBy: sort,
    ascending: order === 'asc',
  })

  if (error) return serverErrorResponse(error.message)
  return NextResponse.json({ data, meta: { total: count, page, limit } })
}

export async function POST() {
  // TODO Sprint 9 — Création de questionnaires (super_admin uniquement)
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
