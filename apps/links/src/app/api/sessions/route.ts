import { NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'
import { getSimulationUser } from '@/lib/simulation/handlers'
import { getSessionsForBeneficiary } from '@/lib/simulation/fixtures'

export async function GET() {
  // ── Mode Simulation ──
  if (isSimulationMode()) {
    const simUser = await getSimulationUser()
    const sessions = getSessionsForBeneficiary(simUser.id)
    return NextResponse.json({
      data: sessions.map((s) => ({
        session_number: s.session_number,
        scheduled_at: s.scheduled_at,
        visio_url: s.visio_url,
      })),
    })
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('session_number, scheduled_at, visio_url')
    .eq('beneficiary_id', user.id)
    .order('session_number', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: sessions ?? [] })
}
