import { NextResponse } from 'next/server'
import { fetchPiecesDetachees, testConnection } from '@/lib/connectors/sap'
import {
  getCurrentUser,
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
} from '@/lib/api/utils'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()
  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'read:pieces')) {
    return forbiddenResponse()
  }

  try {
    const [connectionTest, data] = await Promise.all([
      testConnection(),
      fetchPiecesDetachees(),
    ])

    return NextResponse.json({
      connection: connectionTest,
      data,
      count: data.length,
    })
  } catch (err: unknown) {
    return serverErrorResponse(err instanceof Error ? err.message : 'Erreur connecteur SAP')
  }
}
