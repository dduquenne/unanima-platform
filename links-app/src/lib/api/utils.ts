import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { hasPermission } from '@/lib/auth'
import { authConfig } from '../../config/auth.config'
import { cookies } from 'next/headers'
import type { ZodSchema } from 'zod'

export interface PaginationParams {
  page: number
  limit: number
  sort: string
  order: 'asc' | 'desc'
}

export interface ApiListResponse<T> {
  data: T[]
  meta: {
    total: number | null
    page: number
    limit: number
  }
}

export interface ApiErrorResponse {
  error: string
  code: string
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  return {
    page: Math.max(1, Number(searchParams.get('page')) || 1),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20)),
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') === 'asc' ? 'asc' : 'desc'),
  }
}

export function getFilters(request: NextRequest, allowedFilters: string[]): Record<string, string> {
  const searchParams = request.nextUrl.searchParams
  const filters: Record<string, string> = {}
  for (const key of allowedFilters) {
    const value = searchParams.get(key)
    if (value) {
      filters[key] = value
    }
  }
  return filters
}

export async function getCurrentUser(): Promise<{
  id: string
  role: string
} | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { id: user.id, role: profile.role }
}

export function checkPermission(userRole: string, permission: string): boolean {
  return hasPermission(userRole, permission, authConfig)
}

export function unauthorizedResponse(): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: 'Non authentifié', code: 'UNAUTHORIZED' },
    { status: 401 },
  )
}

export function forbiddenResponse(): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: 'Permission refusée', code: 'FORBIDDEN' },
    { status: 403 },
  )
}

export function notFoundResponse(entity: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: `${entity} non trouvé(e)`, code: 'NOT_FOUND' },
    { status: 404 },
  )
}

export function validationErrorResponse(message: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: 'VALIDATION_ERROR' },
    { status: 400 },
  )
}

export function serverErrorResponse(message: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    { error: message, code: 'SERVER_ERROR' },
    { status: 500 },
  )
}

export function parseBody<T>(schema: ZodSchema<T>, data: unknown): { data: T | null; error: string | null } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const message = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return { data: null, error: message }
  }
  return { data: result.data, error: null }
}
