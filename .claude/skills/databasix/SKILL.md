---
name: databasix
description: >
  Expert en conception, création, alimentation, optimisation et sécurisation de bases de données
  pour applications métier TypeScript + Supabase (PostgreSQL). Utilise ce skill dès qu'une question
  touche à la modélisation de schéma, aux migrations Supabase, aux politiques RLS, à la génération
  de types TypeScript, aux index de performance, aux transactions, aux Edge Functions avec accès BDD,
  à l'audit/logging, aux tests pgTAP, ou à tout aspect de la couche données d'un projet Supabase.
  Déclenche également pour : "schéma de base", "migration supabase", "politique RLS", "types générés",
  "optimisation requête", "connexion pooling", "seed de données", "sécurité base de données",
  "audit trail", "soft delete", "multi-tenant", "relation FK", "index btree/gin/gist", "EXPLAIN ANALYZE".
  Ce skill est ESSENTIEL pour toute question sur la couche données — même indirecte (ex: "comment
  stocker les préférences utilisateurs", "comment gérer les permissions", "comment auditer les actions").
compatibility:
  recommends:
    - archicodix   # Quand le schéma BDD traduit un modèle de domaine ou impacte l'architecture applicative
    - optimix      # Quand l'optimisation concerne les requêtes, index, pooling ou performance BDD
    - migratix     # Pour les migrations de schéma (expand/contract, zero downtime, backfill, rollback)
    - securix      # Pour la sécurisation de la couche données (RLS, chiffrement, audit trail)
    - rgpdix       # Quand les données personnelles sont concernées (conservation, anonymisation, droit à l'oubli)
    - datanalytix  # Pour les vues analytiques, agrégations, KPIs et pipelines de données
    - soclix       # Quand la modification touche les tables communes (profiles, audit_logs)
---

# Databasix — Expert Base de Données Supabase × TypeScript

Compétence spécialisée dans la conception, la mise en œuvre, l'optimisation et la sécurisation
de la couche données d'applications métier TypeScript utilisant Supabase (PostgreSQL).

---

## 🗺️ Navigation rapide

| Besoin | Section |
|---|---|
| Modélisation & schéma | [Conception du Schéma](#1-conception-du-schéma) |
| Migrations CLI | [Migrations](#2-migrations--versioning) |
| Sécurité & RLS | [Sécurité](#3-sécurité--rls) |
| Types TypeScript | [Types générés](#4-types-typescript-générés) |
| Performance & Index | [Performance](#5-performance--optimisation) |
| Transactions | [Transactions](#6-transactions--consistance) |
| Tests pgTAP | [Tests](#7-tests-pgtap) |
| Seeding & fixtures | [Données](#8-données-de-référence--seed) |
| Audit & Logging | [Audit](#9-audit-trail--logging) |
| Patterns avancés | [Patterns](#10-patterns-avancés) |

Pour les détails approfondis, consulte les fichiers de référence :
- `references/schema-patterns.md` — Patterns de schéma complets (multi-tenant, soft-delete, JSONB…)
- `references/rls-recipes.md` — Recettes RLS de production (SaaS, multi-tenant, RBAC…)
- `references/performance-guide.md` — Guide complet d'optimisation des performances

---

## 1. Conception du Schéma

### Conventions de nommage obligatoires
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

### Règles fondamentales
- **UUID v4** via `gen_random_uuid()` pour toutes les PKs (jamais serial/bigserial en public)
- **timestamptz** toujours (jamais `timestamp` sans timezone)
- **NOT NULL par défaut** — null autorisé seulement si sémantiquement nécessaire
- **Contraintes CHECK** inline pour les enum métier simples ; table de référence pour les listes évolutives
- **Soft delete** : colonne `deleted_at timestamptz` + index partiel + politique RLS qui filtre
- **Trigger updated_at** : toujours automatisé (voir ci-dessous)

```sql
-- Trigger générique updated_at (à créer une seule fois)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Application sur chaque table
CREATE TRIGGER trg_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

---

## 2. Migrations & Versioning

### Workflow obligatoire (jamais de modif directe en Studio)
```bash
# 1. Démarrer l'environnement local
supabase start

# 2. Créer une migration nommée explicitement
supabase migration new add_work_orders_table

# 3. Écrire le SQL dans supabase/migrations/YYYYMMDDHHMMSS_add_work_orders_table.sql

# 4. Appliquer localement et tester
supabase db reset   # reset complet
# ou
supabase migration up  # migration incrémentale

# 5. Valider avec pgTAP
supabase test db

# 6. Régénérer les types TypeScript
supabase gen types typescript --local > src/types/database.types.ts

# 7. Pusher vers le projet distant (après validation staging)
supabase db push
```

### Structure d'un fichier de migration robuste
```sql
-- Migration: 20250320_add_work_orders.sql
-- Description: Création de la table work_orders avec RLS et index

BEGIN;

-- ① Création de la table
CREATE TABLE IF NOT EXISTS public.work_orders (
  -- colonnes…
);

-- ② RLS immédiatement après création
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- ③ Index stratégiques
CREATE INDEX idx_work_orders_org_id     ON public.work_orders(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_owner_id   ON public.work_orders(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_work_orders_status     ON public.work_orders(status) WHERE deleted_at IS NULL;

-- ④ Trigger updated_at
CREATE TRIGGER trg_work_orders_updated_at
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ⑤ Politiques RLS (voir section 3)
CREATE POLICY "WorkOrders — membres peuvent voir les leurs"
  ON public.work_orders FOR SELECT
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));

COMMIT;
```

---

## 3. Sécurité & RLS

### Règle absolue
> **RLS activé sur TOUTES les tables du schéma `public` sans exception.**
> La clé `service_role` ne doit JAMAIS être exposée côté client.

### Pattern d'optimisation RLS (critique en production)

```sql
-- ❌ LENT — évalue auth.uid() pour chaque ligne
CREATE POLICY "lente" ON public.documents FOR SELECT
  USING (org_id IN (
    SELECT org_id FROM public.memberships WHERE user_id = auth.uid()
  ));

-- ✅ RAPIDE — fonction security definer cachée par le planificateur
CREATE OR REPLACE FUNCTION public.get_user_org_ids()
RETURNS SETOF uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT org_id FROM public.org_members WHERE user_id = auth.uid()
$$;

CREATE POLICY "rapide" ON public.documents FOR SELECT
  USING (org_id IN (SELECT public.get_user_org_ids()));

-- ✅✅ ENCORE PLUS RAPIDE — wrap dans SELECT pour forcer le cache initPlan
CREATE POLICY "optimale" ON public.documents FOR SELECT
  USING (org_id = ANY(ARRAY(SELECT public.get_user_org_ids())));
```

### Index sur les colonnes RLS (gain 100x sur grandes tables)
```sql
-- Index sur la colonne utilisée dans la politique
CREATE INDEX idx_documents_org_id ON public.documents(org_id);
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
```

### Rôles custom pour RBAC
```sql
-- Jamais utiliser user_metadata pour les rôles (modifiable par l'utilisateur !)
-- Utiliser une table de membership avec rôles vérifiés
CREATE TABLE public.org_members (
  org_id  uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role    text NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
  PRIMARY KEY (org_id, user_id)
);

-- Fonction helper sécurisée
CREATE OR REPLACE FUNCTION public.has_org_role(p_org_id uuid, p_role text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = p_org_id AND user_id = auth.uid() AND role = p_role
  )
$$;
```

> 📖 Voir `references/rls-recipes.md` pour les recettes complètes (SaaS multi-tenant, héritage parent→enfant, soft delete + RLS, rate limiting)

---

## 4. Types TypeScript Générés

### Génération et intégration
```bash
# Générer depuis l'instance locale
supabase gen types typescript --local > src/types/database.types.ts

# Depuis le projet distant (CI/CD)
supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts
```

### Client typé — pattern recommandé
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

### Helpers de types dérivés
```typescript
// src/types/entities.ts
import type { Database } from './database.types'

type Tables = Database['public']['Tables']

// Types Row/Insert/Update pour chaque entité
export type WorkOrder       = Tables['work_orders']['Row']
export type WorkOrderInsert = Tables['work_orders']['Insert']
export type WorkOrderUpdate = Tables['work_orders']['Update']

// Type avec jointures (pour les queries composées)
export type WorkOrderWithOwner = WorkOrder & {
  owner: Pick<Tables['profiles']['Row'], 'id' | 'full_name' | 'email'>
}

// Helper générique pour les réponses Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}
```

### Repository pattern type-safe
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

---

## 5. Performance & Optimisation

### Checklist d'indexation
```sql
-- ① Colonnes de filtrage RLS → toujours indexées
CREATE INDEX idx_t_user_id ON t(user_id);
CREATE INDEX idx_t_org_id  ON t(org_id);

-- ② Index partiels pour soft-delete (réduit la taille de l'index)
CREATE INDEX idx_t_active ON t(org_id, created_at) WHERE deleted_at IS NULL;

-- ③ Index GIN pour recherche JSONB
CREATE INDEX idx_t_metadata ON t USING GIN(metadata);
-- ou pour un champ spécifique :
CREATE INDEX idx_t_metadata_tags ON t USING GIN((metadata->'tags'));

-- ④ Index GIN pour recherche full-text
ALTER TABLE public.documents ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('french', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
CREATE INDEX idx_documents_search ON public.documents USING GIN(search_vector);

-- ⑤ Index sur colonnes de tri fréquent
CREATE INDEX idx_t_created_at ON t(created_at DESC);
```

### Diagnostics avec EXPLAIN ANALYZE
```sql
-- Toujours utiliser EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM public.work_orders
WHERE org_id = 'xxx' AND deleted_at IS NULL
ORDER BY created_at DESC LIMIT 20;

-- Surveiller : Seq Scan sur grandes tables → manque d'index
-- Surveiller : Planning Time élevé → politiques RLS trop complexes
-- Cible : < 50ms pour les requêtes courantes
```

### Connection pooling (obligatoire en production)
```typescript
// Utiliser le Transaction Pooler Supabase (port 6543) pour les Edge Functions / serveur
// Utiliser le Session Pooler (port 5432) pour les migrations et scripts

// Variables d'environnement à séparer :
// DATABASE_URL=postgres://...@pooler.supabase.com:6543/postgres?pgbouncer=true
// DIRECT_URL=postgres://...@db.supabase.com:5432/postgres  (migrations uniquement)
```

> 📖 Voir `references/performance-guide.md` pour les patterns avancés (matviews, pagination keyset, partitionnement)

---

## 6. Transactions & Consistance

### Edge Functions avec transactions (pattern Kysely)
```typescript
// supabase/functions/merge-contacts/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import postgres from 'https://deno.land/x/postgresjs/mod.js'

serve(async (req) => {
  const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!)

  // Transaction avec RLS explicitement configurée
  await sql.begin(async (tx) => {
    // Forcer l'uid pour respecter les politiques RLS
    await tx`SELECT set_config('request.jwt.claims', ${JSON.stringify({ sub: userId })}, true)`
    await tx`SET LOCAL role = 'authenticated'`

    // Opérations atomiques
    await tx`UPDATE contacts SET merged_into = ${targetId} WHERE id = ${sourceId}`
    await tx`UPDATE orders SET contact_id = ${targetId} WHERE contact_id = ${sourceId}`
    await tx`DELETE FROM contacts WHERE id = ${sourceId}`
  })

  return new Response(JSON.stringify({ success: true }))
})
```

### Stored procedures pour opérations critiques
```sql
-- Alternative : procédure SQL avec SECURITY INVOKER (respecte le RLS de l'appelant)
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

---

## 7. Tests pgTAP

### Structure recommandée
```
supabase/tests/
├── 000-setup.sql          ← helpers et utilisateurs de test
├── 001-schema.sql         ← structure des tables
├── 002-rls-work-orders.sql ← politiques RLS de work_orders
├── 003-functions.sql      ← fonctions métier
└── 004-triggers.sql       ← triggers et automatismes
```

### Template de test RLS complet
```sql
-- supabase/tests/002-rls-work-orders.sql
BEGIN;
SELECT plan(6);

-- Création des utilisateurs de test
SELECT tests.create_supabase_user('alice@test.com');
SELECT tests.create_supabase_user('bob@test.com');

-- Setup : alice crée une org et une work order
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

-- Test 2 : bob ne peut PAS voir la work order d'alice
SELECT tests.authenticate_as('bob@test.com');
SELECT is_empty(
  $$ SELECT id FROM public.work_orders WHERE id = 'wo-1' $$,
  'bob ne peut pas voir la work order d''alice'
);

-- Test 3 : RLS activé sur la table
SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE relname = 'work_orders'),
  'RLS activé sur work_orders'
);

SELECT * FROM finish();
ROLLBACK;
```

### Commandes de test
```bash
# Tests locaux
supabase test db

# Tests en CI (GitHub Actions)
# Voir references/ci-workflow.yml
```

---

## 8. Données de Référence & Seed

### Pattern de seed sécurisé
```sql
-- supabase/seed.sql — données de référence non-destructives
INSERT INTO public.status_types(code, label, color) VALUES
  ('draft',     'Brouillon',  '#gray'),
  ('submitted', 'Soumis',     '#blue'),
  ('approved',  'Approuvé',   '#green'),
  ('rejected',  'Rejeté',     '#red')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color;

-- Données de développement (uniquement via fixtures TypeScript)
-- Ne jamais mettre de données utilisateurs dans seed.sql
```

### Fixtures TypeScript pour les tests E2E
```typescript
// tests/fixtures/work-orders.fixture.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function seedWorkOrders(supabase: ReturnType<typeof createClient<Database>>) {
  const orgId = crypto.randomUUID()  // ID unique par test run → isolation garantie

  await supabase.from('organizations').insert({ id: orgId, name: 'Test Org' })
  // ... reste du seed
  return { orgId }
}
```

---

## 9. Audit Trail & Logging

### Table d'audit générique
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
  changes     jsonb,      -- diff calculé
  ip_address  inet,
  user_agent  text
);

-- Schéma private = non exposé par PostgREST → sécurisé par défaut
-- Index pour les requêtes d'audit fréquentes
CREATE INDEX idx_audit_record ON private.audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_by ON private.audit_log(changed_by, changed_at DESC);
```

### Trigger d'audit automatique
```sql
CREATE OR REPLACE FUNCTION private.audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_changes jsonb;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Calcul du diff (seulement les colonnes modifiées)
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

---

## 10. Patterns Avancés

### Multi-tenant (organisations)
Voir `references/schema-patterns.md#multi-tenant` pour le schéma complet avec RLS hiérarchique.

### JSONB pour métadonnées flexibles
```sql
-- Validation JSONB avec contrainte CHECK
ALTER TABLE public.work_orders
  ADD CONSTRAINT chk_metadata_schema
  CHECK (
    metadata ? 'version' AND
    (metadata->>'priority') IN ('low','medium','high','critical')
  );
```

### Realtime — abonnements filtrés
```typescript
// Toujours filtrer les abonnements Realtime (éviter la surcharge)
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

### Vues sécurisées (PostgreSQL 15+)
```sql
-- SECURITY INVOKER = la vue respecte les RLS de l'utilisateur appelant
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

---

## ✅ Checklist de livraison

Avant chaque déploiement en production, vérifier :

- [ ] RLS activé sur toutes les tables `public`
- [ ] Aucune clé `service_role` dans le code client
- [ ] Tous les index RLS en place (`user_id`, `org_id`)
- [ ] Types TypeScript régénérés (`supabase gen types`)
- [ ] Migrations testées sur environnement staging
- [ ] Tests pgTAP verts (`supabase test db`)
- [ ] `EXPLAIN ANALYZE` < 50ms sur les requêtes critiques
- [ ] Trigger `updated_at` sur toutes les tables éditables
- [ ] Abonnements Realtime avec filtres explicites
- [ ] Audit log activé sur les tables métier sensibles
- [ ] Backup testé et restauration validée
