import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Bilan } from '../../../../lib/types'
import { updateBilanSchema } from '../../../../lib/types'
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
  if (!checkPermission(user.role, 'read:bilans') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<Bilan>('bilans', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Bilan')

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:bilans')) return forbiddenResponse()

  const { id } = await params
  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateBilanSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<Bilan>('bilans', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Bilan')

  await logAudit(user.id, 'update', 'bilans', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:bilans')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('bilans', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'bilans', id)
  return new NextResponse(null, { status: 204 })
}
