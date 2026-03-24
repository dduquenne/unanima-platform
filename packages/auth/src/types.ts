export interface AuthConfig {
  roles: string[]
  defaultRole: string
  redirects: {
    afterLogin: string
    afterLogout: string
    unauthorized: string
  }
  permissions: Record<string, string[]>
}

export interface UserSession {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  metadata: Record<string, unknown>
}

export interface AuthContextValue {
  user: UserSession | null
  session: unknown
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

export interface AuthPageConfig {
  appName: string
  tagline?: string
  logo?: React.ReactNode
  supportEmail?: string
  legalLinks?: Array<{ label: string; href: string }>
  roleRedirects?: Record<string, string>
  loginEndpoint?: string
  updatePasswordEndpoint?: string
}
