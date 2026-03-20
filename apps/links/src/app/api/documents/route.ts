import { NextRequest, NextResponse } from 'next/server'
import { fetchMany, insertOne, logAudit } from '@unanima/db'
import type { Document } from '../../../lib/types'
import { createDocumentSchema } from '../../../lib/types'
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
  if (!checkPermission(user.role, 'read:documents') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { page, limit, sort, order } = getPaginationParams(request)
  const filters = getFilters(request, ['beneficiaire_id', 'bilan_id', 'type'])

  const { data, count, error } = await fetchMany<Document>('documents', {
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
  if (!checkPermission(user.role, 'read:documents') && !checkPermission(user.role, 'write:own')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(createDocumentSchema, {
    ...body,
    uploaded_by: user.id,
  })
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await insertOne<Document>('documents', parsed!)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'create', 'documents', data!.id)
  return NextResponse.json({ data }, { status: 201 })
}
