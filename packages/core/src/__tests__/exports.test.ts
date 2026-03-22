import { describe, it, expect } from 'vitest'
import {
  Button,
  Input,
  Textarea,
  Modal,
  Card,
  Badge,
  Spinner,
  Tabs,
  Accordion,
  Stepper,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonKPI,
  Toast,
  ToastProvider,
  ToastContext,
  ErrorPage,
  LoadingPage,
  NotFoundPage,
  useDebounce,
  useMediaQuery,
  useToast,
  fr,
  LabelsProvider,
  useLabels,
  cn,
  formatDate,
  formatRelativeTime,
  validateEmail,
} from '../index'

describe('Core package exports', () => {
  describe('components', () => {
    it.each([
      ['Button', Button],
      ['Input', Input],
      ['Textarea', Textarea],
      ['Modal', Modal],
      ['Card', Card],
      ['Badge', Badge],
      ['Spinner', Spinner],
      ['Tabs', Tabs],
      ['Accordion', Accordion],
      ['Stepper', Stepper],
      ['Skeleton', Skeleton],
      ['SkeletonCard', SkeletonCard],
      ['SkeletonTable', SkeletonTable],
      ['SkeletonKPI', SkeletonKPI],
      ['Toast', Toast],
      ['ToastProvider', ToastProvider],
      ['ErrorPage', ErrorPage],
      ['LoadingPage', LoadingPage],
      ['NotFoundPage', NotFoundPage],
      ['LabelsProvider', LabelsProvider],
    ])('exports %s', (_, component) => {
      expect(component).toBeDefined()
      expect(['function', 'object']).toContain(typeof component)
    })

    it('exports ToastContext', () => {
      expect(ToastContext).toBeDefined()
    })
  })

  describe('hooks', () => {
    it.each([
      ['useDebounce', useDebounce],
      ['useMediaQuery', useMediaQuery],
      ['useToast', useToast],
      ['useLabels', useLabels],
    ])('exports %s as a function', (_, hook) => {
      expect(typeof hook).toBe('function')
    })
  })

  describe('utilities', () => {
    it('exports cn', () => {
      expect(typeof cn).toBe('function')
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('exports formatDate', () => {
      expect(typeof formatDate).toBe('function')
    })

    it('exports formatRelativeTime', () => {
      expect(typeof formatRelativeTime).toBe('function')
    })

    it('exports validateEmail', () => {
      expect(typeof validateEmail).toBe('function')
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid')).toBe(false)
    })
  })

  describe('i18n', () => {
    it('exports French labels', () => {
      expect(fr).toBeDefined()
      expect(fr.loading).toBe('Chargement')
    })
  })
})
