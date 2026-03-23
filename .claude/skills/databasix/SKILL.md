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
- `references/sql-examples.md` — Exemples SQL complets (schema, migrations, RLS, audit, pgTAP, seed)
- `references/typescript-examples.md` — Client typé, helpers de types, repository pattern, Edge Functions

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

Client typé avec `createBrowserClient<Database>`, helpers de types dérivés (Row/Insert/Update)
et repository pattern type-safe avec exemples complets.

> 📖 Voir `references/typescript-examples.md` pour le client typé, les helpers de types et le repository pattern

---

## 5. Performance & Optimisation

### Stratégie d'indexation

| Type d'index | Cas d'usage |
|---|---|
| B-tree sur `user_id`, `org_id` | Colonnes de filtrage RLS |
| Partiel `WHERE deleted_at IS NULL` | Soft-delete (réduit la taille) |
| GIN sur `metadata` | Recherche JSONB |
| GIN sur `search_vector` (tsvector) | Full-text search |
| B-tree DESC sur `created_at` | Tri fréquent |

### Diagnostics

Utiliser `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)` sur les requêtes critiques.
Cible : < 50ms. Surveiller les Seq Scan (manque d'index) et Planning Time (RLS trop complexes).

### Connection pooling

Transaction Pooler (port 6543) pour Edge Functions/serveur, Session Pooler (port 5432) pour migrations.

> 📖 Voir `references/performance-guide.md` pour les patterns avancés (matviews, pagination keyset, partitionnement)

---

## 6. Transactions & Consistance

Deux approches pour les opérations atomiques :
- **Edge Functions** : pattern postgresjs avec `sql.begin()`, RLS configuré via `set_config`
- **Stored procedures** : `SECURITY INVOKER` pour respecter le RLS de l'appelant

> 📖 Voir `references/sql-examples.md#stored-procedure` et `references/typescript-examples.md#edge-function` pour les exemples complets (Edge Functions, stored procedures)

---

## 7. Tests pgTAP

Tests structurés en fichiers séparés : setup, schema, RLS par table, functions, triggers.
Exécuter avec `supabase test db` en local, intégré en CI via GitHub Actions.

> 📖 Voir `references/sql-examples.md#pgtap-test-template` pour la structure recommandée et le template de test RLS complet

---

## 8. Données de Référence & Seed

- Seed SQL avec `ON CONFLICT DO UPDATE` pour les données de référence (idempotent)
- Fixtures TypeScript avec `crypto.randomUUID()` pour isolation par test run
- Ne jamais mettre de données utilisateurs dans `seed.sql`

> 📖 Voir `references/sql-examples.md#seed-pattern` pour les patterns de seed et `references/typescript-examples.md#e2e-test-fixtures` pour les fixtures

---

## 9. Audit Trail & Logging

Table dans le schéma `private` (non exposé par PostgREST). Trigger automatique
calculant le diff JSONB des colonnes modifiées. Index sur `(table_name, record_id)` et `(changed_by, changed_at)`.

> 📖 Voir `references/sql-examples.md#audit-trail` pour la table d'audit complète et le trigger automatique

---

## 10. Patterns Avancés

### Multi-tenant (organisations)
Voir `references/schema-patterns.md#multi-tenant` pour le schéma complet avec RLS hiérarchique.

### JSONB pour métadonnées flexibles

Utiliser des contraintes `CHECK` pour valider la structure JSONB (ex: clés requises, valeurs enum).

> 📖 Voir `references/schema-patterns.md` pour les patterns JSONB avancés

### Realtime — abonnements filtrés

Toujours filtrer avec `filter: \`org_id=eq.\${orgId}\`` pour éviter la surcharge en production.

### Vues sécurisées (PostgreSQL 15+)

Utiliser `WITH (security_invoker = true)` pour que la vue respecte les RLS de l'appelant.

> 📖 Voir `references/schema-patterns.md` pour les exemples complets de vues sécurisées

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
