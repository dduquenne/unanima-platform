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
        maxWidth: 420,
        borderRadius: 20,
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 16px 40px rgba(13,59,110,0.15)',
      }}
    >
      {/* Barre accent gradient tricolore */}
      <div
        style={{
          height: 4,
          background: 'linear-gradient(to right, var(--color-primary), var(--color-secondary), var(--color-accent))',
        }}
      />

      <div style={{ padding: '40px 32px 32px' }}>
        {/* Titre */}
        <h2
          className="text-center font-bold"
          style={{ fontSize: 24, color: 'var(--color-primary-dark)', letterSpacing: -0.5 }}
        >
          Connexion
        </h2>
        <p
          className="mt-1 text-center"
          style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}
        >
          Accédez à votre espace sécurisé
        </p>

        {/* Séparateur */}
        <div
          className="mx-auto"
          style={{
            width: 60,
            height: 1.5,
            marginTop: 12,
            marginBottom: 24,
            backgroundColor: 'var(--color-border)',
            borderRadius: 1,
          }}
        />

        {/* Erreur URL */}
        {urlError && <ErrorBanner message={urlError} />}

        <form onSubmit={onSubmit}>
          <div className="flex flex-col" style={{ gap: 20 }}>
            {/* Erreur formulaire */}
            {error && <ErrorBanner message={error} isWarning={isLocked} />}

            {/* Champ email */}
            <div>
              <label
                htmlFor="login-email"
                className="block font-semibold"
                style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}
              >
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute"
                  style={{
                    width: 18,
                    height: 18,
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
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
                  placeholder="votre@email.fr"
                  className="login-input"
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 14,
                    borderRadius: 12,
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: 13.5,
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,192,0.06)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Champ mot de passe */}
            <div>
              <label
                htmlFor="login-password"
                className="block font-semibold"
                style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 6 }}
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute"
                  style={{
                    width: 18,
                    height: 18,
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
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
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 42,
                    borderRadius: 12,
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: 13.5,
                    color: 'var(--color-text)',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30,111,192,0.06)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute"
                  style={{
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-muted)',
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

            {/* Lien mot de passe oublié */}
            <div style={{ textAlign: 'right', marginTop: -8 }}>
              <button
                type="button"
                onClick={onForgotPassword}
                style={{
                  fontSize: 12.5,
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              className="relative flex items-center justify-center font-bold"
              style={{
                width: '100%',
                height: 50,
                borderRadius: 12,
                background: isLocked
                  ? 'var(--color-text-muted)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                color: 'var(--color-text-inverse)',
                fontSize: 15,
                letterSpacing: 0.3,
                border: 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                boxShadow: isLocked ? 'none' : '0 4px 12px rgba(30,111,192,0.25)',
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
                  {isLocked ? 'Compte verrouill\u00e9' : 'Se connecter'}
                  {!isLocked && (
                    <ArrowRight
                      className="absolute"
                      style={{ right: 18, width: 16, height: 16, opacity: 0.85 }}
                    />
                  )}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Séparateur "ou" */}
        <div className="flex items-center" style={{ gap: 12, marginTop: 24, marginBottom: 24 }}>
          <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
          <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)' }}>ou</span>
          <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--color-border)' }} />
        </div>

        {/* Section support */}
        <div className="text-center">
          <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)' }}>
            Besoin d{"'"}aide ?
          </p>
          <a
            href="mailto:support@links-accompagnement.fr"
            style={{
              display: 'inline-block',
              marginTop: 4,
              fontSize: 12.5,
              color: 'var(--color-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Contacter le support
          </a>
        </div>
      </div>

      {/* Footer dans la carte sur mobile */}
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
        borderRadius: 10,
        backgroundColor: isWarning ? 'var(--color-warning-light)' : 'var(--color-danger-light)',
        border: `1px solid ${isWarning ? 'var(--color-warning)' : 'var(--color-danger)'}`,
        fontSize: 12.5,
        color: isWarning ? 'var(--color-warning)' : '#C62828',
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
          backgroundColor: 'var(--color-danger)',
          color: 'var(--color-text-inverse)',
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
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
        © {new Date().getFullYear()} Link{"'"}s Accompagnement — Unanima Platform
      </p>
      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', opacity: 0.7, marginTop: 4 }}>
        <Link href="/mentions-legales" className="hover:underline">
          Mentions légales
        </Link>
        {' · '}
        <Link href="/confidentialite" className="hover:underline">
          Confidentialité
        </Link>
        {' · '}
        <Link href="/cookies" className="hover:underline">
          RGPD
        </Link>
      </p>
    </>
  )
}
