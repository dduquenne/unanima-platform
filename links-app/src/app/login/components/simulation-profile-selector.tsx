'use client'

// Sélecteur de profils pour le mode simulation sur la page de login
// Permet de choisir un profil fictif avant d'entrer dans l'app

import { useCallback } from 'react'
import { User, Shield, Briefcase, FileText } from 'lucide-react'
import { simulationProfiles } from '@/lib/simulation/fixtures'
import { SIMULATION_ROLE_COOKIE } from '@/lib/simulation/auth'
import type { Profile } from '@/lib/types/database'

const ROLE_HOME: Record<string, string> = {
  beneficiaire: '/dashboard',
  consultant: '/consultant/dashboard',
  super_admin: '/admin',
}

const ROLE_META: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  super_admin: {
    label: 'Administrateur',
    color: '#9333EA',
    bgColor: '#F3E8FF',
    icon: <Shield className="h-5 w-5" />,
  },
  consultant: {
    label: 'Consultant',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    icon: <Briefcase className="h-5 w-5" />,
  },
  beneficiaire: {
    label: 'Beneficiaire',
    color: '#059669',
    bgColor: '#ECFDF5',
    icon: <FileText className="h-5 w-5" />,
  },
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=86400;SameSite=Lax`
}

function getProgressLabel(profile: Profile): string | null {
  if (profile.role !== 'beneficiaire') return null
  if (profile.date_fin_bilan) return 'Bilan termine'
  if (!profile.date_debut_bilan) return 'Nouveau'
  return 'Bilan en cours'
}

export function SimulationProfileSelector() {
  const handleSelect = useCallback((profile: Profile) => {
    setCookie(SIMULATION_ROLE_COOKIE, profile.role)
    const home = ROLE_HOME[profile.role] ?? '/dashboard'
    window.location.href = home
  }, [])

  // Group profiles by role
  const admins = simulationProfiles.filter((p) => p.role === 'super_admin')
  const consultants = simulationProfiles.filter((p) => p.role === 'consultant')
  const beneficiaires = simulationProfiles.filter((p) => p.role === 'beneficiaire')

  const groups = [
    { role: 'super_admin', profiles: admins },
    { role: 'consultant', profiles: consultants },
    { role: 'beneficiaire', profiles: beneficiaires },
  ]

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maxWidth: 520,
        borderRadius: 20,
        backgroundColor: 'var(--color-surface)',
        boxShadow: '0 16px 40px rgba(212, 149, 106, 0.10)',
      }}
    >
      <div style={{ padding: '32px 28px 24px' }}>
        {/* Header */}
        <div
          className="mb-4 flex items-center justify-center gap-2 rounded-xl px-4 py-2"
          style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5' }}
        >
          <span aria-hidden="true" style={{ fontSize: 16 }}>&#9888;</span>
          <span className="text-sm font-semibold" style={{ color: '#C2410C' }}>
            Mode Simulation — Donnees fictives
          </span>
        </div>

        <h2
          className="text-center font-bold"
          style={{ fontSize: 24, color: '#1A2332', letterSpacing: -0.3 }}
        >
          Choisir un profil
        </h2>
        <p
          className="mt-1 text-center"
          style={{ fontSize: 14, color: '#8492A6' }}
        >
          Selectionnez un utilisateur pour explorer l{"'"}application
        </p>

        {/* Separator */}
        <div
          className="mx-auto"
          style={{
            width: 60,
            height: 1.5,
            marginTop: 16,
            marginBottom: 20,
            backgroundColor: 'var(--color-border)',
            borderRadius: 1,
          }}
        />

        {/* Profile groups */}
        <div className="flex flex-col" style={{ gap: 16 }}>
          {groups.map(({ role, profiles }) => {
            const meta = ROLE_META[role]
            if (!meta || profiles.length === 0) return null

            return (
              <div key={role}>
                <div className="mb-2 flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: meta.bgColor, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: meta.color }}
                  >
                    {meta.label}
                    {profiles.length > 1 ? `s (${profiles.length})` : ''}
                  </span>
                </div>

                <div className="flex flex-col" style={{ gap: 6 }}>
                  {profiles.map((profile) => {
                    const progress = getProgressLabel(profile)
                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleSelect(profile)}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all"
                        style={{
                          backgroundColor: '#FAFAFA',
                          border: '1.5px solid #E8E8E8',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = meta.color
                          e.currentTarget.style.backgroundColor = meta.bgColor
                          e.currentTarget.style.boxShadow = `0 0 0 3px ${meta.color}15`
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#E8E8E8'
                          e.currentTarget.style.backgroundColor = '#FAFAFA'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        {/* Avatar */}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: meta.color }}
                        >
                          {profile.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>

                        {/* Name + email */}
                        <div className="flex-1 overflow-hidden">
                          <p
                            className="truncate text-sm font-semibold"
                            style={{ color: '#1A2332' }}
                          >
                            {profile.full_name}
                          </p>
                          <p
                            className="truncate text-xs"
                            style={{ color: '#8492A6' }}
                          >
                            {profile.email}
                          </p>
                        </div>

                        {/* Progress badge for beneficiaires */}
                        {progress && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{
                              backgroundColor: meta.bgColor,
                              color: meta.color,
                            }}
                          >
                            {progress}
                          </span>
                        )}

                        {/* Arrow */}
                        <User
                          className="shrink-0"
                          style={{ width: 14, height: 14, color: '#C4CDD5' }}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
