# Guide Performance — Databasix

Optimisation avancée des requêtes et de l'architecture pour applications Supabase en production.

---

## Table des matières
1. [Diagnostics](#1-diagnostics)
2. [Index avancés](#2-index-avancés)
3. [Pagination Keyset](#3-pagination-keyset)
4. [Vues matérialisées](#4-vues-matérialisées)
5. [Partitionnement](#5-partitionnement)
6. [Connection Pooling](#6-connection-pooling)
7. [Monitoring](#7-monitoring)

---

## 1. Diagnostics

```sql
-- Activer pg_stat_statements (une seule fois)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 des requêtes les plus lentes
SELECT
  round(mean_exec_time::numeric, 2) AS avg_ms,
  calls,
  round(total_exec_time::numeric, 2) AS total_ms,
  left(query, 100) AS query_preview
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Vérifier les Seq Scan sur grandes tables
SELECT
  relname AS table_name,
  seq_scan,
  idx_scan,
  n_live_tup AS live_rows
FROM pg_stat_user_tables
WHERE seq_scan > 0 AND n_live_tup > 10000
ORDER BY seq_scan DESC;

-- EXPLAIN ANALYZE complet
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT wo.*, p.full_name
FROM public.work_orders wo
JOIN public.profiles p ON p.id = wo.owner_id
WHERE wo.org_id = 'xxx' AND wo.deleted_at IS NULL
ORDER BY wo.created_at DESC
LIMIT 20;
-- ↑ Chercher : "Seq Scan" → ajouter index
-- ↑ Chercher : "Hash Join" sur grande table → envisager index sur FK
-- ↑ Cible : Planning Time < 5ms, Execution Time < 50ms
```

---

## 2. Index avancés

```sql
-- Index composite (ordre des colonnes = ordre d'utilisation dans les WHERE)
CREATE INDEX idx_wo_org_status_date
  ON public.work_orders(org_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- Index d'expression (pour les calculs fréquents)
CREATE INDEX idx_wo_year
  ON public.work_orders(EXTRACT(YEAR FROM created_at)::int);

-- Index GIN pour tableaux PostgreSQL
ALTER TABLE public.tasks ADD COLUMN assignee_ids uuid[];
CREATE INDEX idx_tasks_assignees ON public.tasks USING GIN(assignee_ids);
-- Requête : WHERE assignee_ids @> ARRAY['user-id'::uuid]

-- Index BRIN pour séries temporelles (très compact)
CREATE INDEX idx_events_created_brin
  ON public.events USING BRIN(created_at)
  WITH (pages_per_range = 128);
-- Efficace sur les tables append-only triées par date

-- Analyser l'utilisation des index (supprimer les inutilisés)
SELECT
  indexrelname AS index_name,
  idx_scan AS times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

---

## 3. Pagination Keyset

```sql
-- ❌ LENT pour les grandes pages : OFFSET N
SELECT * FROM public.items ORDER BY created_at DESC OFFSET 10000 LIMIT 20;
-- PostgreSQL doit scanner et ignorer 10000 lignes

-- ✅ RAPIDE : Keyset Pagination (cursor-based)
-- Page suivante : passer le (created_at, id) du dernier élément reçu
SELECT * FROM public.items
WHERE (created_at, id) < ($last_created_at, $last_id)  -- cursor
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- Index composite pour supporter cette requête
CREATE INDEX idx_items_cursor ON public.items(created_at DESC, id DESC)
  WHERE deleted_at IS NULL;
```

```typescript
// Implémentation TypeScript type-safe
interface CursorPage<T> {
  data: T[]
  nextCursor: { createdAt: string; id: string } | null
  hasMore: boolean
}

async function fetchPage<T extends { created_at: string; id: string }>(
  supabase: SupabaseClient<Database>,
  table: string,
  orgId: string,
  cursor?: { createdAt: string; id: string },
  limit = 20
): Promise<CursorPage<T>> {
  let query = supabase
    .from(table)
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit + 1)  // +1 pour détecter s'il y a une page suivante

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) throw error

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const last = items[items.length - 1]

  return {
    data: items as T[],
    nextCursor: hasMore ? { createdAt: last.created_at, id: last.id } : null,
    hasMore
  }
}
```

---

## 4. Vues matérialisées

```sql
-- Pour les agrégations coûteuses (tableaux de bord, rapports)
CREATE MATERIALIZED VIEW public.org_stats AS
SELECT
  org_id,
  COUNT(*) FILTER (WHERE status = 'draft')     AS draft_count,
  COUNT(*) FILTER (WHERE status = 'submitted') AS submitted_count,
  COUNT(*) FILTER (WHERE status = 'approved')  AS approved_count,
  COUNT(*) FILTER (WHERE deleted_at IS NULL)   AS active_count,
  MAX(created_at) AS last_activity
FROM public.work_orders
GROUP BY org_id;

CREATE UNIQUE INDEX idx_org_stats_org_id ON public.org_stats(org_id);

-- Rafraîchissement concurrent (sans bloquer les lectures)
REFRESH MATERIALIZED VIEW CONCURRENTLY public.org_stats;

-- Automatiser avec pg_cron (toutes les 5 minutes)
-- SELECT cron.schedule('refresh-org-stats', '*/5 * * * *',
--   'REFRESH MATERIALIZED VIEW CONCURRENTLY public.org_stats');
```

---

## 5. Partitionnement

```sql
-- Pour les tables avec des millions de lignes (logs, événements, métriques)
CREATE TABLE public.events (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  org_id      uuid        NOT NULL,
  event_type  text        NOT NULL,
  payload     jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now()
) PARTITION BY RANGE (created_at);

-- Partitions mensuelles
CREATE TABLE public.events_2025_01 PARTITION OF public.events
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE public.events_2025_02 PARTITION OF public.events
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ...

-- Index sur chaque partition
CREATE INDEX ON public.events_2025_01(org_id, created_at DESC);

-- Automatiser la création de partitions (pg_partman extension recommandée)
```

---

## 6. Connection Pooling

```
Supabase fournit deux poolers :

┌─────────────────────────────────────────────────────────────┐
│  Session Pooler (port 5432)                                 │
│  • Connexion persistante par client                         │
│  • Usage : migrations, scripts CLI, outils admin           │
│  • PAS pour les Edge Functions ou serverless                │
├─────────────────────────────────────────────────────────────┤
│  Transaction Pooler (port 6543)                             │
│  • Connexion partagée, libérée après chaque transaction     │
│  • Usage : toutes les applications web/serverless           │
│  • Supporte des milliers de connexions simultanées          │
└─────────────────────────────────────────────────────────────┘
```

```typescript
// Variables d'environnement recommandées
// .env.local
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres"

// Pour Prisma (si utilisé)
// schema.prisma
// datasource db {
//   provider  = "postgresql"
//   url       = env("DATABASE_URL")      // pooler pour runtime
//   directUrl = env("DIRECT_URL")        // direct pour migrations
// }
```

---

## 7. Monitoring

```sql
-- Vue de monitoring des connexions actives
SELECT
  pid,
  usename,
  application_name,
  state,
  wait_event_type,
  wait_event,
  now() - pg_stat_activity.query_start AS duration,
  left(query, 80) AS query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC;

-- Détecter les locks
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked ON blocked.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.pid != blocked_locks.pid
  AND blocking_locks.granted
JOIN pg_catalog.pg_stat_activity blocking ON blocking.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- Taille des tables
SELECT
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  pg_size_pretty(pg_relation_size(relid)) AS table_size,
  pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) AS index_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 20;
```

### Alertes à configurer
- Connexions > 80% du maximum → pooler saturé
- Requêtes > 1s → index manquant ou requête à optimiser
- Disque > 70% → archivage ou partitionnement nécessaire
- `seq_scan` sur tables > 100k lignes → index manquant
