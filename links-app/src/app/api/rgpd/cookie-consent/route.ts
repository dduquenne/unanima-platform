import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

interface CookieConsentBody {
  sessionId: string
  categories: {
    necessary: boolean
    analytics: boolean
    marketing: boolean
  }
}

export async function POST(request: NextRequest) {
  const body: CookieConsentBody | null = await request.json().catch(() => null)

  if (!body?.sessionId || !body.categories) {
    return NextResponse.json(
      { error: 'sessionId et categories requis' },
      { status: 400 }
    )
  }

  if (typeof body.categories.necessary !== 'boolean' ||
      typeof body.categories.analytics !== 'boolean' ||
      typeof body.categories.marketing !== 'boolean') {
    return NextResponse.json(
      { error: 'Format des catégories invalide' },
      { status: 400 }
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  const supabase = createAdminClient()

  const { error } = await supabase.from('cookie_consents').insert({
    session_id: body.sessionId,
    categories: body.categories,
    ip_address: ip,
    consented_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du consentement' },
      { status: 500 }
    )
  }

  return NextResponse.json({ message: 'Consentement enregistré' })
}
