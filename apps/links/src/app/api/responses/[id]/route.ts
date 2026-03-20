import { NextRequest, NextResponse } from 'next/server'
import { getResponse, updateResponse, deleteResponse } from '@/lib/api'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
  parseBody,
} from '@/lib/api/utils'
import { updateResponseSchema } from '@/lib/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:bilans') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { data, error } = await getResponse(id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Réponse')

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:own') && !checkPermission(user.role, 'write:bilans')) {
    return forbiddenResponse()
  }

  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateResponseSchema, body)
  if (parseError || !parsed) {
    return NextResponse.json(
      { error: parseError, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const { data, error } = await updateResponse(id, parsed, user.id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Réponse')

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:own') && !checkPermission(user.role, 'write:bilans')) {
    return forbiddenResponse()
  }

  const { error } = await deleteResponse(id, user.id)
  if (error) return serverErrorResponse(error.message)

  return new NextResponse(null, { status: 204 })
}
