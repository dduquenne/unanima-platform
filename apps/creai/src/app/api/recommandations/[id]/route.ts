import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Recommandation } from '@/lib/types'
import { updateRecommandationSchema } from '@/lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  parseBody,
} from '@/lib/api/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const { data, error } = await fetchOne<Recommandation>('recommandations', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Recommandation')

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:etablissements')) return forbiddenResponse()

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateRecommandationSchema, body)
  if (parseError || !parsed) {
    return NextResponse.json({ error: parseError, code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const { data, error } = await updateOne<Recommandation>('recommandations', id, parsed)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Recommandation')

  await logAudit(user.id, 'update', 'recommandations', id)
  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:etablissements')) return forbiddenResponse()

  const { error } = await deleteOne('recommandations', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'recommandations', id)
  return new NextResponse(null, { status: 204 })
}
