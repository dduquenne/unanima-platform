import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Beneficiaire } from '../../../lib/types'
import { createBeneficiaireSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:beneficiaires') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['statut', 'consultant_id'])

  if (checkPermission(user.role, 'read:own') && !checkPermission(user.role, 'read:beneficiaires')) {
    filters['profile_id'] = user.id
  }

  const { data, count, error } = await fetchMany<Beneficiaire>('beneficiaires', {
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
  if (!checkPermission(user.role, 'write:beneficiaires')) return forbiddenResponse()

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createBeneficiaireSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Beneficiaire>('beneficiaires', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'beneficiaires', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
