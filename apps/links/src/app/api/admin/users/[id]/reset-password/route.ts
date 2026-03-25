import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@unanima/db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function POST(
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

  // Verify target user exists
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .eq('id', userId)
    .single()

  if (!targetProfile) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Generate new temporary password
  const temporaryPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12)

  // Update password via admin client
  const adminClient = createAdminClient()
  const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
  })

  if (updateError) {
    return NextResponse.json(
      { error: `Erreur réinitialisation : ${updateError.message}`, code: 'AUTH_ERROR' },
      { status: 500 }
    )
  }

  // Audit log
  await adminClient.from('audit_logs').insert({
    user_id: user.id,
    action: 'PASSWORD_RESET_BY_ADMIN',
    entity_type: 'profile',
    entity_id: userId,
    details: { target_email: targetProfile.email },
  })

  return NextResponse.json({
    data: {
      email: targetProfile.email,
      temporary_password: temporaryPassword,
    },
  })
}
