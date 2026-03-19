# Référence : Architecture & Patterns de Performance TypeScript

## Table des matières
1. [Memoïsation et caching](#memoïsation)
2. [Patterns de concurrence](#concurrence)
3. [Optimisation des accès base de données](#database)
4. [API REST et GraphQL — patterns performants](#api)
5. [Observabilité et métriques](#observabilité)
6. [Checklist d'audit de performance](#checklist)

---

## 1. Memoïsation et caching {#memoïsation}

### Memoïsation de fonctions pures

```typescript
// Memoïsation simple et typée
function memoize<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  keyFn: (...args: TArgs) => string = (...args) => JSON.stringify(args),
): (...args: TArgs) => TReturn {
  const cache = new Map<string, TReturn>();
  return (...args: TArgs): TReturn => {
    const key = keyFn(...args);
    if (cache.has(key)) return cache.get(key)!;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const computeScore = memoize(
  (user: User, context: Context) => expensiveScoreCalculation(user, context),
  (user, context) => `${user.id}:${context.sessionId}`,
);
```

### Cache multi-niveaux (L1 mémoire + L2 Redis)

```typescript
class MultiLevelCache<T> {
  private l1 = new LRUCache<string, T>({ max: 100, ttl: 60_000 }); // 1 min
  
  constructor(private l2: RedisClient, private ttlSeconds: number = 300) {}
  
  async get(key: string): Promise<T | null> {
    // L1 : mémoire locale (ultra-rapide)
    const l1Hit = this.l1.get(key);
    if (l1Hit !== undefined) return l1Hit;
    
    // L2 : Redis (rapide, partagé entre instances)
    const l2Hit = await this.l2.get(key);
    if (l2Hit) {
      const value = JSON.parse(l2Hit) as T;
      this.l1.set(key, value); // populer L1
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: T): Promise<void> {
    this.l1.set(key, value);
    await this.l2.setEx(key, this.ttlSeconds, JSON.stringify(value));
  }
  
  async invalidate(key: string): Promise<void> {
    this.l1.delete(key);
    await this.l2.del(key);
  }
}
```

### Cache avec invalidation par tags (pattern avancé)

```typescript
class TaggedCache {
  async set(key: string, value: unknown, tags: string[], ttl: number) {
    await redis.setEx(key, ttl, JSON.stringify(value));
    // Associer la clé à chaque tag
    await Promise.all(tags.map(tag => redis.sAdd(`tag:${tag}`, key)));
  }
  
  async invalidateByTag(tag: string) {
    const keys = await redis.sMembers(`tag:${tag}`);
    if (keys.length > 0) {
      await redis.del(keys);
      await redis.del(`tag:${tag}`);
    }
  }
}

// Exemple : invalider tout le cache produit quand un produit est modifié
await cache.set(`product:${id}`, product, ['products', `category:${product.categoryId}`], 3600);
// Plus tard : mise à jour produit → invalider
await taggedCache.invalidateByTag('products');
```

---

## 2. Patterns de concurrence {#concurrence}

### Queue de jobs avec contrôle de concurrence

```typescript
import { Queue, Worker } from 'bullmq';

// Producteur
const emailQueue = new Queue('emails', { connection: redis });

async function sendWelcomeEmail(userId: string) {
  await emailQueue.add('welcome', { userId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
  });
}

// Consommateur (peut tourner dans un process séparé)
const worker = new Worker('emails', async (job) => {
  await emailService.send(job.data.userId, 'welcome');
}, {
  connection: redis,
  concurrency: 10, // 10 emails en parallèle max
});
```

### Circuit Breaker pour la résilience

```typescript
import { CircuitBreaker } from 'opossum';

const options = {
  timeout: 3000,           // Si la fn prend > 3s, ouvrir le circuit
  errorThresholdPercentage: 50, // Ouvrir si > 50% d'erreurs
  resetTimeout: 30000,     // Réessayer après 30s
};

const breaker = new CircuitBreaker(callExternalAPI, options);

breaker.fallback(() => cachedResponse); // Fallback si circuit ouvert

async function getExternalData(id: string) {
  return breaker.fire(id); // Protégé par le circuit breaker
}
```

### Retry avec backoff exponentiel

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseDelay?: number; maxDelay?: number } = {},
): Promise<T> {
  const { maxAttempts = 3, baseDelay = 1000, maxDelay = 30_000 } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
      const jitter = Math.random() * delay * 0.1; // ±10% jitter
      await sleep(delay + jitter);
    }
  }
  throw new Error('unreachable');
}
```

---

## 3. Optimisation des accès base de données {#database}

### Éviter le problème N+1

```typescript
// ❌ N+1 : 1 requête pour les commandes + N requêtes pour les clients
const orders = await db.order.findMany();
for (const order of orders) {
  order.customer = await db.customer.findUnique({ where: { id: order.customerId } });
}

// ✅ Eager loading : 1 seule requête avec JOIN
const orders = await db.order.findMany({
  include: { customer: true },
});

// ✅ Pour GraphQL : DataLoader (voir runtime-nodejs.md)
```

### Pagination cursor-based vs offset

```typescript
// ❌ Offset pagination — ralentit avec les grandes tables (full scan)
const page = await db.order.findMany({
  skip: page * pageSize,   // OFFSET 10000 sur 1M lignes = lent
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// ✅ Cursor pagination — performances constantes
const page = await db.order.findMany({
  cursor: cursor ? { id: cursor } : undefined,
  take: pageSize + 1, // +1 pour détecter s'il y a une page suivante
  orderBy: { id: 'desc' }, // Index unique requis pour le cursor
  skip: cursor ? 1 : 0,
});
const hasNextPage = page.length > pageSize;
const nextCursor = hasNextPage ? page[pageSize - 1].id : null;
```

### Index et requêtes optimisées

```typescript
// Prisma : déclarer les index dans le schema
model Order {
  id         String   @id @default(cuid())
  customerId String
  status     String
  createdAt  DateTime @default(now())
  
  @@index([customerId, status])     // Requêtes filtrées par customer + status
  @@index([createdAt(sort: Desc)])  // Tri par date récente
}

// Sélectionner uniquement les champs nécessaires (évite SELECT *)
const orders = await db.order.findMany({
  select: {
    id: true,
    status: true,
    total: true,
    // customer: false — non sélectionné = pas de JOIN
  },
});
```

### Connection pooling avec Prisma

```typescript
// DATABASE_URL doit inclure la configuration du pool
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'slow'] : ['error'],
});

// Pour serverless : PgBouncer ou @prisma/adapter-neon
```

---

## 4. API REST et GraphQL — patterns performants {#api}

### Compression et sérialisation rapide

```typescript
import fastifyCompress from '@fastify/compress';
import fastifyEtag from '@fastify/etag';

// Compression Brotli/Gzip automatique
app.register(fastifyCompress, {
  brotliOptions: { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } },
  threshold: 1024, // Seulement si réponse > 1KB
});

// ETag pour les ressources statiques/peu changeantes
app.register(fastifyEtag);

// Sérialisation JSON rapide avec fast-json-stringify
import fastJsonStringify from 'fast-json-stringify';

const stringifyOrder = fastJsonStringify({
  type: 'object',
  properties: {
    id: { type: 'string' },
    total: { type: 'number' },
    status: { type: 'string', enum: ['pending', 'paid', 'shipped'] },
  },
});
// 2-5x plus rapide que JSON.stringify pour les schémas connus
```

### Rate limiting et protection

```typescript
// Rate limiting par IP + par utilisateur
import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'api',
  points: 100,     // 100 requêtes
  duration: 60,    // par minute
});

app.addHook('preHandler', async (req, reply) => {
  try {
    await rateLimiter.consume(req.user?.id ?? req.ip);
  } catch {
    reply.status(429).send({ error: 'Too Many Requests' });
  }
});
```

### Réponses en streaming pour les grandes collections

```typescript
import { Readable } from 'node:stream';

// Fastify : réponse streaming JSON
app.get('/export/orders', async (req, reply) => {
  const cursor = db.order.findMany({ cursor: true, batchSize: 100 });
  
  reply.raw.setHeader('Content-Type', 'application/x-ndjson');
  
  for await (const batch of cursor) {
    for (const order of batch) {
      reply.raw.write(JSON.stringify(order) + '\n'); // NDJSON
    }
  }
  
  reply.raw.end();
});
```

---

## 5. Observabilité et métriques {#observabilité}

### OpenTelemetry — tracing distribué

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_URL }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-pg': { dbStatementSerializer: true },
      '@opentelemetry/instrumentation-http': { applyCustomAttributesOnSpan: true },
    }),
  ],
});

sdk.start();
```

### Métriques custom avec prom-client

```typescript
import { Histogram, Counter, register } from 'prom-client';

// Temps de réponse par route et statut
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Dans le middleware
app.addHook('onResponse', (req, reply, done) => {
  httpRequestDuration
    .labels(req.method, req.routeOptions.url ?? 'unknown', String(reply.statusCode))
    .observe(reply.elapsedTime / 1000);
  done();
});
```

---

## 6. Checklist d'audit de performance {#checklist}

### Build & Compilation
- [ ] Séparation type-check (`tsc --noEmit`) / transpilation (esbuild/SWC)
- [ ] `"incremental": true` dans tsconfig
- [ ] `"skipLibCheck": true` dans tsconfig
- [ ] `"isolatedModules": true` dans tsconfig
- [ ] Imports triés et sans circulaires (`madge --circular`)
- [ ] Bundle analysé (pas de dépendances inattendues)
- [ ] Tree-shaking activé et fonctionnel

### Runtime & Mémoire
- [ ] Pas de calcul CPU dans l'event loop (→ worker threads)
- [ ] Caches avec TTL et limite de taille (LRU)
- [ ] Event listeners nettoyés (`off()` ou `Symbol.dispose`)
- [ ] Timers annulés dans les destructeurs
- [ ] Pas de `Promise.all` sans limite de concurrence sur des listes longues
- [ ] Streaming pour les fichiers/collections > 10MB

### Base de données
- [ ] Pas de problème N+1 (eager loading ou DataLoader)
- [ ] Pagination cursor-based (pas offset) sur les grandes tables
- [ ] SELECT explicite (pas `SELECT *` / `include` tout)
- [ ] Index sur les colonnes filtrées/triées fréquemment
- [ ] Connection pool configuré

### API
- [ ] Compression activée (Brotli/Gzip)
- [ ] Sérialisation JSON optimisée (fast-json-stringify pour les schemas fixes)
- [ ] Rate limiting en place
- [ ] ETag / Cache-Control sur les ressources appropriées
- [ ] Métriques temps de réponse (p50/p95/p99) disponibles

### Observabilité
- [ ] Monitoring mémoire (heapUsed, rss) avec alertes
- [ ] Event loop lag mesuré
- [ ] Tracing distribué (OpenTelemetry ou équivalent)
- [ ] Logs structurés avec niveaux appropriés (pino recommandé)
- [ ] Alertes sur les erreurs 5xx et les timeouts
