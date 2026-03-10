'use client'

import { useState, useEffect } from 'react'

interface CookieBannerProps {
  onAccept?: () => void
  onReject?: () => void
  className?: string
}

const COOKIE_CONSENT_KEY = 'unanima_cookie_consent'

export function CookieBanner({ onAccept, onReject, className }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setIsVisible(false)
    onAccept?.()
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    setIsVisible(false)
    onReject?.()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-white p-4 shadow-lg ${className ?? ''}`}
      role="alert"
      aria-live="polite"
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
