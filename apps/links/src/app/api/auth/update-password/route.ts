import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@unanima/db'

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{8,}$/

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Configuration manquante' },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const password = body?.password

  if (!password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Mot de passe requis.' },
      { status: 400 }
    )
  }

  if (!PASSWORD_REGEX.test(password)) {
    return NextResponse.json(
      { error: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre.' },
      { status: 400 }
    )
  }

  // Create a server client to get the authenticated user (from the recovery session)
  const response = NextResponse.json({ success: true })
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Session invalide ou expirée. Faites une nouvelle demande.' },
      { status: 401 }
    )
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password,
  })

  if (updateError) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du mot de passe.' },
      { status: 500 }
    )
  }

  // Audit log
  const adminClient = createAdminClient()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'PASSWORD_RESET_COMPLETED',
    entity_type: 'auth',
    entity_id: user.id,
    details: { email: user.email },
    ip_address: ip,
  })

  // Sign out all sessions after password change
  await adminClient.auth.admin.signOut(user.id, 'global')

  return NextResponse.json({ success: true })
}
