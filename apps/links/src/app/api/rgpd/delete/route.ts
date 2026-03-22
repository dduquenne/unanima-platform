import { NextResponse } from 'next/server'
import { deleteAccount } from '@unanima/rgpd'
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from '@/lib/api/utils'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return serverErrorResponse('Configuration Supabase manquante')
  }

  const { error } = await deleteAccount({
    userId: user.id,
    supabaseUrl,
    supabaseServiceRoleKey,
    additionalTables: ['beneficiaires', 'bilans', 'responses', 'documents'],
    allowedTables: ['beneficiaires', 'bilans', 'responses', 'documents'],
  })

  if (error) {
    return serverErrorResponse(error.message)
  }

  return NextResponse.json({ message: 'Compte supprimé avec succès' })
}
