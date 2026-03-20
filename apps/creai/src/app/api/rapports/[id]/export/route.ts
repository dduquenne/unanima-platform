import { NextRequest, NextResponse } from 'next/server'
import { fetchOne } from '@unanima/db'
import type { Rapport } from '@/lib/types'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api/utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:reports') && !checkPermission(user.role, 'read:etablissements')) {
    return forbiddenResponse()
  }

  const { data: rapport, error } = await fetchOne<Rapport>('rapports', id)
  if (error) return serverErrorResponse(error.message)
  if (!rapport) return notFoundResponse('Rapport')

  const format = request.nextUrl.searchParams.get('format') ?? 'json'

  switch (format) {
    case 'json': {
      return NextResponse.json(rapport.contenu, {
        headers: {
          'Content-Disposition': `attachment; filename="rapport-${id}.json"`,
        },
      })
    }

    case 'csv': {
      const contenu = rapport.contenu as Record<string, unknown>
      const rows: string[][] = [['Champ', 'Valeur']]

      function flatten(obj: Record<string, unknown>, prefix = '') {
        for (const [key, val] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key
          if (val && typeof val === 'object' && !Array.isArray(val)) {
            flatten(val as Record<string, unknown>, fullKey)
          } else {
            rows.push([fullKey, String(val ?? '')])
          }
        }
      }

      flatten(contenu)
      const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="rapport-${id}.csv"`,
        },
      })
    }

    default:
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez json ou csv.', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
  }
}
