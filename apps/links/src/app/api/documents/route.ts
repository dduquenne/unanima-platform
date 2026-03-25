import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'
import { simulationDocuments, getDocumentsForPhase } from '@/lib/simulation/fixtures'

export async function GET(request: NextRequest) {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const phaseNumber = request.nextUrl.searchParams.get('phase_number')
    const docs = phaseNumber
      ? getDocumentsForPhase(Number(phaseNumber))
      : simulationDocuments
    return NextResponse.json({
      data: docs.map((d) => ({
        id: d.id,
        phase_number: d.phase_number,
        display_name: d.display_name,
        file_type: d.file_type,
        sort_order: d.sort_order,
      })),
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

  const phaseNumber = request.nextUrl.searchParams.get('phase_number')

  let query = supabase
    .from('phase_documents')
    .select('id, phase_number, display_name, file_type, sort_order')
    .order('sort_order', { ascending: true })

  if (phaseNumber) {
    query = query.eq('phase_number', Number(phaseNumber))
  }

  const { data: documents, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 },
    )
  }

  return NextResponse.json({ data: documents ?? [] })
}
