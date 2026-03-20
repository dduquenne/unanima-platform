import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { PieceDetachee } from '../../../lib/types'
import { createPieceDetacheeSchema } from '../../../lib/types'
import {
  getPaginationParams,
  getFilters,
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseBody,
} from '../../../lib/api/utils'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:pieces') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['reference'])

  const { data, count, error } = await fetchMany<PieceDetachee>('pieces_detachees', {
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
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createPieceDetacheeSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<PieceDetachee>('pieces_detachees', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'pieces_detachees', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
