export interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id: number
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface FetchManyOptions {
  page?: number
  pageSize?: number
  orderBy?: string
  ascending?: boolean
  filters?: Record<string, unknown>
}

export interface DbResult<T> {
  data: T | null
  error: Error | null
}

export interface DbListResult<T> {
  data: T[]
  count: number | null
  error: Error | null
}
