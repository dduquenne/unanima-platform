import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Diagnostic } from '../../../../lib/types'
import { updateDiagnosticSchema } from '../../../../lib/types'
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

  const { id } = await params
  const { data, error } = await fetchOne<Diagnostic>('diagnostics', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Diagnostic')

  if (checkPermission(user.role, 'read:own') && !checkPermission(user.role, 'read:all')) {
    if (data.auteur_id !== user.id) return forbiddenResponse()
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const { id } = await params
  const existing = await fetchOne<Diagnostic>('diagnostics', id)
  if (existing.error) return serverErrorResponse(existing.error.message)
  if (!existing.data) return notFoundResponse('Diagnostic')

  if (checkPermission(user.role, 'write:own') && !checkPermission(user.role, 'read:all')) {
    if (existing.data.auteur_id !== user.id) return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateDiagnosticSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<Diagnostic>('diagnostics', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Diagnostic')

  await logAudit(user.id, 'update', 'diagnostics', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('diagnostics', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'diagnostics', id)
  return new NextResponse(null, { status: 204 })
}
