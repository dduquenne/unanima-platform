'use client'

import { LoginForm } from '@unanima/auth'
import { authPageConfig } from '../../config/auth-pages.config'

export default function LoginPage() {
  return <LoginForm config={authPageConfig} />
}
