import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import ReactPDF from '@react-pdf/renderer'
import { SessionNotesPDF } from './pdf-template'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Verify consultant or super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'consultant' && profile.role !== 'super_admin')) {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body?.beneficiary_id) {
    return NextResponse.json(
      { error: 'beneficiary_id requis', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { beneficiary_id } = body

  // Verify assignment (consultant must be assigned, super_admin can access all)
  const beneficiaryQuery = supabase
    .from('profiles')
    .select('id, full_name, email, date_debut_bilan, created_at')
    .eq('id', beneficiary_id)
    .eq('role', 'beneficiaire')

  if (profile.role === 'consultant') {
    beneficiaryQuery.eq('consultant_id', user.id)
  }

  const { data: beneficiary } = await beneficiaryQuery.single()

  if (!beneficiary) {
    return NextResponse.json(
      { error: 'Bénéficiaire non trouvé ou non assigné', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Fetch session notes
  const { data: notes } = await supabase
    .from('session_notes')
    .select('session_number, content, updated_at')
    .eq('beneficiary_id', beneficiary_id)
    .order('session_number', { ascending: true })

  // Fetch sessions for dates
  const { data: sessions } = await supabase
    .from('sessions')
    .select('session_number, scheduled_at')
    .eq('beneficiary_id', beneficiary_id)
    .order('session_number', { ascending: true })

  // Build 6 session entries
  const sessionEntries = Array.from({ length: 6 }, (_, i) => {
    const num = i + 1
    const note = (notes ?? []).find(n => n.session_number === num)
    const session = (sessions ?? []).find(s => s.session_number === num)

    return {
      session_number: num,
      scheduled_at: session?.scheduled_at ?? null,
      content: note?.content ?? null,
      updated_at: note?.updated_at ?? null,
    }
  })

  // Generate PDF
  const pdfStream = await ReactPDF.renderToStream(
    SessionNotesPDF({
      beneficiaryName: beneficiary.full_name,
      consultantName: profile.full_name,
      exportDate: new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      sessions: sessionEntries,
    })
  )

  // Convert stream to buffer
  const chunks: Uint8Array[] = []
  for await (const chunk of pdfStream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const pdfBuffer = Buffer.concat(chunks)

  // Build filename: CR-NomPrenom-AAAAMMJJ.pdf
  const namePart = beneficiary.full_name.replace(/\s+/g, '')
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const filename = `CR-${namePart}-${datePart}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
