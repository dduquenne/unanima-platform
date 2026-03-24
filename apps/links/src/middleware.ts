// Middleware RBAC Links — 3 rôles, is_active, redirection post-login
// Issue: #107 — Sprint 8 Fondations
// Règles: RG-AUTH-04, RG-AUTH-05, RG-AUTH-11, RG-AUTH-20

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ============================================================
// Table de redirection post-login par rôle (RG-AUTH-11)
// ============================================================
const ROLE_HOME: Record<string, string> = {
  beneficiaire: '/dashboard',
  consultant: '/beneficiaires',
  super_admin: '/admin',
}

// ============================================================
// Table RBAC : route prefix → rôles autorisés (RG-AUTH-05)
// ============================================================
const ROLE_ROUTES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: '/admin', allowed: ['super_admin'] },
  { prefix: '/beneficiaires', allowed: ['consultant', 'super_admin'] },
  { prefix: '/dashboard', allowed: ['beneficiaire'] },
  { prefix: '/bilans', allowed: ['beneficiaire', 'consultant', 'super_admin'] },
  { prefix: '/documents', allowed: ['beneficiaire', 'consultant', 'super_admin'] },
  { prefix: '/profil', allowed: ['beneficiaire', 'consultant', 'super_admin'] },
  { prefix: '/profile', allowed: ['beneficiaire', 'consultant', 'super_admin'] },
]

// ============================================================
// Routes publiques (pas d'authentification requise)
// ============================================================
const PUBLIC_PREFIXES = [
  '/login',
  '/reset-password',
  '/auth/',
  '/mentions-legales',
  '/confidentialite',
  '/cookies',
]

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// ============================================================
// Middleware principal
// ============================================================

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // En développement sans Supabase configuré, laisser passer
    if (process.env.NODE_ENV === 'development') {
      return response
    }
    throw new Error('Variables Supabase manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
          response.cookies.set(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
          }),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Utilisateur non authentifié ──────────────────────────────
  if (!user) {
    if (!isPublicRoute(pathname)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // ── Utilisateur authentifié — récupérer le profil ───────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  // Compte explicitement désactivé (RG-AUTH-20)
  // IMPORTANT : ne PAS déconnecter si le profil est absent — cela
  // provoque une boucle de redirection infinie vers /login.
  // Un profil manquant sera créé automatiquement via /api/auth/ensure-profile.
  if (profile && !profile.is_active) {
    await supabase.auth.signOut()
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('error', 'compte_desactive')
    return NextResponse.redirect(loginUrl)
  }

  // Rôle depuis le profil, ou fallback sur les métadonnées auth, ou défaut
  const role: string =
    profile?.role ??
    (user.user_metadata?.role as string | undefined) ??
    'beneficiaire'

  // ── Utilisateur connecté sur /login → rediriger (RG-AUTH-11) ─
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.redirect(
      new URL(ROLE_HOME[role] ?? '/dashboard', request.url),
    )
  }

  // ── Vérification RBAC (RG-AUTH-04, RG-AUTH-05) ──────────────
  for (const { prefix, allowed } of ROLE_ROUTES) {
    if (pathname.startsWith(prefix) && !allowed.includes(role)) {
      // Redirige vers la page d'accueil du rôle, pas /login
      return NextResponse.redirect(
        new URL(ROLE_HOME[role] ?? '/login', request.url),
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Exclure :
     * - _next/static (assets statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - api/ (les API routes gèrent leur propre auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
