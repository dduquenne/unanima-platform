# Transactions & Consistance

## Edge Functions avec transactions (pattern postgresjs)

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

## Stored procedures pour operations critiques

```sql
CREATE OR REPLACE FUNCTION public.transfer_ownership(
  p_resource_id uuid,
  p_new_owner_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY INVOKER AS $$
BEGIN
  UPDATE public.resources
  SET owner_id = p_new_owner_id, updated_at = now()
  WHERE id = p_resource_id;

  INSERT INTO public.audit_log(table_name, record_id, action, changed_by, changes)
  VALUES ('resources', p_resource_id, 'transfer_ownership', auth.uid(),
          jsonb_build_object('new_owner', p_new_owner_id));
END;
$$;
```
