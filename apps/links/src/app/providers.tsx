'use client'

import type { ReactNode } from 'react'
import { AuthProvider } from '@unanima/auth'
import { authConfig } from '../config/auth.config'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider config={authConfig}>
      {children}
    </AuthProvider>
  )
}
