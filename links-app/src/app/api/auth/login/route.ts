import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 900 // 15 minutes

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Configuration manquante' },
      { status: 500 }
    )
  }

  const body = await request.json().catch(() => null)
  const email = body?.email
  const password = body?.password

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Email et mot de passe requis.' },
      { status: 400 }
    )
  }

  const normalizedEmail = email.toLowerCase().trim()
  const supabase = createAdminClient()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  // 1. Check if account is locked (graceful degradation: if RPC fails, skip lock check)
  const { data: lockCheck, error: lockError } = await supabase.rpc(
    'check_login_attempt',
    { attempt_email: normalizedEmail, max_attempts: MAX_ATTEMPTS, lockout_seconds: LOCKOUT_SECONDS }
  )

  if (lockError) {
    console.error('[auth/login] check_login_attempt RPC failed:', lockError.message)
    // Continue without brute-force protection rather than blocking all logins
  }

  if (!lockError && lockCheck?.locked) {
    // Log the locked attempt
    await supabase.from('audit_logs').insert({
      user_id: null,
      action: 'LOGIN_ATTEMPT_WHILE_LOCKED',
      entity_type: 'auth',
      entity_id: normalizedEmail,
      details: { email: normalizedEmail },
      ip_address: ip,
    })

    return NextResponse.json(
      {
        error: 'Compte temporairement verrouillé. Réessayez dans 15 minutes.',
        locked: true,
        attemptsRemaining: 0,
      },
      { status: 423 }
    )
  }

  // 2. Check if account is active
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (profile && !profile.is_active) {
    await supabase.from('audit_logs').insert({
      user_id: profile.id,
      action: 'LOGIN_DISABLED_ACCOUNT',
      entity_type: 'auth',
      entity_id: profile.id,
      details: { email: normalizedEmail },
      ip_address: ip,
    })

    return NextResponse.json(
      {
        error: "Ce compte a été désactivé. Contactez votre consultant ou l'administrateur.",
        disabled: true,
      },
      { status: 403 }
    )
  }

  // 3. Attempt authentication via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (authError || !authData.user) {
    // Increment failure counter
    const { data: failResult } = await supabase.rpc('increment_login_failure', {
      attempt_email: normalizedEmail,
      lockout_seconds: LOCKOUT_SECONDS,
    })

    const isNowLocked = failResult?.locked === true
    const currentCount = failResult?.count ?? 1
    const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - currentCount)

    // Audit log
    const auditAction = isNowLocked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAILURE'
    const auditDetails: Record<string, unknown> = { email: normalizedEmail }
    if (isNowLocked) {
      auditDetails.duration_minutes = 15
    }

    await supabase.from('audit_logs').insert({
      user_id: profile?.id ?? null,
      action: auditAction,
      entity_type: 'auth',
      entity_id: profile?.id ?? normalizedEmail,
      details: auditDetails,
      ip_address: ip,
    })

    if (isNowLocked) {
      return NextResponse.json(
        {
          error: 'Compte temporairement verrouillé. Réessayez dans 15 minutes.',
          locked: true,
          attemptsRemaining: 0,
        },
        { status: 423 }
      )
    }

    return NextResponse.json(
      {
        error: `Identifiants incorrects. Il vous reste ${attemptsRemaining} tentative(s).`,
        locked: false,
        attemptsRemaining,
      },
      { status: 401 }
    )
  }

  // 4. Login successful — reset attempts counter
  await supabase.rpc('reset_login_attempts', { attempt_email: normalizedEmail })

  // Fetch role for redirect (from profile or auth metadata)
  const role =
    profile?.role ??
    (authData.user.user_metadata?.role as string | undefined) ??
    'beneficiaire'

  // Audit log success
  await supabase.from('audit_logs').insert({
    user_id: authData.user.id,
    action: 'LOGIN_SUCCESS',
    entity_type: 'auth',
    entity_id: authData.user.id,
    details: { email: normalizedEmail, role },
    ip_address: ip,
  })

  // Return the session tokens for the client to set
  return NextResponse.json({
    success: true,
    role,
    session: {
      access_token: authData.session?.access_token,
      refresh_token: authData.session?.refresh_token,
    },
  })
}
