'use client'

// Bandeau Mode Simulation + sélecteur de rôle
// Issue: #137 — Sprint 12

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { isSimulationMode } from '@/lib/simulation/config'
import { SIMULATION_ROLE_COOKIE } from '@/lib/simulation/auth'

const ROLE_OPTIONS = [
  { value: 'beneficiaire', label: 'Bénéficiaire', home: '/dashboard' },
  { value: 'consultant', label: 'Consultant', home: '/beneficiaires' },
  { value: 'super_admin', label: 'Administrateur', home: '/admin' },
] as const

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1] ?? '') : undefined
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=86400;SameSite=Lax`
}

export function SimulationBanner() {
  const router = useRouter()

  if (!isSimulationMode()) return null

  const currentRole = getCookie(SIMULATION_ROLE_COOKIE) ?? 'beneficiaire'

  const handleRoleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newRole = e.target.value
      setCookie(SIMULATION_ROLE_COOKIE, newRole)
      const home = ROLE_OPTIONS.find((r) => r.value === newRole)?.home ?? '/dashboard'
      router.push(home)
      // Force full page reload to re-run middleware with new role
      window.location.href = home
    },
    [router],
  )

  return (
    <div
      className="flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
      role="status"
      aria-label="Mode simulation actif — données fictives"
    >
      <span aria-hidden="true">&#9888;</span>
      <span>Mode Simulation — Données fictives</span>
      <label htmlFor="simulation-role-select" className="sr-only">
        Changer de rôle
      </label>
      <select
        id="simulation-role-select"
        value={currentRole}
        onChange={handleRoleChange}
        className="rounded bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-white"
        aria-label="Sélecteur de rôle simulation"
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  )
}
