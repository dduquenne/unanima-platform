# SQL Examples — Databasix Reference

## Schema Convention Example (work_orders)

```sql
-- Tables : snake_case pluriel
-- Colonnes : snake_case
-- Index : idx_{table}_{colonne(s)}
-- Contraintes FK : fk_{table}_{colonne}__{ref_table}_{ref_colonne}
-- Politiques RLS : "{Table} — {role} peut {action}"

CREATE TABLE public.work_orders (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference   text        NOT NULL UNIQUE,
  status      text        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','submitted','approved','rejected','closed')),
  owner_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id      uuid        NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metadata    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz          -- soft delete
);
```

## Trigger updated_at (generic)

```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

## Migration Template

```sql
-- Migration: 20250320_add_work_orders.sql
-- Description: Creation de la table work_orders avec RLS et index

BEGIN;

-- 1. Creation de la table
CREATE TABLE IF NOT EXISTS public.work_orders (
  -- colonnes...
);

-- 2. RLS immediatement apres creation
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- 3. Index strategiques
CREATE INDEX idx_work_orders_org_id     ON public.work_orders(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_owner_id   ON public.work_orders(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_status     ON public.work_orders(status) WHERE deleted_at IS NULL;

-- 4. Trigger updated_at
CREATE TRIGGER trg_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Politiques RLS
CREATE POLICY "WorkOrders — membres peuvent voir les leurs"
  ON public.work_orders FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

COMMIT;
```

## RLS Optimization Patterns

```sql
-- LENT — evalue auth.uid() pour chaque ligne
CREATE POLICY "lente" ON public.documents FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
  ));

-- RAPIDE — fonction security definer cachee par le planificateur
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
$$;

CREATE POLICY "rapide" ON public.documents FOR SELECT
  USING (org_id IN (SELECT public.get_user_org_ids()));

-- ENCORE PLUS RAPIDE — wrap dans SELECT pour forcer le cache initPlan
CREATE POLICY "optimale" ON public.documents FOR SELECT
  USING (org_id = ANY(ARRAY(SELECT public.get_user_org_ids())));
```

## RBAC with org_members

```sql
CREATE TABLE public.org_members (
  org_id  uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  PRIMARY KEY (org_id, user_id)
);

CREATE OR REPLACE FUNCTION public.has_org_role(p_org_id uuid, p_role text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = p_org_id AND user_id = auth.uid() AND role = p_role
  )
$$;
```

## Indexation Checklist

```sql
-- 1. Colonnes de filtrage RLS -> toujours indexees
CREATE INDEX idx_t_user_id ON t(user_id);
CREATE INDEX idx_t_org_id  ON t(org_id);

-- 2. Index partiels pour soft-delete
CREATE INDEX idx_t_active ON t(org_id, created_at) WHERE deleted_at IS NULL;

-- 3. Index GIN pour recherche JSONB
CREATE INDEX idx_t_metadata ON t USING GIN(metadata);
CREATE INDEX idx_t_metadata_tags ON t USING GIN((metadata->'tags'));

-- 4. Index GIN pour recherche full-text
ALTER TABLE public.documents ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
CREATE INDEX idx_documents_search ON public.documents USING GIN(search_vector);

-- 5. Index sur colonnes de tri frequent
CREATE INDEX idx_t_created_at ON t(created_at DESC);
```

## EXPLAIN ANALYZE

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM public.work_orders
WHERE org_id = 'xxx' AND deleted_at IS NULL
ORDER BY created_at DESC LIMIT 20;

-- Surveiller : Seq Scan sur grandes tables -> manque d'index
-- Surveiller : Planning Time eleve -> politiques RLS trop complexes
-- Cible : < 50ms pour les requetes courantes
```

## Stored Procedure (transfer_ownership)

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

## Audit Trail — Table and Trigger

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
  changes     jsonb,
  ip_address  inet,
  user_agent  text
);

CREATE INDEX idx_audit_record ON private.audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON private.audit_log(changed_by, changed_at DESC);

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

## pgTAP Test Template (RLS)

```sql
BEGIN;
SELECT plan(6);

SELECT tests.create_supabase_user('alice@test.com');
SELECT tests.create_supabase_user('bob@test.com');

SELECT tests.authenticate_as('alice@test.com');
INSERT INTO public.organizations(id, name) VALUES ('org-alice', 'Alice Corp');
INSERT INTO public.org_members(org_id, user_id, role)
  VALUES ('org-alice', tests.get_supabase_uid('alice@test.com'), 'owner');
INSERT INTO public.work_orders(id, reference, org_id, owner_id)
  VALUES ('wo-1', 'WO-001', 'org-alice', tests.get_supabase_uid('alice@test.com'));

SELECT results_eq(
  $$ SELECT reference FROM public.work_orders WHERE id = 'wo-1' $$,
  $$ VALUES ('WO-001'::text) $$,
  'alice peut voir sa propre work order'
);

SELECT tests.authenticate_as('bob@test.com');
SELECT is_empty(
  $$ SELECT id FROM public.work_orders WHERE id = 'wo-1' $$,
  'bob ne peut pas voir la work order d''alice'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'work_orders'),
  'RLS active sur work_orders'
);

SELECT * FROM finish();
ROLLBACK;
```

## Seed Pattern

```sql
INSERT INTO public.status_types(code, label, color) VALUES
  ('draft',     'Brouillon',  '#gray'),
  ('submitted', 'Soumis',     '#blue'),
  ('approved',  'Approuve',   '#green'),
  ('rejected',  'Rejete',     '#red')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color;
```

## JSONB Validation

```sql
ALTER TABLE public.work_orders
  ADD CONSTRAINT chk_metadata_schema
  CHECK (
    metadata ? 'version' AND
    (metadata->>'priority') IN ('low','medium','high','critical')
  );
```

## Secure Views (PostgreSQL 15+)

```sql
CREATE VIEW public.work_orders_summary
  WITH (security_invoker = true) AS
SELECT
  wo.id, wo.reference, wo.status,
  p.full_name AS owner_name,
  COUNT(woi.id) AS items_count
FROM public.work_orders wo
JOIN public.profiles p ON p.id = wo.owner_id
LEFT JOIN public.work_order_items woi ON woi.work_order_id = wo.id
WHERE wo.deleted_at IS NULL
GROUP BY wo.id, wo.reference, wo.status, p.full_name;
```
