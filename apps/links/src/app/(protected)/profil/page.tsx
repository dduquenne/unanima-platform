'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@unanima/auth'
import { Modal } from '@unanima/core'
import { Mail, Calendar, User, ChevronRight, Lock } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  beneficiaire: 'Bénéficiaire',
  consultant: 'Consultante',
  super_admin: 'Administrateur',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfilPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const fullName = user.fullName ?? ''
  const nameParts = fullName.split(' ')
  const lastName = nameParts.length > 1 ? nameParts.slice(-1).join(' ') : fullName
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''
  const initials = getInitials(fullName)
  const memberSince = user.metadata?.created_at
    ? new Date(user.metadata.created_at as string).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
  const consultantName = (user.metadata?.consultant_name as string) ?? null

  const handleChangePassword = async () => {
    setPasswordError(null)
    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error ?? 'Erreur lors du changement de mot de passe')
      }
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess(false)
      }, 2000)
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : 'Erreur lors du changement',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[720px] space-y-6">
      {/* Profile card */}
      <div className="relative overflow-hidden rounded-[20px] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        {/* Gradient strip */}
        <div
          className="h-[6px] w-full"
          style={{
            background: 'linear-gradient(90deg, #2A7FD4 0%, #F28C5A 100%)',
          }}
        />

        <div className="flex flex-col items-center px-8 py-8">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[var(--color-primary)]">
              <span className="text-[28px] font-bold text-white">{initials}</span>
            </div>
            <div
              className="absolute inset-[-4px] rounded-full border-[2.5px] border-dashed border-[var(--color-accent)]"
            />
          </div>

          {/* Name */}
          <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">
            {fullName}
          </h1>

          {/* Role badge */}
          <span className="mt-2 rounded-[14px] bg-[var(--color-info-light)] px-4 py-1 text-xs font-semibold text-[var(--color-primary)]">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>

          {/* Info rows */}
          <div className="mt-6 w-full max-w-md space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-warning-light)]">
                <Mail className="h-3 w-3 text-[var(--color-accent)]" />
              </span>
              <span className="text-[13px] text-[var(--color-text-secondary)]">
                {user.email}
              </span>
            </div>

            {memberSince && (
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-warning-light)]">
                  <Calendar className="h-3 w-3 text-[var(--color-accent)]" />
                </span>
                <span className="text-[13px] text-[var(--color-text-secondary)]">
                  Membre depuis le {memberSince}
                </span>
              </div>
            )}

            {consultantName && (
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-warning-light)]">
                  <User className="h-3 w-3 text-[var(--color-accent)]" />
                </span>
                <span className="text-[13px] text-[var(--color-text-secondary)]">
                  Consultante assignée :{' '}
                  <span className="font-semibold text-[var(--color-primary)]">
                    {consultantName}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="rounded-[20px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Informations personnelles
        </h2>
        <div className="mt-3 border-t border-[var(--color-border-light)]" />

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Nom
            </label>
            <div className="mt-1 rounded-[16px] border border-[var(--color-border-light)] bg-[var(--color-background)] px-4 py-2.5 text-[13px] text-[var(--color-text)]">
              {lastName}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Prénom
            </label>
            <div className="mt-1 rounded-[16px] border border-[var(--color-border-light)] bg-[var(--color-background)] px-4 py-2.5 text-[13px] text-[var(--color-text)]">
              {firstName || '—'}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">
              Email
            </label>
            <div className="mt-1 rounded-[16px] border border-[var(--color-border-light)] bg-[var(--color-background)] px-4 py-2.5 text-[13px] text-[var(--color-text)]">
              {user.email}
            </div>
          </div>
        </div>

        <p className="mt-3 text-[11px] italic text-[var(--color-text-muted)]">
          Ces champs sont en lecture seule.
        </p>
      </div>

      {/* Sécurité */}
      <div className="rounded-[20px] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)]">
        <h2 className="text-base font-semibold text-[var(--color-text)]">
          Sécurité
        </h2>
        <div className="mt-3 border-t border-[var(--color-border-light)]" />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 rounded-[16px] border-[1.5px] border-[var(--color-primary)] bg-white px-5 py-2.5 text-[13px] font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-info-light)]"
          >
            <Lock className="h-3.5 w-3.5" />
            Modifier mon mot de passe
          </button>
          <span className="text-xs text-[var(--color-text-muted)]">
            Dernière modification il y a quelques jours
          </span>
        </div>
      </div>

      {/* RGPD link card */}
      <button
        onClick={() => router.push('/profil/mes-donnees')}
        className="flex w-full items-center justify-between rounded-[20px] border border-[var(--color-border-light)] bg-[var(--color-surface)] px-6 py-4 shadow-[var(--shadow-lg)] transition-shadow hover:shadow-[var(--shadow-xl)]"
      >
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">
            Gérer mes données (RGPD)
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Exportez ou supprimez vos données personnelles
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-[var(--color-accent)]" />
      </button>

      {/* Footer note */}
      <p className="text-center text-[11px] italic text-[var(--color-text-muted)]">
        Pour toute modification de vos informations, contactez votre consultante ou
        l&apos;administrateur.
      </p>

      {/* Password change modal */}
      <Modal
        open={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordError(null)
          setPasswordSuccess(false)
        }}
        title="Modifier mon mot de passe"
        size="sm"
        actions={
          <>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)]"
            >
              Annuler
            </button>
            <button
              onClick={handleChangePassword}
              disabled={saving || passwordSuccess}
              className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {saving ? 'En cours...' : passwordSuccess ? 'Modifié !' : 'Confirmer'}
            </button>
          </>
        }
      >
        {passwordSuccess ? (
          <p className="text-sm text-[var(--color-success)]">
            Mot de passe modifié avec succès.
          </p>
        ) : (
          <div className="space-y-4">
            {passwordError && (
              <p className="text-sm text-[var(--color-danger)]">{passwordError}</p>
            )}
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="Minimum 8 caractères"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                placeholder="Retapez le mot de passe"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
