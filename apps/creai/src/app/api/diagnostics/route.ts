import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Diagnostic } from '../../../lib/types'
import { createDiagnosticSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['statut', 'etablissement_id', 'auteur_id'])

  if (checkPermission(user.role, 'read:own') && !checkPermission(user.role, 'read:all')) {
    filters['auteur_id'] = user.id
  }

  const { data, count, error } = await fetchMany<Diagnostic>('diagnostics', {
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
  const { data: parsed, error: parseError } = parseBody(createDiagnosticSchema, {
    ...body,
    auteur_id: user.id,
  })
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Diagnostic>('diagnostics', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'diagnostics', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
