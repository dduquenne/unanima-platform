import { createClient } from '@supabase/supabase-js'

interface AuditAccessOptions {
  userId: string
  supabaseUrl: string
  supabaseServiceRoleKey: string
}

interface AuditEntry {
  id: number
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

export async function getAuditAccess({
  userId,
  supabaseUrl,
  supabaseServiceRoleKey,
}: AuditAccessOptions): Promise<{ data: AuditEntry[]; error: Error | null }> {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, details, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  return { data: (data as AuditEntry[]) ?? [], error: null }
}
