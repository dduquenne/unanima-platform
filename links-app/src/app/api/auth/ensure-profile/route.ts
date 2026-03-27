import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { isSimulationMode } from '@/lib/simulation/config'

export async function POST() {
  // ── Mode Simulation — profil fictif toujours existant ──
  if (isSimulationMode()) {
    return NextResponse.json({ status: 'exists' })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Configuration manquante' },
      { status: 500 },
    )
  }

  // Récupérer l'utilisateur authentifié via les cookies de session
  const cookieStore = await cookies()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Route handler en lecture seule — pas besoin d'écrire les cookies
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Vérifier si le profil existe déjà
  const admin = createAdminClient()
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json({ status: 'exists' })
  }

  // Créer le profil manquant avec le client admin (bypass RLS)
  const { error } = await admin.from('profiles').insert({
    id: user.id,
    email: user.email ?? '',
    full_name:
      (user.user_metadata?.full_name as string) ??
      user.email?.split('@')[0] ??
      '',
    role: (user.user_metadata?.role as string) ?? 'beneficiaire',
    is_active: true,
    metadata: {},
  })

  if (error) {
    // ON CONFLICT (id) DO NOTHING côté trigger — l'erreur
    // de conflit de clé unique est acceptable (race condition)
    if (error.code === '23505') {
      return NextResponse.json({ status: 'exists' })
    }
    return NextResponse.json(
      { error: 'Erreur lors de la création du profil' },
      { status: 500 },
    )
  }

  return NextResponse.json({ status: 'created' })
}
