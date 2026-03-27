import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/auth'

const MAX_PER_EMAIL = 3
const MAX_PER_IP = 10
const WINDOW_SECONDS = 3600 // 1 hour

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

  if (!email || typeof email !== 'string') {
    return NextResponse.json(
      { error: 'Adresse e-mail requise' },
      { status: 400 }
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rateLimitOpts = { supabaseUrl, supabaseServiceRoleKey }

  // Check rate limit by email
  const emailCheck = await checkRateLimit(rateLimitOpts, {
    key: `reset:email:${email.toLowerCase()}`,
    maxRequests: MAX_PER_EMAIL,
    windowSeconds: WINDOW_SECONDS,
  })

  if (emailCheck.error || !emailCheck.allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(WINDOW_SECONDS) } }
    )
  }

  // Check rate limit by IP
  const ipCheck = await checkRateLimit(rateLimitOpts, {
    key: `reset:ip:${ip}`,
    maxRequests: MAX_PER_IP,
    windowSeconds: WINDOW_SECONDS,
  })

  if (ipCheck.error || !ipCheck.allowed) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(WINDOW_SECONDS) } }
    )
  }

  // Proceed with password reset via Supabase admin client
  const supabase = createAdminClient()

  // Build redirect URL for the reset callback
  const origin = request.headers.get('origin') ?? request.nextUrl.origin
  const redirectTo = `${origin}/auth/callback?next=/reset-password`

  await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  // Audit log (best effort — don't reveal if email exists)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (profile) {
    await supabase.from('audit_logs').insert({
      user_id: profile.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity_type: 'auth',
      entity_id: profile.id,
      details: { email: email.toLowerCase() },
      ip_address: ip,
    })
  }

  // Always return success to avoid email enumeration
  return NextResponse.json({
    message: 'Si un compte existe avec cette adresse, un e-mail a été envoyé.',
  })
}
