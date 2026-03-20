import { NextResponse } from 'next/server'
import { exportUserData } from '@unanima/rgpd'
import { logAudit } from '@unanima/db'
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from '@/lib/api/utils'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return serverErrorResponse('Configuration Supabase manquante')
  }

  const { data, error } = await exportUserData({
    userId: user.id,
    supabaseUrl,
    supabaseServiceRoleKey,
    additionalTables: ['etablissements', 'diagnostics', 'indicateurs', 'recommandations'],
  })

  if (error) {
    return serverErrorResponse(error.message)
  }

  await logAudit(user.id, 'rgpd_export', 'profiles', user.id)

  return NextResponse.json({ data })
}
