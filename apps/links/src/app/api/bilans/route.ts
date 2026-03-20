import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Bilan } from '../../../lib/types'
import { createBilanSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:bilans') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['statut', 'beneficiaire_id', 'type'])

  const { data, count, error } = await fetchMany<Bilan>('bilans', {
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
  if (!checkPermission(user.role, 'write:bilans')) return forbiddenResponse()

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createBilanSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Bilan>('bilans', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'bilans', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
