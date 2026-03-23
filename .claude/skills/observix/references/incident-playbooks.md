# Playbooks par Type d'Incident

## Health Check Endpoint

```typescript
// Chaque app expose GET /api/health (rappel CLAUDE.md)
export async function GET() {
  const checks = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
    checks: {} as Record<string, { status: string; latencyMs?: number }>,
  }

  // Check Supabase
  const dbStart = performance.now()
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1)
    checks.checks.database = {
      status: error ? 'unhealthy' : 'healthy',
      latencyMs: Math.round(performance.now() - dbStart),
    }
  } catch {
    checks.checks.database = { status: 'unhealthy' }
    checks.status = 'unhealthy'
  }

  // Check Resend (email)
  try {
    checks.checks.email = { status: 'healthy' }
  } catch {
    checks.checks.email = { status: 'degraded' }
    if (checks.status === 'healthy') checks.status = 'degraded'
  }

  const statusCode = checks.status === 'unhealthy' ? 503 : 200
  return Response.json(checks, { status: statusCode })
}
```

## Monitoring Uptime

```bash
# Verifier le health check
curl -s https://links.unanima.fr/api/health | jq .

# Monitoring externe recommande :
# - BetterUptime / UptimeRobot / Checkly
# - Intervalle : 1 min pour production, 5 min pour staging
# - Alerte si 2 echecs consecutifs
```

## Template Post-Mortem

```markdown
# Post-mortem -- [Titre de l'incident]

**Date :** YYYY-MM-DD
**Duree :** HH:MM (de detection a resolution)
**Severite :** P0/P1/P2
**Impact :** [Nombre d'utilisateurs affectes, fonctionnalite touchee]

## Chronologie
| Heure | Evenement |
|-------|-----------|
| HH:MM | Alerte recue : [description] |
| HH:MM | Diagnostic : [cause identifiee] |
| HH:MM | Correction deployee |
| HH:MM | Incident resolu confirme |

## Cause racine
[Description technique detaillee]

## Ce qui a bien fonctionne
- [Detection rapide grace a ...]
- [Rollback efficace via ...]

## Ce qui doit etre ameliore
- [Pas d'alerte sur ...]
- [Monitoring insuffisant sur ...]

## Actions correctives
| Action | Responsable | Echeance | Issue |
|--------|-------------|----------|-------|
| Ajouter un test pour ce cas | [nom] | [date] | #XX |
| Ameliorer l'alerting sur | [nom] | [date] | #XX |
```

## Processus d'Incident

```
1. DETECTER   -- Alerte recue ou rapport utilisateur
2. QUALIFIER  -- P0/P1/P2/P3, scope, impact
3. CONTENIR   -- Rollback si necessaire, communication
4. DIAGNOSTIQUER -- Root cause analysis (invoquer diagnostix/anomalix)
5. CORRIGER   -- Hotfix, test, deploy
6. DOCUMENTER -- Post-mortem
```
