const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_EMAIL_LENGTH = 254
const MAX_SUBJECT_LENGTH = 255
const ALLOWED_FROM_DOMAINS = ['links-accompagnement.fr']

export function validateEmail(email: string): void {
  if (!email || email.length > MAX_EMAIL_LENGTH) {
    throw new Error(`Invalid email address: "${email}" (must be 1-${MAX_EMAIL_LENGTH} chars)`)
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error(`Invalid email format: "${email}"`)
  }
}

export function validateEmails(emails: string[]): void {
  for (const email of emails) {
    validateEmail(email)
  }
}

export function validateSubject(subject: string): void {
  if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
    throw new Error(
      `Invalid subject: must be 1-${MAX_SUBJECT_LENGTH} characters (got ${subject?.length ?? 0})`
    )
  }
}

export function validateFrom(from: string): void {
  const match = from.match(/<([^>]+)>$/) ?? [null, from]
  const emailPart = match[1] ?? from
  const domain = emailPart.split('@')[1]?.toLowerCase()

  if (!domain || !ALLOWED_FROM_DOMAINS.includes(domain)) {
    throw new Error(
      `Unauthorized sender domain "${domain}". Allowed: ${ALLOWED_FROM_DOMAINS.join(', ')}`
    )
  }
}
