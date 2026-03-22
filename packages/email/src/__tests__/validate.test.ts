import { describe, it, expect } from 'vitest'
import { validateEmail, validateEmails, validateSubject, validateFrom } from '../validate'

describe('validateEmail', () => {
  it('accepts valid email addresses', () => {
    expect(() => validateEmail('user@example.com')).not.toThrow()
    expect(() => validateEmail('name+tag@domain.co')).not.toThrow()
  })

  it('rejects empty string', () => {
    expect(() => validateEmail('')).toThrow('Invalid email address')
  })

  it('rejects email without @', () => {
    expect(() => validateEmail('invalid-email')).toThrow('Invalid email format')
  })

  it('rejects email without domain', () => {
    expect(() => validateEmail('user@')).toThrow('Invalid email format')
  })

  it('rejects email exceeding 254 chars', () => {
    const longEmail = 'a'.repeat(246) + '@test.com'
    expect(() => validateEmail(longEmail)).toThrow('Invalid email address')
  })
})

describe('validateEmails', () => {
  it('accepts an array of valid emails', () => {
    expect(() => validateEmails(['a@b.com', 'c@d.com'])).not.toThrow()
  })

  it('rejects if any email is invalid', () => {
    expect(() => validateEmails(['valid@test.com', 'bad'])).toThrow()
  })
})

describe('validateSubject', () => {
  it('accepts a normal subject', () => {
    expect(() => validateSubject('Welcome!')).not.toThrow()
  })

  it('rejects empty subject', () => {
    expect(() => validateSubject('')).toThrow('Invalid subject')
  })

  it('rejects subject exceeding 255 chars', () => {
    expect(() => validateSubject('x'.repeat(256))).toThrow('Invalid subject')
  })

  it('accepts subject of exactly 255 chars', () => {
    expect(() => validateSubject('x'.repeat(255))).not.toThrow()
  })
})

describe('validateFrom', () => {
  it('accepts allowed domain with display name', () => {
    expect(() => validateFrom('Unanima <noreply@unanima.fr>')).not.toThrow()
  })

  it('accepts allowed domain without display name', () => {
    expect(() => validateFrom('noreply@unanima.fr')).not.toThrow()
  })

  it('accepts links-accompagnement.fr domain', () => {
    expect(() => validateFrom('no-reply@links-accompagnement.fr')).not.toThrow()
  })

  it('rejects unauthorized domain', () => {
    expect(() => validateFrom('evil@hacker.com')).toThrow('Unauthorized sender domain')
  })

  it('rejects unauthorized domain with display name', () => {
    expect(() => validateFrom('Legit Name <evil@malware.io>')).toThrow('Unauthorized sender domain')
  })
})
