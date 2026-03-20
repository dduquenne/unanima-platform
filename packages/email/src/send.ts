import type { ReactElement } from 'react'
import { getResendClient } from './client'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: ReactElement
  from?: string
}

interface BatchEmail {
  to: string | string[]
  subject: string
  template: ReactElement
  from?: string
}

const DEFAULT_FROM = process.env.EMAIL_FROM ?? 'Unanima <noreply@unanima.fr>'

export async function sendEmail({
  to,
  subject,
  template,
  from = DEFAULT_FROM,
}: SendEmailOptions): Promise<{ error: Error | null }> {
  const resend = getResendClient()

  const { error } = await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    react: template,
  })

  return { error: error ? new Error(error.message) : null }
}

export async function sendBatch(
  emails: BatchEmail[],
): Promise<{ error: Error | null }> {
  const resend = getResendClient()

  const { error } = await resend.batch.send(
    emails.map(({ to, subject, template, from = DEFAULT_FROM }) => ({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react: template,
    })),
  )

  return { error: error ? new Error(error.message) : null }
}
