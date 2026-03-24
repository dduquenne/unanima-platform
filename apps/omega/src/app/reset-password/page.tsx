'use client'

import { ResetPasswordForm } from '@unanima/auth'
import { authPageConfig } from '../../config/auth-pages.config'

export default function ResetPasswordPage() {
  return <ResetPasswordForm config={authPageConfig} />
}
