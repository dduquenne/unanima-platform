import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@unanima/db'
import { cookies } from 'next/headers'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: documentId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  // Verify authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
  }

  // Fetch document metadata
  const { data: document, error: docError } = await supabase
    .from('phase_documents')
    .select('id, phase_number, filename, storage_path, display_name, file_type')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    return NextResponse.json(
      { error: 'Document non trouvé', code: 'NOT_FOUND' },
      { status: 404 },
    )
  }

  // Generate signed URL using admin client (Service Role Key — never exposed client-side)
  const adminClient = createAdminClient()
  const { data: signedData, error: signError } = await adminClient.storage
    .from('phase-documents')
    .createSignedUrl(document.storage_path, 3600) // 60 minutes

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json(
      {
        error: 'Impossible de générer le lien de téléchargement',
        code: 'STORAGE_ERROR',
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    data: {
      url: signedData.signedUrl,
      filename: document.display_name || document.filename,
      file_type: document.file_type,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
    },
  })
}
