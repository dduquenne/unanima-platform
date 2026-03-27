import type { ReactElement } from 'react'
import { getResendClient } from './client'
import { validateEmails, validateSubject, validateFrom } from './validate'

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

const DEFAULT_FROM = "Link's Accompagnement <noreply@links-accompagnement.fr>"

export async function sendEmail({
  to,
  subject,
  template,
  from = DEFAULT_FROM,
}: SendEmailOptions): Promise<{ error: Error | null }> {
  try {
    const recipients = Array.isArray(to) ? to : [to]
    validateEmails(recipients)
    validateSubject(subject)
    validateFrom(from)
  } catch (err) {
    return { error: err as Error }
  }

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
  try {
    for (const email of emails) {
      const recipients = Array.isArray(email.to) ? email.to : [email.to]
      validateEmails(recipients)
      validateSubject(email.subject)
      validateFrom(email.from ?? DEFAULT_FROM)
    }
  } catch (err) {
    return { error: err as Error }
  }

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
