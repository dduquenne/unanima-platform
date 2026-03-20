import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { PieceDetachee } from '../../../../lib/types'
import { updatePieceDetacheeSchema } from '../../../../lib/types'
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
  if (!checkPermission(user.role, 'read:pieces') && !checkPermission(user.role, 'read:all')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<PieceDetachee>('pieces_detachees', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Pièce détachée')

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const { id } = await params
  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updatePieceDetacheeSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<PieceDetachee>('pieces_detachees', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Pièce détachée')

  await logAudit(user.id, 'update', 'pieces_detachees', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('pieces_detachees', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'pieces_detachees', id)
  return new NextResponse(null, { status: 204 })
}
