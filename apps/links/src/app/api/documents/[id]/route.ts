import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, deleteOne, logAudit } from '@unanima/db'
import type { Document } from '../../../../lib/types'
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
  if (!checkPermission(user.role, 'read:documents') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<Document>('documents', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Document')

  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:beneficiaires')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('documents', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'documents', id)
  return new NextResponse(null, { status: 204 })
}
