import { describe, it, expect } from 'vitest'
import { ResetPasswordEmail, WelcomeEmail, NotificationEmail } from '../index'

describe('email templates', () => {
  it('exports ResetPasswordEmail', () => {
    expect(ResetPasswordEmail).toBeDefined()
    expect(typeof ResetPasswordEmail).toBe('function')
  })

  it('exports WelcomeEmail', () => {
    expect(WelcomeEmail).toBeDefined()
    expect(typeof WelcomeEmail).toBe('function')
  })

  it('exports NotificationEmail', () => {
    expect(NotificationEmail).toBeDefined()
    expect(typeof NotificationEmail).toBe('function')
  })
})
