import { describe, it, expect } from 'vitest'
import { Button, Card, Input, Textarea, Modal, Badge, Spinner } from '../index'

describe('core component exports', () => {
  it('exports Button component', () => {
    expect(Button).toBeDefined()
    expect(typeof Button).toBe('object') // forwardRef returns object
  })

  it('exports Card component', () => {
    expect(Card).toBeDefined()
    expect(typeof Card).toBe('function')
  })

  it('exports Input component', () => {
    expect(Input).toBeDefined()
    expect(typeof Input).toBe('object') // forwardRef
  })

  it('exports Textarea component', () => {
    expect(Textarea).toBeDefined()
    expect(typeof Textarea).toBe('object') // forwardRef
  })

  it('exports Modal component', () => {
    expect(Modal).toBeDefined()
    expect(typeof Modal).toBe('function')
  })

  it('exports Badge component', () => {
    expect(Badge).toBeDefined()
    expect(typeof Badge).toBe('function')
  })

  it('exports Spinner component', () => {
    expect(Spinner).toBeDefined()
    expect(typeof Spinner).toBe('function')
  })
})
