import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@unanima/db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 Mo
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_DOCS_PER_PHASE = 3

function getFileType(mimeType: string): 'pdf' | 'docx' | null {
  if (mimeType === 'application/pdf') return 'pdf'
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  return null
}

export async function POST(request: NextRequest) {
  // ── Mode Simulation — succès simulé ──
  if (process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true') {
    return NextResponse.json({
      data: {
        id: 'sim-doc-upload',
        phase_number: 1,
        display_name: 'Document simulé',
        file_type: 'pdf',
        sort_order: 1,
      },
    })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // Verify super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' },
      { status: 403 },
    )
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json(
      { error: 'Données de formulaire invalides', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const file = formData.get('file') as File | null
  const phaseNumberStr = formData.get('phase_number') as string | null
  const displayName = formData.get('display_name') as string | null

  if (!file || !phaseNumberStr || !displayName) {
    return NextResponse.json(
      { error: 'Fichier, numéro de phase et nom d\'affichage requis', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const phaseNumber = parseInt(phaseNumberStr, 10)
  if (isNaN(phaseNumber) || phaseNumber < 1 || phaseNumber > 6) {
    return NextResponse.json(
      { error: 'Numéro de phase invalide (1-6)', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  // Validate file type
  const fileType = getFileType(file.type)
  if (!fileType || !ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Type de fichier non autorisé. Seuls .pdf et .docx sont acceptés.', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux. Taille maximale : 10 Mo.', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  // Check document count per phase (max 3)
  const { count, error: countError } = await supabase
    .from('phase_documents')
    .select('id', { count: 'exact', head: true })
    .eq('phase_number', phaseNumber)

  if (countError) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }

  if ((count ?? 0) >= MAX_DOCS_PER_PHASE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_DOCS_PER_PHASE} documents par phase atteint.`, code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  // Generate unique storage path
  const uniqueId = crypto.randomUUID()
  const extension = fileType === 'pdf' ? '.pdf' : '.docx'
  const storagePath = `phase-${phaseNumber}/${uniqueId}${extension}`

  // Upload to Supabase Storage via admin client
  const adminClient = createAdminClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await adminClient.storage
    .from('phase-documents')
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Erreur d'upload : ${uploadError.message}`, code: 'STORAGE_ERROR' },
      { status: 500 },
    )
  }

  // Get next sort_order
  const { data: maxOrder } = await supabase
    .from('phase_documents')
    .select('sort_order')
    .eq('phase_number', phaseNumber)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextOrder = (maxOrder?.sort_order ?? -1) + 1

  // Insert document metadata
  const { data: document, error: insertError } = await adminClient
    .from('phase_documents')
    .insert({
      phase_number: phaseNumber,
      filename: file.name,
      storage_path: storagePath,
      display_name: displayName.trim(),
      file_type: fileType,
      sort_order: nextOrder,
      uploaded_by: user.id,
    })
    .select('id, phase_number, display_name, file_type, sort_order')
    .single()

  if (insertError || !document) {
    // Rollback: delete uploaded file
    await adminClient.storage.from('phase-documents').remove([storagePath])
    return NextResponse.json(
      { error: 'Erreur de création du document', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'DOCUMENT_UPLOADED',
    entity_type: 'phase_document',
    entity_id: document.id,
    details: { phase_number: phaseNumber, display_name: displayName, file_type: fileType },
  })

  return NextResponse.json({ data: document }, { status: 201 })
}
