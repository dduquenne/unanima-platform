# TypeScript Patterns pour Supabase

## Client type - pattern recommande

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

## Helpers de types derives

```typescript
// src/types/entities.ts
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

// Types Row/Insert/Update pour chaque entite
export type WorkOrder       = Tables['work_orders']['Row']
export type WorkOrderInsert = Tables['work_orders']['Insert']
export type WorkOrderUpdate = Tables['work_orders']['Update']

// Type avec jointures (pour les queries composees)
export type WorkOrderWithOwner = WorkOrder & {
  owner: Pick<Tables['profiles']['Row'], 'id' | 'full_name' | 'email'>
}

// Helper generique pour les reponses Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}
```

## Repository pattern type-safe

```typescript
// src/repositories/work-orders.repository.ts
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { WorkOrderInsert, WorkOrderUpdate } from '@/types/entities'

export class WorkOrderRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async findByOrg(orgId: string) {
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('id, reference, status, created_at, owner:profiles(full_name)')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async create(payload: WorkOrderInsert) {
    const { data, error } = await this.supabase
      .from('work_orders')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
```
