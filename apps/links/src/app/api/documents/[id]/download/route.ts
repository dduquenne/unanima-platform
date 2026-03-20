import { NextRequest, NextResponse } from 'next/server'
import { fetchOne, createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import type { Document } from '@/lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/utils'

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
  const { data: doc, error } = await fetchOne<Document>('documents', id)
  if (error) return serverErrorResponse(error.message)
  if (!doc) return notFoundResponse('Document')

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const { data: signedData, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 60)

    if (signError || !signedData?.signedUrl) {
      return serverErrorResponse('Impossible de générer le lien de téléchargement')
    }

    return NextResponse.json({ url: signedData.signedUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return serverErrorResponse(message)
  }
}
