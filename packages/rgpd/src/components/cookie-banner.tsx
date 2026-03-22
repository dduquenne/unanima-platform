'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CookieBannerProps {
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

const COOKIE_CONSENT_KEY = 'unanima_cookie_consent'
const SESSION_ID_KEY = 'unanima_session_id'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

async function persistConsentServer(categories: { necessary: boolean; analytics: boolean; marketing: boolean }) {
  try {
    await fetch('/api/rgpd/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        categories,
      }),
    })
  } catch {
    // Silent fail — localStorage remains the fallback
  }
}

export function CookieBanner({ onAccept, onReject, className }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = useCallback(() => {
    const categories = { necessary: true, analytics: true, marketing: true }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(categories))
    setIsVisible(false)
    persistConsentServer(categories)
    onAccept?.()
  }, [onAccept])

  const handleReject = useCallback(() => {
    const categories = { necessary: true, analytics: false, marketing: false }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(categories))
    setIsVisible(false)
    persistConsentServer(categories)
    onReject?.()
  }, [onReject])

  // Focus first button on mount
  useEffect(() => {
    if (!isVisible) return
    const rafId = requestAnimationFrame(() => {
      const firstButton = bannerRef.current?.querySelector<HTMLElement>('button')
      firstButton?.focus()
    })
    return () => cancelAnimationFrame(rafId)
  }, [isVisible])

  // Focus trap + Escape
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleReject()
        return
      }

      if (e.key !== 'Tab') return

      const focusableElements = bannerRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusableElements || focusableElements.length === 0) return

      const first = focusableElements[0] as HTMLElement | undefined
      const last = focusableElements[focusableElements.length - 1] as HTMLElement | undefined
      if (!first || !last) return

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleReject])

  if (!isVisible) return null

  return (
    <div
      ref={bannerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface,#fff)] p-4 shadow-lg ${className ?? ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Consentement cookies"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text)]">
          Ce site utilise des cookies pour améliorer votre expérience. En continuant à naviguer,
          vous acceptez leur utilisation.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            className={[
              'rounded-[var(--radius-md,0.5rem)]',
              'border border-[var(--color-border)] px-4 py-2 text-sm font-medium',
              'text-[var(--color-text)]',
              'hover:bg-[var(--color-surface-hover,var(--color-background))]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
              'transition-colors duration-150',
            ].join(' ')}
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className={[
              'rounded-[var(--radius-md,0.5rem)]',
              'bg-[var(--color-primary)] px-4 py-2 text-sm font-medium',
              'text-[var(--color-text-inverse,#fff)]',
              'hover:bg-[var(--color-primary-dark)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
              'transition-colors duration-150',
            ].join(' ')}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
