'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useMemo, type FormEvent } from 'react'
import { useAuth } from '@/lib/auth'
import { Button, Input } from '@/components/ui'
import { ArrowLeft, CheckCircle, Mail, Eye, EyeOff, Check } from 'lucide-react'
import Link from 'next/link'

type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): { strength: PasswordStrength; label: string } {
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

function isPasswordValid(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password)
}

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: '#DC2626',
  medium: '#FF6B35',
  strong: '#28A745',
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()

  const isChangeMode = useMemo(() => {
    return searchParams.has('code') || searchParams.has('token')
  }, [searchParams])

  if (isChangeMode) {
    return <ChangePasswordForm />
  }

  return <RequestResetForm />
}

/* ═══════════════════════════════════════════════════════
 *  REQUEST RESET FORM (MAQ-10 chaleureux — split-screen)
 * ═══════════════════════════════════════════════════════ */
function RequestResetForm() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const { error: resetError } = await resetPassword(email)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* ═══ LEFT PANEL — Branding (MAQ-10 chaleureux) ═══ */}
      <aside
        className="relative hidden flex-col items-center justify-center overflow-hidden lg:flex"
        style={{
          width: '42%',
          minWidth: 0,
          background: 'linear-gradient(180deg, #0D3B6E 0%, #14527A 100%)',
        }}
      >
        {/* Organic blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute" style={{ top: '15%', left: '10%', width: 280, height: 200, borderRadius: '50%', backgroundColor: '#1A5BA0', opacity: 0.15, transform: 'rotate(-15deg)' }} />
          <div className="absolute" style={{ bottom: '10%', right: '5%', width: 320, height: 240, borderRadius: '50%', backgroundColor: '#1A5BA0', opacity: 0.12, transform: 'rotate(20deg)' }} />
          <div className="absolute" style={{ bottom: '30%', left: '5%', width: 200, height: 140, borderRadius: '50%', backgroundColor: '#F28C5A', opacity: 0.08, transform: 'rotate(-10deg)' }} />
          <div className="absolute" style={{ top: '25%', right: '10%', width: 160, height: 120, borderRadius: '50%', backgroundColor: '#F28C5A', opacity: 0.06, transform: 'rotate(15deg)' }} />
          {/* Dots */}
          <div className="absolute rounded-full" style={{ top: '15%', right: '25%', width: 12, height: 12, backgroundColor: '#F28C5A', opacity: 0.35 }} />
          <div className="absolute rounded-full" style={{ bottom: '15%', left: '20%', width: 10, height: 10, backgroundColor: '#F28C5A', opacity: 0.3 }} />
          <div className="absolute rounded-full" style={{ top: '50%', right: '15%', width: 8, height: 8, backgroundColor: '#F28C5A', opacity: 0.25 }} />
        </div>

        {/* Content centered */}
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white">Link{"'"}s</h2>
          <p className="mt-2 text-2xl font-light text-white">Accompagnement</p>
          <div className="mx-auto mt-5 h-1 w-36 rounded-sm" style={{ backgroundColor: '#F28C5A' }} />
          <p className="mt-6 text-base" style={{ color: '#A8C8E8' }}>
            Votre parcours de bilan de compétences,
          </p>
          <p className="text-base" style={{ color: '#A8C8E8' }}>
            simplifié et sécurisé.
          </p>
        </div>
      </aside>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <main
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8"
        style={{ backgroundColor: '#FFF8F5' }}
      >
        <div className="w-full max-w-md">
          {/* Back link */}
          <button
            onClick={() => router.push('/login')}
            className="mb-8 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: '#2A7FD4' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </button>

          {success ? (
            /* ═══ SUCCESS STATE ═══ */
            <div
              className="overflow-hidden"
              style={{
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                border: '1.5px solid #BBF7D0',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
              }}
            >
              <div className="p-8 text-center">
                {/* Green check */}
                <div
                  className="mx-auto mb-4 flex items-center justify-center rounded-full"
                  style={{ width: 56, height: 56, backgroundColor: '#ECFDF5' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 36, height: 36, backgroundColor: '#10B981' }}
                  >
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </div>

                <h2 className="text-xl font-bold" style={{ color: '#065F46' }}>
                  Email envoyé !
                </h2>

                <p className="mt-4 text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  Si cette adresse est associée à un compte, vous recevrez
                  un lien de réinitialisation dans quelques minutes.
                </p>
                <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
                  Pensez à vérifier vos spams.
                </p>

                <button
                  onClick={() => router.push('/login')}
                  className="mt-6 text-sm font-semibold"
                  style={{ color: '#2A7FD4' }}
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          ) : (
            /* ═══ REQUEST FORM ═══ */
            <>
              <h1 className="text-3xl font-bold" style={{ color: '#1A1A2E' }}>
                Mot de passe oublié ?
              </h1>
              <p className="mt-3 text-base leading-relaxed" style={{ color: '#6B7280' }}>
                Pas de souci ! Saisissez votre adresse email.
                Si elle est associée à un compte, vous recevrez
                un lien de réinitialisation.
              </p>

              <form onSubmit={handleSubmit} className="mt-8">
                <div className="flex flex-col gap-5">
                  {error && (
                    <div
                      className="flex items-center gap-2 text-sm font-medium"
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        backgroundColor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                      }}
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-sm font-medium"
                      style={{ color: '#374151', marginBottom: 8 }}
                    >
                      Adresse email
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
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="votre@email.com"
                        style={{
                          width: '100%',
                          height: 48,
                          paddingLeft: 44,
                          paddingRight: 16,
                          borderRadius: 16,
                          border: '1.5px solid #E8D5CC',
                          backgroundColor: '#FFFFFF',
                          fontSize: 14,
                          color: '#4A4A4A',
                          outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#2A7FD4'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,127,212,0.08)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#E8D5CC'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center font-semibold text-white transition-opacity"
                    style={{
                      width: '100%',
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: '#2A7FD4',
                      fontSize: 16,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(42,127,212,0.3)',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <div
                        className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        role="status"
                        aria-label="Envoi en cours"
                      />
                    ) : (
                      'Envoyer le lien'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
 *  CHANGE PASSWORD FORM (will be redesigned in #208)
 * ═══════════════════════════════════════════════════════ */
function ChangePasswordForm() {
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword])
  const valid = useMemo(() => isPasswordValid(newPassword), [newPassword])
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!valid) {
      setError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Erreur lors de la mise à jour.')
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    }

    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* ═══ LEFT PANEL ═══ */}
      <aside
        className="relative hidden flex-col items-center justify-center overflow-hidden lg:flex"
        style={{
          width: '42%',
          minWidth: 0,
          background: 'linear-gradient(160deg, #0D3B6E 0%, #1A5BA0 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute" style={{ top: '15%', left: '10%', width: 280, height: 200, borderRadius: '50%', backgroundColor: '#1A5BA0', opacity: 0.15, transform: 'rotate(-15deg)' }} />
          <div className="absolute" style={{ bottom: '10%', right: '5%', width: 320, height: 240, borderRadius: '50%', backgroundColor: '#1A5BA0', opacity: 0.12 }} />
          <div className="absolute" style={{ bottom: '30%', left: '5%', width: 200, height: 140, borderRadius: '50%', backgroundColor: '#F28C5A', opacity: 0.08 }} />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold text-white">Link{"'"}s</h2>
          <p className="mt-2 text-2xl font-light text-white">Accompagnement</p>
          <div className="mx-auto mt-5 h-1 w-36 rounded-sm" style={{ backgroundColor: '#F28C5A' }} />
        </div>
      </aside>

      {/* ═══ RIGHT PANEL ═══ */}
      <main
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-8"
        style={{ backgroundColor: '#FFF8F5' }}
      >
        <div className="w-full max-w-md">
          {success ? (
            <div style={{ borderRadius: 20, backgroundColor: '#FFFFFF', border: '1.5px solid #BBF7D0', boxShadow: '0 6px 16px rgba(0,0,0,0.06)' }}>
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 flex items-center justify-center rounded-full" style={{ width: 56, height: 56, backgroundColor: '#ECFDF5' }}>
                  <div className="flex items-center justify-center rounded-full" style={{ width: 36, height: 36, backgroundColor: '#10B981' }}>
                    <Check className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold" style={{ color: '#065F46' }}>Mot de passe mis à jour</h2>
                <p className="mt-4 text-sm" style={{ color: '#6B7280' }}>
                  Votre mot de passe a été modifié avec succès.
                  Vous pouvez maintenant vous connecter.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="mt-6 flex w-full items-center justify-center font-semibold text-white"
                  style={{ height: 50, borderRadius: 16, backgroundColor: '#2A7FD4', fontSize: 16, border: 'none', cursor: 'pointer' }}
                >
                  Se connecter
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold" style={{ color: '#1A1A2E' }}>
                Créer un nouveau mot de passe
              </h1>
              <p className="mt-3 text-base" style={{ color: '#6B7280' }}>
                Choisissez un mot de passe sécurisé pour protéger votre compte.
              </p>

              <form onSubmit={handleSubmit} className="mt-8">
                <div className="flex flex-col gap-5">
                  {error && (
                    <div
                      className="text-sm font-medium"
                      style={{ padding: 12, borderRadius: 16, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* New password */}
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium" style={{ color: '#374151', marginBottom: 8 }}>
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        style={{
                          width: '100%', height: 48, paddingLeft: 16, paddingRight: 44,
                          borderRadius: 16, border: '1.5px solid #E8D5CC', backgroundColor: '#FFFFFF',
                          fontSize: 14, color: '#4A4A4A', outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#2A7FD4'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,127,212,0.08)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = '#E8D5CC'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute" style={{ right: 14, top: '50%', transform: 'translateY(-50%)', color: '#C4A88C', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <Eye style={{ width: 18, height: 18 }} /> : <EyeOff style={{ width: 18, height: 18 }} />}
                      </button>
                    </div>

                    {/* Strength indicator */}
                    {newPassword.length > 0 && (
                      <div className="mt-3">
                        <div className="flex gap-1.5">
                          {(['weak', 'medium', 'strong'] as const).map((level, i) => {
                            const activeIndex = level === 'weak' ? 0 : level === 'medium' ? 1 : 2
                            const strengthIndex = strength.strength === 'weak' ? 0 : strength.strength === 'medium' ? 1 : 2
                            const isActive = i <= strengthIndex
                            return (
                              <div
                                key={level}
                                className="h-1.5 flex-1 rounded-full transition-colors"
                                style={{ backgroundColor: isActive ? STRENGTH_COLORS[strength.strength] : '#E8D5CC' }}
                              />
                            )
                          })}
                        </div>
                        <p className="mt-1 text-right text-xs font-medium" style={{ color: STRENGTH_COLORS[strength.strength] }}>
                          {strength.label}
                        </p>
                        <ul className="mt-2 space-y-1 text-xs">
                          <CriterionItem met={newPassword.length >= 8} label="Au moins 8 caractères" />
                          <CriterionItem met={/[A-Z]/.test(newPassword)} label="Au moins 1 majuscule" />
                          <CriterionItem met={/\d/.test(newPassword)} label="Au moins 1 chiffre" />
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium" style={{ color: '#374151', marginBottom: 8 }}>
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        style={{
                          width: '100%', height: 48, paddingLeft: 16, paddingRight: 44,
                          borderRadius: 16, border: `1.5px solid ${passwordsMatch ? '#28A745' : '#E8D5CC'}`, backgroundColor: '#FFFFFF',
                          fontSize: 14, color: '#4A4A4A', outline: 'none',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#2A7FD4'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(42,127,212,0.08)' }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = passwordsMatch ? '#28A745' : '#E8D5CC'; e.currentTarget.style.boxShadow = 'none' }}
                      />
                      <button
                        type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute" style={{ right: 14, top: '50%', transform: 'translateY(-50%)', color: '#C4A88C', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                        aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                      >
                        {showConfirm ? <Eye style={{ width: 18, height: 18 }} /> : <EyeOff style={{ width: 18, height: 18 }} />}
                      </button>
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="mt-1.5 text-xs" style={{ color: '#DC2626' }}>
                        Les mots de passe ne correspondent pas.
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs" style={{ color: '#28A745' }}>
                        <Check className="h-3.5 w-3.5" /> Les mots de passe correspondent
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !valid || !passwordsMatch}
                    className="flex items-center justify-center font-semibold text-white transition-opacity"
                    style={{
                      width: '100%', height: 50, borderRadius: 16,
                      backgroundColor: (valid && passwordsMatch) ? '#2A7FD4' : '#B0A09A',
                      fontSize: 16, border: 'none',
                      cursor: (valid && passwordsMatch) ? 'pointer' : 'not-allowed',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" role="status" aria-label="Mise à jour en cours" />
                    ) : (
                      'Modifier mon mot de passe'
                    )}
                  </button>

                  <p className="text-center text-xs" style={{ color: '#6B7280' }}>
                    Vous serez redirigé vers la page de connexion.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function CriterionItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2" style={{ color: met ? '#28A745' : '#6B7280' }}>
      {met ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: '#C4A88C' }} />
      )}
      {label}
    </li>
  )
}
