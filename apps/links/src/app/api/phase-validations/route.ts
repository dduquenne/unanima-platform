import { NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json(
      { error: 'Profil non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Beneficiaire: own validations only
  const { data: validations, error } = await supabase
    .from('phase_validations')
    .select('phase_number, status, validated_at')
    .eq('beneficiary_id', user.id)
    .order('phase_number', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: validations ?? [] })
}
