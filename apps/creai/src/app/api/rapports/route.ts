import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Rapport } from '../../../lib/types'
import { createRapportSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:reports') && !checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['statut', 'diagnostic_id'])

  const { data, count, error } = await fetchMany<Rapport>('rapports', {
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
  if (!checkPermission(user.role, 'write:own') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createRapportSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Rapport>('rapports', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'rapports', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
