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

  for (const table of additionalTables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) {
      return { error: new Error(`Failed to delete from ${table}: ${error.message}`) }
    }
  }

  const { error: auditError } = await supabase
    .from('audit_logs')
    .delete()
    .eq('user_id', userId)

  if (auditError) {
    return { error: new Error(`Failed to delete audit logs: ${auditError.message}`) }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) {
    return { error: new Error(`Failed to delete profile: ${profileError.message}`) }
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    return { error: new Error(`Failed to delete auth user: ${authError.message}`) }
  }

  return { error: null }
}
