'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@unanima/auth'
import { authConfig } from '../config/auth.config'
import { isSimulationMode } from '@/lib/simulation/config'
import { SimulationAuthProvider } from '@/lib/simulation/simulation-auth-provider'

export function Providers({ children }: { children: ReactNode }) {
  if (isSimulationMode()) {
    return (
      <SimulationAuthProvider config={authConfig}>
        {children}
      </SimulationAuthProvider>
    )
  }

  return (
    <AuthProvider config={authConfig}>
      {children}
    </AuthProvider>
  )
}
