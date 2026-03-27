import { NextRequest, NextResponse } from 'next/server'
import { getQuestionnaire } from '@/lib/api'
import { getQuestionsByQuestionnaire } from '@/lib/api/questions'
import {
  getCurrentUser,
  unauthorizedResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const { data, error } = await getQuestionnaire(id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Questionnaire')

  const { data: questions, error: qError } = await getQuestionsByQuestionnaire(id)
  if (qError) return serverErrorResponse(qError.message)

  return NextResponse.json({ ...data, questions: questions ?? [] })
}

export async function PATCH() {
  // TODO Sprint 9 — Mise à jour questionnaires (super_admin uniquement)
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}

export async function DELETE() {
  // TODO Sprint 9 — Suppression questionnaires (super_admin uniquement)
  return NextResponse.json({ error: 'Non implémenté', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
