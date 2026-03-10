import { createBrowserClient } from './client'

export async function logAudit(
  userId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>,
): Promise<{ error: Error | null }> {
  const supabase = createBrowserClient()

  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details: details ?? null,
  })

  return {
    error: error ? new Error(error.message) : null,
  }
}
