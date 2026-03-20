import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Recommandation } from '@/lib/types'
import { createRecommandationSchema } from '@/lib/types'
import {
  getPaginationParams,
  getFilters,
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  parseBody,
} from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:etablissements') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['diagnostic_id', 'priorite', 'statut'])

  const { data, count, error } = await fetchMany<Recommandation>('recommandations', {
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
  if (!checkPermission(user.role, 'write:etablissements') && !checkPermission(user.role, 'write:own')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createRecommandationSchema, body)
  if (parseError || !parsed) {
    return NextResponse.json({ error: parseError, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data, error } = await insertOne<Recommandation>('recommandations', parsed)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'recommandations', data!.id)
  return NextResponse.json(data, { status: 201 })
}
