'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface CookieBannerProps {
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

const COOKIE_CONSENT_KEY = 'unanima_cookie_consent'

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
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsVisible(false)
    onAccept?.()
  }, [onAccept])

  const handleReject = useCallback(() => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setIsVisible(false)
    onReject?.()
  }, [onReject])

  // Focus first button on mount
  useEffect(() => {
    if (!isVisible) return
    const timer = setTimeout(() => {
      const firstButton = bannerRef.current?.querySelector<HTMLElement>('button')
      firstButton?.focus()
    }, 100)
    return () => clearTimeout(timer)
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
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white p-4 shadow-lg ${className ?? ''}`}
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
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-background)] transition-colors"
          >
            Refuser
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
