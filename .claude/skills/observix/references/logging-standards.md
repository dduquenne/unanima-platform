# Standards de Logging Structure

## Configuration Pino

```typescript
// packages/core/src/monitoring/logger.ts
import pino from 'pino'

export function createLogger(config: { app: string; module: string }) {
  return pino({
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      app: config.app,
      module: config.module,
      environment: process.env.NODE_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    },
    // Masquer les champs sensibles
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'token',
      'secret',
      'email',           // RGPD : masquer par defaut
    ],
  })
}

// Usage dans un route handler
const logger = createLogger({ app: 'links', module: 'api/beneficiaires' })

export async function GET(request: Request) {
  logger.info({ method: 'GET', path: '/api/beneficiaires' }, 'Request received')

  try {
    const data = await fetchBeneficiaires()
    logger.info({ count: data.length }, 'Beneficiaires fetched')
    return Response.json(data)
  } catch (error) {
    logger.error({ error }, 'Failed to fetch beneficiaires')
    throw error
  }
}
```

## Niveaux de log

| Niveau | Usage | Exemple |
|--------|-------|---------|
| `fatal` | Crash applicatif, arret | Base de donnees inaccessible |
| `error` | Erreur necessitant attention | Echec d'envoi d'email |
| `warn` | Situation anormale mais geree | Rate limit proche du seuil |
| `info` | Evenement metier notable | Beneficiaire cree, bilan complete |
| `debug` | Diagnostic developpement | Requete SQL executee, cache hit/miss |
| `trace` | Ultra-detaille (dev only) | Entree/sortie de chaque fonction |

## Bonnes pratiques

```typescript
// Log structure avec contexte
logger.info({ userId, action: 'login', ip: request.ip }, 'User logged in')

// Erreur avec stack trace
logger.error({ err: error, userId }, 'Payment processing failed')

// Mesure de duree
const start = performance.now()
const result = await heavyOperation()
logger.info({ durationMs: performance.now() - start }, 'Heavy operation completed')
```

### Anti-patterns

```typescript
// console.log non structure
console.log(`User ${userId} logged in from ${request.ip}`)

// Erreur sans contexte
console.error('Error:', error.message)
```
