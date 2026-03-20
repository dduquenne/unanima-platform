import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, deleteOne, logAudit } from '@unanima/db'
import type { Affectation } from '../../../../lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '../../../../lib/api/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const { data, error } = await fetchOne<Affectation>('affectations', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Affectation')

  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'write:affectations')) {
    if (data.technicien_id !== user.id) return forbiddenResponse()
  }

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('affectations', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'affectations', id)
  return new NextResponse(null, { status: 204 })
}
