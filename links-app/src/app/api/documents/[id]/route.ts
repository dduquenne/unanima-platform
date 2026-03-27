import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  const { data: document, error } = await supabase
    .from('phase_documents')
    .select('id, phase_number, display_name, file_type, sort_order, filename, created_at')
    .eq('id', documentId)
    .single()

  if (error || !document) {
    return NextResponse.json(
      { error: 'Document non trouvé', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  return NextResponse.json({ data: document })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

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

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: 'Corps de requête invalide', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  const updateData: Record<string, unknown> = {}
  if (typeof body.display_name === 'string') updateData.display_name = body.display_name.trim()
  if (typeof body.sort_order === 'number') updateData.sort_order = body.sort_order

  const { data: updated, error } = await supabase
    .from('phase_documents')
    .update(updateData)
    .eq('id', documentId)
    .select('id, phase_number, display_name, file_type, sort_order')
    .single()

  if (error || !updated) {
    return NextResponse.json(
      { error: 'Erreur de mise à jour', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

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

  // Fetch document to get storage path
  const { data: document } = await supabase
    .from('phase_documents')
    .select('id, storage_path, display_name, phase_number')
    .eq('id', documentId)
    .single()

  if (!document) {
    return NextResponse.json(
      { error: 'Document non trouvé', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  // Atomic deletion: Storage + BDD
  const adminClient = createAdminClient()

  const { error: storageError } = await adminClient.storage
    .from('phase-documents')
    .remove([document.storage_path])

  if (storageError) {
    return NextResponse.json(
      { error: 'Erreur suppression Storage', code: 'STORAGE_ERROR' },
      { status: 500 },
    )
  }

  const { error: dbError } = await supabase
    .from('phase_documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    return NextResponse.json(
      { error: 'Erreur suppression base de données', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'DOCUMENT_DELETED',
    entity_type: 'phase_document',
    entity_id: documentId,
    details: { display_name: document.display_name, phase_number: document.phase_number },
  })

  return NextResponse.json({ data: { success: true, deleted_id: documentId } })
}
