import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { AuthConfig } from './types'

interface MiddlewareConfig {
  authConfig: AuthConfig
  protectedRoutes?: string[]
  roleRoutes?: Record<string, string[]>
}

export function createAuthMiddleware(config: MiddlewareConfig) {
  return async function middleware(request: NextRequest) {
    const { authConfig, protectedRoutes = [], roleRoutes = {} } = config
    const pathname = request.nextUrl.pathname

    let response = NextResponse.next({
      request: { headers: request.headers },
    })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error(
        'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set',
      )
    }

    const supabase = createServerClient(url, anonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            )
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

    if (isProtected && !user) {
      const loginUrl = new URL(authConfig.redirects.afterLogout, request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
          if (pathname.startsWith(route) && !allowedRoles.includes(profile.role)) {
            return NextResponse.redirect(
              new URL(authConfig.redirects.unauthorized, request.url),
            )
          }
        }
      }
    }

    return response
  }
}
