import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { updateUserSchema } from '@/lib/types/schemas'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params
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
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, consultant_id, date_debut_bilan, date_fin_bilan, metadata, created_at, updated_at')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  return NextResponse.json({ data: profile })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params
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
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'super_admin') {
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

  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json(
      { error: msg, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const updateData = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  }

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId)
    .select('id, email, full_name, role, is_active, consultant_id, date_debut_bilan, date_fin_bilan, updated_at')
    .single()

  if (error || !updated) {
    return NextResponse.json(
      { error: 'Erreur de mise à jour', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: updated })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params
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
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminProfile || adminProfile.role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Accès réservé aux administrateurs', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Prevent self-deletion
  if (userId === user.id) {
    return NextResponse.json(
      { error: 'Impossible de supprimer votre propre compte', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Verify user exists
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('id', userId)
    .single()

  if (!targetProfile) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Log RGPD deletion in audit log before deleting
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action: 'rgpd_delete',
    entity_type: 'profile',
    entity_id: userId,
    details: { deleted_email: targetProfile.email },
  })

  // Delete profile (CASCADE will handle related data)
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) {
    return NextResponse.json(
      { error: 'Erreur de suppression du profil', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // Delete auth user via admin client
  const adminClient = createAdminClient()
  const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

  if (authError) {
    return NextResponse.json(
      { error: 'Profil supprimé mais erreur de suppression du compte auth', code: 'PARTIAL_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: { success: true, deleted_id: userId } })
}
