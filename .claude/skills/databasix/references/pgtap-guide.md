# Tests pgTAP - Guide complet

## Structure recommandee

```
supabase/tests/
  000-setup.sql          - helpers et utilisateurs de test
  001-schema.sql         - structure des tables
  002-rls-work-orders.sql - politiques RLS de work_orders
  003-functions.sql      - fonctions metier
  004-triggers.sql       - triggers et automatismes
```

## Template de test RLS complet

```sql
-- supabase/tests/002-rls-work-orders.sql
BEGIN;
SELECT plan(6);

-- Creation des utilisateurs de test
SELECT tests.create_supabase_user('alice@test.com');
SELECT tests.create_supabase_user('bob@test.com');

-- Setup : alice cree une org et une work order
SELECT tests.authenticate_as('alice@test.com');
INSERT INTO public.organizations(id, name) VALUES ('org-alice', 'Alice Corp');
INSERT INTO public.org_members(org_id, user_id, role)
  VALUES ('org-alice', tests.get_supabase_uid('alice@test.com'), 'owner');
INSERT INTO public.work_orders(id, reference, org_id, owner_id)
  VALUES ('wo-1', 'WO-001', 'org-alice', tests.get_supabase_uid('alice@test.com'));

-- Test 1 : alice peut voir sa work order
SELECT results_eq(
  $$ SELECT reference FROM public.work_orders WHERE id = 'wo-1' $$,
  $$ VALUES ('WO-001'::text) $$,
  'alice peut voir sa propre work order'
);

-- Test 2 : bob ne peut PAS voir la work order d alice
SELECT tests.authenticate_as('bob@test.com');
SELECT is_empty(
  $$ SELECT id FROM public.work_orders WHERE id = 'wo-1' $$,
  'bob ne peut pas voir la work order d alice'
);

-- Test 3 : RLS active sur la table
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'work_orders'),
  'RLS active sur work_orders'
);

SELECT * FROM finish();
ROLLBACK;
```

## Commandes de test

```bash
# Tests locaux
supabase test db

# Tests en CI (GitHub Actions)
# Voir references/ci-workflow.yml
```
