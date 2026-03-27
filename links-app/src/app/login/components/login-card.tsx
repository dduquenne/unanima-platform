'use client'

import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { FormEvent } from 'react'

interface LoginCardProps {
  email: string
  password: string
  showPassword: boolean
  error: string | null
  urlError: string | null
  isLocked: boolean
  isSubmitting: boolean
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onTogglePassword: () => void
  onSubmit: (e: FormEvent) => void
  onForgotPassword: () => void
}

export function LoginCard({
  email,
  password,
  showPassword,
  error,
  urlError,
  isLocked,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
}: LoginCardProps) {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maxWidth: 460,
        borderRadius: 20,
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 16px 40px rgba(212, 149, 106, 0.10)',
      }}
    >
      <div style={{ padding: '40px 36px 32px' }}>
        {/* Welcome icon */}
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: '#FFF3EB' }}>
          <span className="text-xl" role="img" aria-hidden="true">👋</span>
        </div>

        {/* Heading */}
        <h2
          className="text-center font-bold"
          style={{ fontSize: 28, color: '#1A2332', letterSpacing: -0.3 }}
        >
          Bienvenue
        </h2>
        <p
          className="mt-1.5 text-center"
          style={{ fontSize: 15, color: '#8492A6' }}
        >
          Bienvenue sur votre espace personnel
        </p>

        {/* Separator */}
        <div
          className="mx-auto"
          style={{
            width: 60,
            height: 1.5,
            marginTop: 16,
            marginBottom: 28,
            backgroundColor: 'var(--color-border)',
            borderRadius: 1,
          }}
        />

        {/* URL error */}
        {urlError && <ErrorBanner message={urlError} />}

        <form onSubmit={onSubmit}>
          <div className="flex flex-col" style={{ gap: 20 }}>
            {/* Form error */}
            {error && <ErrorBanner message={error} isWarning={isLocked} />}

            {/* Email field */}
            <div>
              <label
                htmlFor="login-email"
                className="block font-semibold"
                style={{ fontSize: 14, color: '#4A5568', marginBottom: 8 }}
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute"
                  style={{
                    width: 18,
                    height: 18,
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#C4A88C',
                  }}
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLocked}
                  placeholder="votre@email.com"
                  className="login-input"
                  style={{
                    width: '100%',
                    height: 50,
                    paddingLeft: 44,
                    paddingRight: 16,
                    borderRadius: 16,
                    border: '1.5px solid #E8D5CA',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: 14.5,
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2A7FD4'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,127,212,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8D5CA'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="login-password"
                className="block font-semibold"
                style={{ fontSize: 14, color: '#4A5568', marginBottom: 8 }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute"
                  style={{
                    width: 18,
                    height: 18,
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#C4A88C',
                  }}
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLocked}
                  className="login-input"
                  style={{
                    width: '100%',
                    height: 50,
                    paddingLeft: 44,
                    paddingRight: 44,
                    borderRadius: 16,
                    border: '1.5px solid #E8D5CA',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: 14.5,
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2A7FD4'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,127,212,0.08)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E8D5CA'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute"
                  style={{
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#C4A88C',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword
                    ? <Eye style={{ width: 18, height: 18 }} />
                    : <EyeOff style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                onClick={onForgotPassword}
                style={{
                  fontSize: 14,
                  color: '#2A7FD4',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="relative flex items-center justify-center font-semibold"
              style={{
                width: '100%',
                height: 52,
                borderRadius: 16,
                background: isLocked
                  ? 'var(--color-text-muted)'
                  : '#2A7FD4',
                color: '#FFFFFF',
                fontSize: 16,
                letterSpacing: 0.3,
                border: 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(42,127,212,0.3)',
                transition: 'opacity 0.15s, box-shadow 0.15s',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  role="status"
                  aria-label="Connexion en cours"
                />
              ) : (
                <>
                  {isLocked ? 'Compte verrouillé' : 'Se connecter'}
                  {!isLocked && (
                    <ArrowRight
                      className="absolute"
                      style={{ right: 20, width: 16, height: 16, opacity: 0.85 }}
                    />
                  )}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Support section */}
        <div className="mt-6 text-center">
          <p style={{ fontSize: 12.5, color: '#8492A6' }}>
            Besoin d{"'"}aide ?{' '}
            <a
              href="mailto:support@links-accompagnement.fr"
              style={{ color: '#2A7FD4', textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              Contacter le support
            </a>
          </p>
        </div>
      </div>

      {/* Footer in card on mobile */}
      <div className="px-8 pb-6 text-center lg:hidden">
        <FooterLinks />
      </div>
    </div>
  )
}

function ErrorBanner({ message, isWarning = false }: { message: string; isWarning?: boolean }) {
  return (
    <div
      className="mb-2 flex items-center gap-2"
      style={{
        padding: 12,
        borderRadius: 16,
        backgroundColor: isWarning ? '#FFF0EA' : '#FEF2F2',
        border: `1px solid ${isWarning ? '#FECACA' : '#FECACA'}`,
        fontSize: 13,
        color: isWarning ? '#FF6B35' : '#DC2626',
        fontWeight: 500,
      }}
      role="alert"
    >
      <span
        className="flex shrink-0 items-center justify-center rounded-full font-bold"
        style={{
          width: 18,
          height: 18,
          fontSize: 11,
          backgroundColor: isWarning ? '#FEE2E2' : '#FEE2E2',
          color: '#DC2626',
        }}
      >
        !
      </span>
      {message}
    </div>
  )
}

export function FooterLinks() {
  return (
    <>
      <div className="mb-3" style={{ height: 1, backgroundColor: '#F0E4DC' }} />
      <p style={{ fontSize: 12, color: '#8492A6' }}>
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
        {' | '}
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>
        {' | '}
        <Link href="/cookies" className="hover:underline">
          Cookies
        </Link>
      </p>
    </>
  )
}
