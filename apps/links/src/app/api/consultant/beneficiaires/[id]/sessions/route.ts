import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@unanima/db'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { sendEmail } from '@unanima/email'
import { PlanificationEmail } from '@/lib/email/templates'

const bulkSessionSchema = z.array(
  z.object({
    session_number: z.number().int().min(1).max(6),
    scheduled_at: z.string().datetime({ offset: true }).nullable(),
    visio_url: z.string().url('URL de visioconférence invalide').nullable().optional(),
  })
).min(1).max(6)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beneficiaryId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Verify consultant role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'consultant') {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Verify consultant assignment
  const { data: beneficiary } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', beneficiaryId)
    .eq('consultant_id', user.id)
    .eq('role', 'beneficiaire')
    .single()

  if (!beneficiary) {
    return NextResponse.json(
      { error: 'Bénéficiaire non trouvé ou non assigné', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('session_number, scheduled_at, visio_url')
    .eq('beneficiary_id', beneficiaryId)
    .order('session_number', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  return NextResponse.json({ data: sessions ?? [] })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: beneficiaryId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié', code: 'UNAUTHORIZED' },
      { status: 401 }
    )
  }

  // Verify consultant role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'consultant') {
    return NextResponse.json(
      { error: 'Accès réservé aux consultants', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  // Verify consultant assignment
  const { data: beneficiary } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', beneficiaryId)
    .eq('consultant_id', user.id)
    .eq('role', 'beneficiaire')
    .single()

  if (!beneficiary) {
    return NextResponse.json(
      { error: 'Bénéficiaire non trouvé ou non assigné', code: 'FORBIDDEN' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body)) {
    return NextResponse.json(
      { error: 'Corps de requête invalide, tableau attendu', code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  const parsed = bulkSessionSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return NextResponse.json(
      { error: msg, code: 'VALIDATION_ERROR' },
      { status: 400 }
    )
  }

  // Fetch existing sessions to detect changes
  const { data: existingSessions } = await supabase
    .from('sessions')
    .select('session_number, scheduled_at')
    .eq('beneficiary_id', beneficiaryId)

  const existingByNumber = new Map(
    (existingSessions ?? []).map(s => [s.session_number, s.scheduled_at])
  )

  const now = new Date()
  for (const session of parsed.data) {
    if (session.scheduled_at !== null) {
      const scheduledDate = new Date(session.scheduled_at)
      const existingDate = existingByNumber.get(session.session_number)

      // Validate future date only for new or changed dates
      const isNewOrChanged = !existingDate || existingDate !== session.scheduled_at
      if (isNewOrChanged && scheduledDate <= now) {
        return NextResponse.json(
          { error: `Séance ${session.session_number} : la date doit être dans le futur`, code: 'VALIDATION_ERROR' },
          { status: 400 }
        )
      }
    }
  }

  // Upsert all sessions
  const upsertData = parsed.data.map(session => ({
    beneficiary_id: beneficiaryId,
    session_number: session.session_number,
    scheduled_at: session.scheduled_at,
    visio_url: session.visio_url ?? null,
  }))

  const { error } = await supabase
    .from('sessions')
    .upsert(upsertData, { onConflict: 'beneficiary_id,session_number' })

  if (error) {
    return NextResponse.json(
      { error: 'Erreur de sauvegarde', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }

  // H1: Send notification email to beneficiary (non-blocking)
  // Failure to send email must NOT prevent dates from being saved
  try {
    const { data: beneficiaryProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', beneficiaryId)
      .single()

    const { data: consultantProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (beneficiaryProfile && consultantProfile) {
      const hasExistingDates = existingByNumber.size > 0
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://links.unanima.fr'

      const { error: emailError } = await sendEmail({
        to: beneficiaryProfile.email,
        subject: hasExistingDates
          ? 'Mise à jour de votre planning de séances'
          : 'Vos séances de bilan ont été planifiées',
        template: PlanificationEmail({
          beneficiaireName: beneficiaryProfile.full_name,
          consultantName: consultantProfile.full_name,
          sessions: parsed.data.map((s) => ({
            session_number: s.session_number,
            scheduled_at: s.scheduled_at,
          })),
          isUpdate: hasExistingDates,
          dashboardUrl: `${baseUrl}/dashboard`,
        }),
        from: process.env.EMAIL_FROM_LINKS ?? 'bilan@links-accompagnement.com',
      })

      if (emailError) {
        // Log failure but do not block response
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'email_planification_error',
          entity_type: 'session',
          entity_id: beneficiaryId,
          details: { error: emailError.message },
        })
      }
    }
  } catch {
    // Email failure is non-blocking — dates are already saved
  }

  return NextResponse.json({ data: { success: true, count: upsertData.length } })
}
