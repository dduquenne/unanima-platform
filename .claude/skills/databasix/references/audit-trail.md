# Audit Trail & Logging

## Table d audit generique

```sql
CREATE TABLE private.audit_log (
  id          bigserial   PRIMARY KEY,
  table_name  text        NOT NULL,
  record_id   uuid        NOT NULL,
  action      text        NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE','CUSTOM')),
  changed_by  uuid        REFERENCES auth.users(id),
  changed_at  timestamptz NOT NULL DEFAULT now(),
  old_values  jsonb,
  new_values  jsonb,
  changes     jsonb,      -- diff calcule
  ip_address  inet,
  user_agent  text
);

-- Schema private = non expose par PostgREST -> securise par defaut
-- Index pour les requetes d audit frequentes
CREATE INDEX idx_audit_record ON private.audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON private.audit_log(changed_by, changed_at DESC);
```

## Trigger d audit automatique

```sql
CREATE OR REPLACE FUNCTION private.audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_changes jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value)
    INTO v_changes
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(NEW) -> key <> to_jsonb(OLD) -> key;
  END IF;

  INSERT INTO private.audit_log(table_name, record_id, action, changed_by, old_values, new_values, changes)
  VALUES (
    TG_TABLE_NAME,
    CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END,
    TG_OP,
    auth.uid(),
    CASE TG_OP WHEN 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE TG_OP WHEN 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
    v_changes
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;
```

## Donnees de Reference & Seed

### Pattern de seed securise

```sql
-- supabase/seed.sql
INSERT INTO public.status_types(code, label, color) VALUES
  ('draft',     'Brouillon',  '#gray'),
  ('submitted', 'Soumis',     '#blue'),
  ('approved',  'Approuve',   '#green'),
  ('rejected',  'Rejete',     '#red')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color;
```

### Fixtures TypeScript pour les tests E2E

```typescript
// tests/fixtures/work-orders.fixture.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function seedWorkOrders(supabase: ReturnType<typeof createClient<Database>>) {
  const orgId = crypto.randomUUID()  // ID unique par test run
  await supabase.from('organizations').insert({ id: orgId, name: 'Test Org' })
  return { orgId }
}
```
