import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'

// Mock environment
vi.stubEnv('RESEND_API_KEY', 'test-key')
vi.stubEnv('EMAIL_FROM', 'Test <noreply@unanima.fr>')

// Mock Resend
const mockSend = vi.fn()
const mockBatchSend = vi.fn()

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
    batch: { send: mockBatchSend },
  })),
}))

// Need to import after mocks
import { sendEmail, sendBatch } from '../send'

const MockTemplate = () => createElement('div', null, 'Test')

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends an email successfully', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg-1' }, error: null })

    const result = await sendEmail({
      to: 'user@test.com',
      subject: 'Hello',
      template: createElement(MockTemplate),
      from: 'App <noreply@unanima.fr>',
    })

    expect(result.error).toBeNull()
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'App <noreply@unanima.fr>',
        to: ['user@test.com'],
        subject: 'Hello',
      })
    )
  })

  it('handles array of recipients', async () => {
    mockSend.mockResolvedValue({ data: { id: 'msg-2' }, error: null })

    await sendEmail({
      to: ['a@test.com', 'b@test.com'],
      subject: 'Hello',
      template: createElement(MockTemplate),
      from: 'App <noreply@unanima.fr>',
    })

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['a@test.com', 'b@test.com'],
      })
    )
  })

  it('rejects invalid email', async () => {
    const result = await sendEmail({
      to: 'invalid-email',
      subject: 'Hello',
      template: createElement(MockTemplate),
      from: 'App <noreply@unanima.fr>',
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Invalid email')
    expect(mockSend).not.toHaveBeenCalled()
  })

  it('rejects empty subject', async () => {
    const result = await sendEmail({
      to: 'valid@test.com',
      subject: '',
      template: createElement(MockTemplate),
      from: 'App <noreply@unanima.fr>',
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Invalid subject')
  })

  it('rejects unauthorized sender domain', async () => {
    const result = await sendEmail({
      to: 'valid@test.com',
      subject: 'Hello',
      template: createElement(MockTemplate),
      from: 'Evil <evil@malware.io>',
    })

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Unauthorized sender')
  })

  it('returns error from Resend API', async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Rate limited' },
    })

    const result = await sendEmail({
      to: 'valid@test.com',
      subject: 'Hello',
      template: createElement(MockTemplate),
      from: 'App <noreply@unanima.fr>',
    })

    expect(result.error?.message).toBe('Rate limited')
  })
})

describe('sendBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends batch emails successfully', async () => {
    mockBatchSend.mockResolvedValue({ data: [{ id: 'batch-1' }], error: null })

    const result = await sendBatch([
      {
        to: 'a@test.com',
        subject: 'Batch 1',
        template: createElement(MockTemplate),
        from: 'App <noreply@unanima.fr>',
      },
      {
        to: 'b@test.com',
        subject: 'Batch 2',
        template: createElement(MockTemplate),
        from: 'App <noreply@unanima.fr>',
      },
    ])

    expect(result.error).toBeNull()
    expect(mockBatchSend).toHaveBeenCalled()
  })

  it('rejects batch with invalid email', async () => {
    const result = await sendBatch([
      {
        to: 'invalid',
        subject: 'Test',
        template: createElement(MockTemplate),
        from: 'App <noreply@unanima.fr>',
      },
    ])

    expect(result.error).toBeInstanceOf(Error)
    expect(mockBatchSend).not.toHaveBeenCalled()
  })

  it('rejects batch with subject too long', async () => {
    const result = await sendBatch([
      {
        to: 'valid@test.com',
        subject: 'x'.repeat(256),
        template: createElement(MockTemplate),
        from: 'App <noreply@unanima.fr>',
      },
    ])

    expect(result.error).toBeInstanceOf(Error)
    expect(result.error?.message).toContain('Invalid subject')
  })
})
