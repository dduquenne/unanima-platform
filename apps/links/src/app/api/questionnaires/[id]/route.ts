import { NextRequest, NextResponse } from 'next/server'
import { getQuestionnaire, updateQuestionnaire, deleteQuestionnaire } from '@/lib/api'
import { getQuestions } from '@/lib/api/questions'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  parseBody,
} from '@/lib/api/utils'
import { updateQuestionnaireSchema } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:bilans') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { data, error } = await getQuestionnaire(id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Questionnaire')

  const { data: questions, error: questionsError } = await getQuestions({
    filters: { questionnaire_id: id },
    orderBy: 'ordre',
    ascending: true,
    pageSize: 100,
  })

  if (questionsError) return serverErrorResponse(questionsError.message)

  return NextResponse.json({ ...data, questions: questions ?? [] })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:bilans')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateQuestionnaireSchema, body)
  if (parseError || !parsed) {
    return NextResponse.json(
      { error: parseError, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { data, error } = await updateQuestionnaire(id, parsed, user.id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Questionnaire')

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:bilans')) {
    return forbiddenResponse()
  }

  const { error } = await deleteQuestionnaire(id, user.id)
  if (error) return serverErrorResponse(error.message)

  return new NextResponse(null, { status: 204 })
}
