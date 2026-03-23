# Requêtes Analytiques SQL — Patterns pour Dashboards

## KPIs avec comparaison période précédente

```sql
WITH current_period AS (
  SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'resolved') AS resolved
  FROM sav_tickets
  WHERE created_at >= date_trunc('month', now())
),
previous_period AS (
  SELECT COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status = 'resolved') AS resolved
  FROM sav_tickets
  WHERE created_at >= date_trunc('month', now() - INTERVAL '1 month')
    AND created_at < date_trunc('month', now())
)
SELECT
  c.total AS current_total,
  c.resolved AS current_resolved,
  ROUND(c.resolved::numeric / NULLIF(c.total, 0) * 100, 1) AS resolution_rate,
  ROUND((c.total - p.total)::numeric / NULLIF(p.total, 0) * 100, 1) AS total_evolution_pct
FROM current_period c, previous_period p;
```

## Séries temporelles pour graphiques

```sql
SELECT
  date_trunc('week', created_at) AS semaine,
  COUNT(*) AS nb_tickets,
  COUNT(*) FILTER (WHERE priority = 'critical') AS nb_critiques,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) / 3600 AS avg_resolution_h
FROM sav_tickets
WHERE created_at >= now() - INTERVAL '6 months'
GROUP BY 1
ORDER BY 1;
```

## Exposition via API (Route Handlers)

```typescript
// apps/omega/src/app/api/dashboard/kpis/route.ts
import { createClient } from '@unanima/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  // Utiliser la vue matérialisée pour les performances
  const { data, error } = await supabase
    .from('mv_sav_dashboard')
    .select('*')
    .gte('jour', new Date(Date.now() - 30 * 86400000).toISOString())
    .order('jour', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

## Déduplication

```sql
-- Identifier les doublons potentiels
SELECT external_id, source, COUNT(*)
FROM sav_tickets
GROUP BY external_id, source
HAVING COUNT(*) > 1;

-- Contrainte unique pour prévenir les doublons
ALTER TABLE sav_tickets
  ADD CONSTRAINT uq_sav_tickets_external UNIQUE (external_id, source);
```

## Validation à l'ingestion avec Zod

```typescript
import { z } from 'zod'

const SalesforceRecordSchema = z.object({
  Id: z.string().min(15).max(18), // Format Salesforce ID
  CaseNumber: z.string(),
  Status: z.string(),
  Priority: z.string(),
  CreatedDate: z.string().datetime(),
})

function validateAndTransform(rawRecords: unknown[]) {
  const valid: InternalTicket[] = []
  const errors: { index: number; error: string }[] = []

  rawRecords.forEach((record, index) => {
    const parsed = SalesforceRecordSchema.safeParse(record)
    if (parsed.success) {
      valid.push(mapToInternal(parsed.data))
    } else {
      errors.push({ index, error: parsed.error.message })
    }
  })

  return { valid, errors, errorRate: errors.length / rawRecords.length }
}
```
