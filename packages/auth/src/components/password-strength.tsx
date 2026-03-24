'use client'

import { useMemo } from 'react'

type PasswordStrength = 'weak' | 'medium' | 'strong'

interface PasswordStrengthResult {
  strength: PasswordStrength
  label: string
}

const RULES = [
  { test: (p: string) => p.length >= 8, label: 'Au moins 8 caractères' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'Au moins 1 majuscule' },
  { test: (p: string) => /\d/.test(p), label: 'Au moins 1 chiffre' },
] as const

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (password.length < 8) return { strength: 'weak', label: 'Faible' }
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (hasUpper && hasDigit && hasSpecial && password.length >= 12) {
    return { strength: 'strong', label: 'Fort' }
  }
  if (hasUpper && hasDigit) {
    return { strength: 'medium', label: 'Moyen' }
  }
  return { strength: 'weak', label: 'Faible' }
}

export function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
}

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-[var(--color-danger)]',
  medium: 'bg-[var(--color-warning)]',
  strong: 'bg-[var(--color-success)]',
}

const STRENGTH_TEXT_COLORS: Record<PasswordStrength, string> = {
  weak: 'text-[var(--color-danger)]',
  medium: 'text-[var(--color-warning)]',
  strong: 'text-[var(--color-success)]',
}

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const { strength, label } = useMemo(() => getPasswordStrength(password), [password])

  if (password.length === 0) return null

  const segments = 3
  const filledSegments = strength === 'weak' ? 1 : strength === 'medium' ? 2 : 3

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary,var(--color-text-muted))]">
          Force du mot de passe
        </span>
        <span className={`text-xs font-semibold ${STRENGTH_TEXT_COLORS[strength]}`}>
          {label}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < filledSegments
                ? STRENGTH_COLORS[strength]
                : 'bg-[var(--color-border)]'
            }`}
          />
        ))}
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1 pt-1">
        {RULES.map((rule) => {
          const passed = rule.test(password)
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                passed
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-text-secondary,var(--color-text-muted))]'
              }`}
            >
              <svg
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${passed ? 'scale-100' : 'scale-90'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                {passed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                ) : (
                  <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" opacity={0.4} />
                )}
              </svg>
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
