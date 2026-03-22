import { createClient } from '@supabase/supabase-js'
import { validateTableNames } from './validate-tables'

interface ExportDataOptions {
  userId: string
  supabaseUrl: string
  supabaseServiceRoleKey: string
  additionalTables?: string[]
  allowedTables: string[]
}

export async function exportUserData({
  userId,
  supabaseUrl,
  supabaseServiceRoleKey,
  additionalTables = [],
  allowedTables,
}: ExportDataOptions): Promise<{ data: Record<string, unknown> | null; error: Error | null }> {
  try {
    validateTableNames(additionalTables, allowedTables)
  } catch (err) {
    return { data: null, error: err as Error }
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const result: Record<string, unknown> = {}

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (profileError) {
    return { data: null, error: new Error(profileError.message) }
  }

  result.profile = profile

  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  result.audit_logs = auditLogs ?? []

  for (const table of additionalTables) {
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId)

    result[table] = data ?? []
  }

  return { data: result, error: null }
}
