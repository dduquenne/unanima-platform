import { createClient } from '@supabase/supabase-js'
import { validateTableNames } from './validate-tables'

interface DeleteAccountOptions {
  userId: string
  supabaseUrl: string
  supabaseServiceRoleKey: string
  additionalTables?: string[]
  allowedTables: string[]
}

export async function deleteAccount({
  userId,
  supabaseUrl,
  supabaseServiceRoleKey,
  additionalTables = [],
  allowedTables,
}: DeleteAccountOptions): Promise<{ error: Error | null }> {
  try {
    validateTableNames(additionalTables, allowedTables)
  } catch (err) {
    return { error: err as Error }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Use atomic PostgreSQL function for data deletion
  const { error: rpcError } = await supabase.rpc('delete_user_account', {
    target_user_id: userId,
    additional_tables: additionalTables,
  })

  if (rpcError) {
    return { error: new Error(`Atomic deletion failed: ${rpcError.message}`) }
  }

  // Delete auth user (must be done via Admin API, outside the SQL transaction)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    return { error: new Error(`Failed to delete auth user: ${authError.message}`) }
  }

  return { error: null }
}
