import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Etablissement } from '../../../../lib/types'
import { updateEtablissementSchema } from '../../../../lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseBody,
} from '../../../../lib/api/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:etablissements') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<Etablissement>('etablissements', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Établissement')

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:etablissements')) return forbiddenResponse()

  const { id } = await params
  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateEtablissementSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<Etablissement>('etablissements', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Établissement')

  await logAudit(user.id, 'update', 'etablissements', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:etablissements')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('etablissements', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'etablissements', id)
  return new NextResponse(null, { status: 204 })
}
