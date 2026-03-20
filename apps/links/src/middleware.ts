import { createAuthMiddleware } from '@unanima/auth'
import { authConfig } from './config/auth.config'

export default createAuthMiddleware({
  authConfig,
  protectedRoutes: ['/dashboard', '/profile'],
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
}
