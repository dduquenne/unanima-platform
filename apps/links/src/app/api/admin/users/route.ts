import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { createUserSchema } from '@/lib/types/schemas'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
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
      { status: 403 }
    )
  }

  const { searchParams } = request.nextUrl
  const roleFilter = searchParams.get('role')
  const search = searchParams.get('search')
  const status = searchParams.get('status')

  let query = supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, consultant_id, date_debut_bilan, date_fin_bilan, created_at, updated_at')

  if (roleFilter) {
    query = query.eq('role', roleFilter)
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }

  query = query.order('created_at', { ascending: false })

  const { data: profiles, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // For beneficiaries, enrich with consultant info
  const consultantIds = [
    ...new Set(
      (profiles ?? [])
        .filter(p => p.consultant_id)
        .map(p => p.consultant_id as string)
    ),
  ]

  let consultantMap = new Map<string, { full_name: string; email: string }>()

  if (consultantIds.length > 0) {
    const { data: consultants } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', consultantIds)

    for (const c of consultants ?? []) {
      consultantMap.set(c.id, { full_name: c.full_name, email: c.email })
    }
  }

  const data = (profiles ?? []).map(p => ({
    ...p,
    consultant: p.consultant_id ? consultantMap.get(p.consultant_id) ?? null : null,
  }))

  return NextResponse.json({ data })
}

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

  // Verify super_admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: 'Corps de requête invalide', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json(
      { error: msg, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const { email, full_name, role, consultant_id } = parsed.data

  // Generate a random 12-character password
  const temporaryPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12)

  // Create auth user with admin client (service role)
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
  })

  if (authError) {
    return NextResponse.json(
      { error: `Erreur création compte : ${authError.message}`, code: 'AUTH_ERROR' },
      { status: 400 }
    )
  }

  const userId = authData.user.id

  // Create profile entry
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name,
      role,
      consultant_id: consultant_id ?? null,
      is_active: true,
    })

  if (profileError) {
    // Rollback: delete auth user if profile creation fails
    await adminClient.auth.admin.deleteUser(userId)
    return NextResponse.json(
      { error: 'Erreur création profil', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'USER_CREATED',
    entity_type: 'profile',
    entity_id: userId,
    details: { created_email: email, created_role: role },
  })

  return NextResponse.json({
    data: {
      user_id: userId,
      email,
      temporary_password: temporaryPassword,
    },
  }, { status: 201 })
}
