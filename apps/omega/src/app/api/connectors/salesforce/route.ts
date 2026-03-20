import { NextResponse } from 'next/server'
import { fetchClientsVehicules, testConnection } from '@/lib/connectors/salesforce'
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
  if (!checkPermission(user.role, 'read:all') && !checkPermission(user.role, 'read:dashboard')) {
    return forbiddenResponse()
  }

  try {
    const [connectionTest, data] = await Promise.all([
      testConnection(),
      fetchClientsVehicules(),
    ])

    return NextResponse.json({
      connection: connectionTest,
      data,
      count: data.length,
    })
  } catch (err: unknown) {
    return serverErrorResponse(err instanceof Error ? err.message : 'Erreur connecteur Salesforce')
  }
}
