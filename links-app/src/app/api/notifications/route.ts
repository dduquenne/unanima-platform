import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { logAudit } from '@/lib/supabase'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  serverErrorResponse,
} from '@/lib/api/utils'
import {
  NewBeneficiaireEmail,
  CompletionReminderEmail,
  BilanCompleteEmail,
} from '@/lib/email/templates'

type NotificationType = 'new_beneficiaire' | 'completion_reminder' | 'bilan_complete'

interface NotificationPayload {
  type: NotificationType
  to: string
  data: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'write:bilans') && !checkPermission(user.role, 'write:own')) {
    return forbiddenResponse()
  }

  let body: NotificationPayload
  try {
    body = await request.json()
  } catch {
    return validationErrorResponse('Corps de requête invalide')
  }

  const { type, to, data } = body
  if (!type || !to || !data) {
    return validationErrorResponse('type, to et data sont requis')
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://links.unanima.fr'

  try {
    let subject: string
    let template: React.ReactElement

    switch (type) {
      case 'new_beneficiaire':
        subject = `Nouveau bénéficiaire assigné : ${data.beneficiaireName}`
        template = NewBeneficiaireEmail({
          consultantName: data.consultantName as string,
          beneficiaireName: data.beneficiaireName as string,
          dashboardUrl: `${baseUrl}/dashboard`,
        })
        break

      case 'completion_reminder':
        subject = `Rappel : complétez votre questionnaire (J-${data.daysRemaining})`
        template = CompletionReminderEmail({
          beneficiaireName: data.beneficiaireName as string,
          bilanType: data.bilanType as string,
          daysRemaining: data.daysRemaining as number,
          questionnaireUrl: `${baseUrl}/bilans/${data.bilanId}`,
        })
        break

      case 'bilan_complete':
        subject = `Bilan terminé — ${data.beneficiaireName}`
        template = BilanCompleteEmail({
          recipientName: data.recipientName as string,
          beneficiaireName: data.beneficiaireName as string,
          bilanType: data.bilanType as string,
          completedDate: data.completedDate as string,
          bilanUrl: `${baseUrl}/bilans/${data.bilanId}`,
        })
        break

      default:
        return validationErrorResponse(`Type de notification inconnu : ${type}`)
    }

    const { error } = await sendEmail({ to, subject, template })
    if (error) {
      return serverErrorResponse(`Erreur d'envoi : ${error.message}`)
    }

    await logAudit(user.id, 'send_email', 'notifications', undefined, {
      type,
      to,
      subject,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return serverErrorResponse(message)
  }
}
