import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Etablissement } from '../../../lib/types'
import { createEtablissementSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:etablissements') && !checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['type', 'statut'])

  const { data, count, error } = await fetchMany<Etablissement>('etablissements', {
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
  if (!checkPermission(user.role, 'write:etablissements')) return forbiddenResponse()

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createEtablissementSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Etablissement>('etablissements', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'etablissements', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
