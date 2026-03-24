import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@unanima/db'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Configuration manquante' },
      { status: 500 }
    )
  }

  const response = NextResponse.json({ success: true })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          })
        })
      },
    },
  })

  // Get current user for audit log before signing out
  const { data: { user } } = await supabase.auth.getUser()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  // Sign out — invalidates refresh token server-side
  await supabase.auth.signOut()

  // Audit log
  if (user) {
    try {
      const adminClient = createAdminClient()
      await adminClient.from('audit_logs').insert({
        user_id: user.id,
        action: 'LOGOUT',
        entity_type: 'auth',
        entity_id: user.id,
        details: { email: user.email },
        ip_address: ip,
      })
    } catch {
      // Best effort — don't fail logout because of audit
    }
  }

  // Clear all Supabase auth cookies explicitly
  const cookieNames = request.cookies.getAll()
    .filter(c => c.name.startsWith('sb-'))
    .map(c => c.name)

  for (const name of cookieNames) {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  }

  return response
}
