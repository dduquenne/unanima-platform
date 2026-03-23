# Patterns ETL/ELT pour Supabase

## Pattern A — ETL léger (Edge Functions)

Pour les synchronisations de volume modéré (< 10 000 lignes/sync) :

```typescript
// supabase/functions/sync-salesforce/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Extract — Récupérer les données depuis la source
  const sfData = await fetchSalesforceRecords(lastSyncDate)

  // 2. Transform — Mapper vers le schéma interne
  const mapped = sfData.map(record => ({
    external_id: record.Id,
    source: 'salesforce',
    ticket_number: record.CaseNumber,
    status: mapSalesforceStatus(record.Status),
    priority: mapPriority(record.Priority),
    raw_data: record, // Conserver la donnée brute pour traçabilité
    synced_at: new Date().toISOString(),
  }))

  // 3. Load — Upsert dans Supabase (idempotent)
  const { error } = await supabase
    .from('sav_tickets')
    .upsert(mapped, { onConflict: 'external_id,source' })

  if (error) throw error

  return new Response(JSON.stringify({ synced: mapped.length }))
})
```

## Pattern B — Pipeline batch (pg_cron + fonctions SQL)

Pour les agrégations lourdes et les vues matérialisées :

```sql
-- Migration : créer la vue matérialisée des KPIs
CREATE MATERIALIZED VIEW mv_sav_dashboard AS
SELECT
  date_trunc('day', created_at) AS jour,
  status,
  priority,
  COUNT(*) AS nb_tickets,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600) AS avg_resolution_hours,
  PERCENTILE_CONT(0.95) WITHIN GROUP (
    ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at))
  ) / 3600 AS p95_resolution_hours
FROM sav_tickets
WHERE created_at >= now() - INTERVAL '90 days'
GROUP BY 1, 2, 3;

-- Index pour les requêtes dashboard
CREATE UNIQUE INDEX ON mv_sav_dashboard (jour, status, priority);

-- Rafraîchissement programmé (via pg_cron ou Edge Function CRON)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sav_dashboard;
```

## Pattern C — Staging + Transform (données multi-source)

Pour la consolidation Omega (Salesforce + SAP) :

```sql
-- Table de staging (données brutes avant transformation)
CREATE TABLE staging_sav (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source TEXT NOT NULL,        -- 'salesforce' | 'sap'
  external_id TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | processed | error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  UNIQUE(source, external_id)
);

-- Fonction de transformation staging → production
CREATE OR REPLACE FUNCTION process_staging_records()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
BEGIN
  -- Traiter les enregistrements Salesforce
  INSERT INTO sav_tickets (external_id, source, ...)
  SELECT
    external_id,
    'salesforce',
    raw_data->>'CaseNumber',
    ...
  FROM staging_sav
  WHERE source = 'salesforce' AND status = 'pending'
  ON CONFLICT (external_id, source) DO UPDATE SET ...;

  GET DIAGNOSTICS processed_count = ROW_COUNT;

  -- Marquer comme traités
  UPDATE staging_sav
  SET status = 'processed', processed_at = now()
  WHERE status = 'pending';

  RETURN processed_count;
END;
$$ LANGUAGE plpgsql;
```

## Data mapping inter-systèmes

Toujours documenter le mapping entre les champs source et cible :

```typescript
// src/lib/data/mappings/salesforce-mapping.ts

interface SalesforceTicket {
  Id: string
  CaseNumber: string
  Status: string
  Priority: string
  // ...
}

interface InternalTicket {
  external_id: string
  source: 'salesforce'
  ticket_number: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  // ...
}

const STATUS_MAP: Record<string, InternalTicket['status']> = {
  'New': 'open',
  'Working': 'in_progress',
  'Escalated': 'in_progress',
  'Closed': 'closed',
  'Resolved': 'resolved',
} as const

const PRIORITY_MAP: Record<string, InternalTicket['priority']> = {
  'Low': 'low',
  'Medium': 'medium',
  'High': 'high',
  'Critical': 'critical',
} as const
```
