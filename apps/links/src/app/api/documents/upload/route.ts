import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, insertOne, logAudit } from '@unanima/db'
import { cookies } from 'next/headers'
import type { Document } from '@/lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo

const DOCUMENT_TYPES = ['cv', 'lettre_motivation', 'synthese', 'attestation', 'autre'] as const

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:documents') && !checkPermission(user.role, 'write:own')) {
    return forbiddenResponse()
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const beneficiaireId = formData.get('beneficiaire_id') as string | null
  const bilanId = (formData.get('bilan_id') as string | null) || null
  const documentType = formData.get('type') as string | null

  if (!file) return validationErrorResponse('Fichier manquant')
  if (!beneficiaireId) return validationErrorResponse('beneficiaire_id requis')
  if (!documentType || !DOCUMENT_TYPES.includes(documentType as typeof DOCUMENT_TYPES[number])) {
    return validationErrorResponse('Type de document invalide')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return validationErrorResponse(
      'Type de fichier non autorisé. Formats acceptés : PDF, DOC, DOCX, JPG, PNG',
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return validationErrorResponse('Le fichier dépasse la taille maximale de 10 Mo')
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const ext = file.name.split('.').pop() ?? 'bin'
    const storagePath = `${beneficiaireId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return serverErrorResponse(`Erreur d'upload : ${uploadError.message}`)
    }

    const { data: doc, error: dbError } = await insertOne<Document>('documents', {
      beneficiaire_id: beneficiaireId,
      bilan_id: bilanId,
      nom: file.name,
      type: documentType,
      storage_path: storagePath,
      uploaded_by: user.id,
    })

    if (dbError) {
      await supabase.storage.from('documents').remove([storagePath])
      return serverErrorResponse(dbError.message)
    }

    await logAudit(user.id, 'upload', 'documents', doc!.id, {
      filename: file.name,
      size: file.size,
      type: documentType,
    })

    return NextResponse.json({ data: doc }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return serverErrorResponse(message)
  }
}
