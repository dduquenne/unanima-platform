import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Rapport } from '../../../../lib/types'
import { updateRapportSchema } from '../../../../lib/types'
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
  if (!checkPermission(user.role, 'read:reports') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<Rapport>('rapports', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Rapport')

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateRapportSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<Rapport>('rapports', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Rapport')

  await logAudit(user.id, 'update', 'rapports', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('rapports', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'rapports', id)
  return new NextResponse(null, { status: 204 })
}
