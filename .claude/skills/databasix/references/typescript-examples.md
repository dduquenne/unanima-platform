# TypeScript Examples — Databasix Reference

## Typed Supabase Client

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

## Derived Type Helpers

```typescript
// src/types/entities.ts
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

export type WorkOrder       = Tables['work_orders']['Row']
export type WorkOrderInsert = Tables['work_orders']['Insert']
export type WorkOrderUpdate = Tables['work_orders']['Update']

export type WorkOrderWithOwner = WorkOrder & {
  owner: Pick<Tables['profiles']['Row'], 'id' | 'full_name' | 'email'>
}

export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}
```

## Repository Pattern (type-safe)

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

## Edge Function with Transaction (Kysely pattern)

```typescript
// supabase/functions/merge-contacts/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import postgres from 'https://deno.land/x/postgresjs/mod.js'

serve(async (req) => {
  const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!)

  await sql.begin(async (tx) => {
    await tx`SELECT set_config('request.jwt.claims', ${JSON.stringify({ sub: userId })}, true)`
    await tx`SET LOCAL role = 'authenticated'`

    await tx`UPDATE contacts SET merged_into = ${targetId} WHERE id = ${sourceId}`
    await tx`UPDATE orders SET contact_id = ${targetId} WHERE contact_id = ${sourceId}`
    await tx`DELETE FROM contacts WHERE id = ${sourceId}`
  })

  return new Response(JSON.stringify({ success: true }))
})
```

## Connection Pooling Config

```typescript
// Transaction Pooler Supabase (port 6543) pour Edge Functions / serveur
// Session Pooler (port 5432) pour migrations et scripts
// DATABASE_URL=postgres://...@pooler.supabase.com:6543/postgres?pgbouncer=true
// DIRECT_URL=postgres://...@db.supabase.com:5432/postgres  (migrations uniquement)
```

## E2E Test Fixtures

```typescript
// tests/fixtures/work-orders.fixture.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function seedWorkOrders(supabase: ReturnType<typeof createClient<Database>>) {
  const orgId = crypto.randomUUID()
  await supabase.from('organizations').insert({ id: orgId, name: 'Test Org' })
  return { orgId }
}
```

## Realtime — Filtered Subscriptions

```typescript
const channel = supabase
  .channel('work-orders-org')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'work_orders',
    filter: `org_id=eq.${orgId}`  // OBLIGATOIRE en production
  }, handleChange)
  .subscribe()
```
