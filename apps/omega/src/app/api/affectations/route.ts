import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Affectation } from '../../../lib/types'
import { createAffectationSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'write:affectations') && !checkPermission(user.role, 'read:interventions')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['intervention_id', 'technicien_id'])

  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'write:affectations')) {
    filters['technicien_id'] = user.id
  }

  const { data, count, error } = await fetchMany<Affectation>('affectations', {
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
  if (!checkPermission(user.role, 'write:affectations') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createAffectationSchema, {
    ...body,
    responsable_id: user.id,
  })
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Affectation>('affectations', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'affectations', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
