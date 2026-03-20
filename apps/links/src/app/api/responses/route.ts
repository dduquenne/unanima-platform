import { NextRequest, NextResponse } from 'next/server'
import { getResponses, createResponse } from '@/lib/api'
import {
  getCurrentUser,
  checkPermission,
  getPaginationParams,
  getFilters,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  parseBody,
} from '@/lib/api/utils'
import { createResponseSchema } from '@/lib/types'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:bilans') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['bilan_id', 'question_id'])

  const { data, count, error } = await getResponses({
    page,
    pageSize: limit,
    orderBy: sort,
    ascending: order === 'asc',
    filters,
  })

  if (error) return serverErrorResponse(error.message)

  return NextResponse.json({ data, meta: { total: count, page, limit } })
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:own') && !checkPermission(user.role, 'write:bilans')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createResponseSchema, body)
  if (parseError || !parsed) {
    return NextResponse.json(
      { error: parseError, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { data, error } = await createResponse(parsed, user.id)
  if (error) return serverErrorResponse(error.message)

  return NextResponse.json(data, { status: 201 })
}
