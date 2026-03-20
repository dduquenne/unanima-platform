import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, updateOne, deleteOne, logAudit } from '@unanima/db'
import type { Beneficiaire } from '../../../../lib/types'
import { updateBeneficiaireSchema } from '../../../../lib/types'
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
  if (!checkPermission(user.role, 'read:beneficiaires') && !checkPermission(user.role, 'read:own')) {
    return forbiddenResponse()
  }

  const { id } = await params
  const { data, error } = await fetchOne<Beneficiaire>('beneficiaires', id)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Bénéficiaire')

  if (checkPermission(user.role, 'read:own') && !checkPermission(user.role, 'read:beneficiaires')) {
    if (data.profile_id !== user.id) return forbiddenResponse()
  }

  return NextResponse.json({ data })
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:beneficiaires')) return forbiddenResponse()

  const { id } = await params
  const body = await request.json()
  const { data: parsed, error: parseError } = parseBody(updateBeneficiaireSchema, body)
  if (parseError) return validationErrorResponse(parseError)

  const { data, error } = await updateOne<Beneficiaire>('beneficiaires', id, parsed!)
  if (error) return serverErrorResponse(error.message)
  if (!data) return notFoundResponse('Bénéficiaire')

  await logAudit(user.id, 'update', 'beneficiaires', id, parsed!)
  return NextResponse.json({ data })
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:beneficiaires')) return forbiddenResponse()

  const { id } = await params
  const { error } = await deleteOne('beneficiaires', id)
  if (error) return serverErrorResponse(error.message)

  await logAudit(user.id, 'delete', 'beneficiaires', id)
  return new NextResponse(null, { status: 204 })
}
