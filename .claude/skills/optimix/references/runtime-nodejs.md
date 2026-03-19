# Référence : Runtime Node.js — Performance & Mémoire

## Table des matières
1. [Event loop — règles fondamentales](#event-loop)
2. [Gestion mémoire et fuites](#memoire)
3. [Optimisation async/await et Promises](#async)
4. [Structures de données performantes](#data-structures)
5. [Worker Threads — parallélisme CPU](#workers)
6. [Streaming pour les grandes données](#streaming)
7. [Profiling et outils de diagnostic](#profiling)

---

## 1. Event loop — règles fondamentales {#event-loop}

### Ne jamais bloquer l'event loop

```typescript
// ❌ Calcul CPU synchrone bloquant
app.get('/report', (req, res) => {
  const result = computeHeavyStatistics(req.body.data); // bloque tous les autres clients
  res.json(result);
});

// ✅ Option 1 : déléguer à un Worker Thread
app.get('/report', async (req, res) => {
  const result = await runInWorkerThread(computeHeavyStatistics, req.body.data);
  res.json(result);
});

// ✅ Option 2 : découper avec setImmediate pour yielder l'event loop
async function processLargeArray(items: Item[]): Promise<Result[]> {
  const results: Result[] = [];
  for (let i = 0; i < items.length; i++) {
    results.push(process(items[i]));
    if (i % 1000 === 0) {
      await new Promise(resolve => setImmediate(resolve)); // yield
    }
  }
  return results;
}
```

### Mesurer le lag de l'event loop

```typescript
// Monitoring de la santé de l'event loop en production
import { monitorEventLoopDelay } from 'node:perf_hooks';

const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

setInterval(() => {
  const lag = histogram.mean / 1e6; // en millisecondes
  if (lag > 100) {
    logger.warn(`Event loop lag: ${lag.toFixed(2)}ms — possible blocking operation`);
  }
  histogram.reset();
}, 5000);
```

---

## 2. Gestion mémoire et fuites {#memoire}

### Types de fuites mémoire les plus courants

**1. Event listeners non nettoyés**
```typescript
// ❌ Fuite : le listener persiste tant que l'emitter existe
class DataProcessor {
  constructor(private emitter: EventEmitter) {
    emitter.on('data', this.handleData); // référence forte
  }
  private handleData = (data: unknown) => { ... };
}

// ✅ Nettoyage explicite
class DataProcessor {
  constructor(private emitter: EventEmitter) {
    emitter.on('data', this.handleData);
  }
  private handleData = (data: unknown) => { ... };
  
  destroy() {
    this.emitter.off('data', this.handleData); // cleanup
  }
}

// ✅ Avec `using` (TS 5.2 / Node.js 20+)
class DataProcessor implements Disposable {
  constructor(private emitter: EventEmitter) {
    emitter.on('data', this.handleData);
  }
  private handleData = (data: unknown) => { ... };
  [Symbol.dispose]() { this.emitter.off('data', this.handleData); }
}
```

**2. Caches sans éviction**
```typescript
// ❌ Cache qui grossit indéfiniment
const cache = new Map<string, ComputedResult>();
function getResult(key: string) {
  if (!cache.has(key)) cache.set(key, compute(key));
  return cache.get(key)!;
}

// ✅ LRU cache avec limite de taille
import { LRUCache } from 'lru-cache';
const cache = new LRUCache<string, ComputedResult>({
  max: 500,           // Maximum 500 entrées
  ttl: 1000 * 60 * 5, // TTL de 5 minutes
});

// ✅ WeakMap pour les caches liés à la durée de vie d'un objet
const resultCache = new WeakMap<Request, ComputedResult>();
```

**3. Closures capturant de grands objets**
```typescript
// ❌ La closure capture `largeData` même si on n'en a besoin que d'une valeur
function createHandler(largeData: LargeDataset) {
  const threshold = largeData.config.threshold; // on n'a besoin que de ça
  return () => process(threshold, largeData); // largeData reste en mémoire
}

// ✅ Extraire seulement ce dont on a besoin
function createHandler(largeData: LargeDataset) {
  const { threshold, maxItems } = largeData.config; // extraction explicite
  return () => process(threshold, maxItems); // largeData peut être GC'd
}
```

**4. Timers non annulés**
```typescript
// ✅ Pattern de nettoyage des timers
class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  
  start() {
    this.intervalId = setInterval(() => this.poll(), 5000);
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
```

### Monitoring mémoire en production

```typescript
// Métriques mémoire avec prom-client
import { Gauge } from 'prom-client';

const heapUsed = new Gauge({ name: 'nodejs_heap_used_bytes', help: 'Heap used' });
const heapTotal = new Gauge({ name: 'nodejs_heap_total_bytes', help: 'Heap total' });
const rss = new Gauge({ name: 'nodejs_rss_bytes', help: 'RSS' });

setInterval(() => {
  const mem = process.memoryUsage();
  heapUsed.set(mem.heapUsed);
  heapTotal.set(mem.heapTotal);
  rss.set(mem.rss);
}, 10_000);

// Alerte si la heap dépasse 80% de la limite
const HEAP_LIMIT = v8.getHeapStatistics().heap_size_limit;
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  if (heapUsed / HEAP_LIMIT > 0.8) {
    logger.error('MEMORY PRESSURE: heap usage above 80%', { heapUsed, HEAP_LIMIT });
  }
}, 30_000);
```

---

## 3. Optimisation async/await et Promises {#async}

### Parallélisme contrôlé

```typescript
// ❌ Tout en parallèle — peut saturer DB/API
const results = await Promise.all(ids.map(id => fetchById(id)));

// ✅ Limiter la concurrence avec p-limit
import pLimit from 'p-limit';

const limit = pLimit(5); // max 5 requêtes simultanées
const results = await Promise.all(
  ids.map(id => limit(() => fetchById(id)))
);
```

### Traitement par lots (batching)

```typescript
// ❌ N+1 problem : une requête par item
for (const order of orders) {
  order.customer = await fetchCustomer(order.customerId);
}

// ✅ DataLoader pattern (batching + caching)
import DataLoader from 'dataloader';

const customerLoader = new DataLoader(async (ids: readonly string[]) => {
  const customers = await db.customers.findMany({ where: { id: { in: [...ids] } } });
  return ids.map(id => customers.find(c => c.id === id) ?? null);
});

// Dans la résolution (concurrent, automatiquement batché)
for (const order of orders) {
  order.customer = await customerLoader.load(order.customerId); // batché !
}
```

### Éviter les await inutiles

```typescript
// ❌ await inutile — crée une microtask supplémentaire
async function getUser(id: string): Promise<User> {
  return await db.findUser(id); // `await` inutile ici
}

// ✅ Retourner directement la Promise
async function getUser(id: string): Promise<User> {
  return db.findUser(id);
}

// ⚠️ Exception : dans un try/catch, le await est nécessaire
async function safeGetUser(id: string): Promise<User | null> {
  try {
    return await db.findUser(id); // `await` requis pour que l'erreur soit catchée
  } catch {
    return null;
  }
}
```

### Promise.allSettled vs Promise.all

```typescript
// ✅ allSettled pour des opérations indépendantes qui peuvent échouer
const [usersResult, ordersResult] = await Promise.allSettled([
  fetchUsers(),
  fetchOrders(),
]);

if (usersResult.status === 'fulfilled') {
  processUsers(usersResult.value);
}
```

---

## 4. Structures de données performantes {#data-structures}

### Choisir la bonne structure

| Opération | Array | Set | Map | Object |
|---|---|---|---|---|
| Lookup par valeur | O(n) | O(1) ✅ | - | - |
| Lookup par clé | O(n) | - | O(1) ✅ | O(1) ✅ |
| Insertion ordonnée | O(1) amort. | O(1) | O(1) | O(1) |
| Itération | O(n) ✅ | O(n) | O(n) | O(n) |
| Clés non-string | ❌ | ✅ | ✅ | ❌ |

```typescript
// ❌ Utiliser un tableau pour des lookups fréquents
const users: User[] = [...];
function findUser(id: string) {
  return users.find(u => u.id === id); // O(n)
}

// ✅ Construire un index Map pour les lookups
const userIndex = new Map(users.map(u => [u.id, u]));
function findUser(id: string) {
  return userIndex.get(id); // O(1)
}
```

### Optimiser les boucles critiques

```typescript
// Pour du code vraiment critique en performance (traitement de masse)

// ❌ forEach — overhead de callback
items.forEach(item => process(item));

// ✅ for...of — plus rapide, supporte break/continue
for (const item of items) {
  process(item);
}

// ✅ for classique avec longueur cachée — le plus rapide
const len = items.length;
for (let i = 0; i < len; i++) {
  process(items[i]);
}
```

### Typed Arrays pour les données numériques massives

```typescript
// ❌ Array classique pour des données numériques pures
const prices: number[] = new Array(1_000_000);

// ✅ Float64Array — moins de mémoire, plus rapide pour les calculs
const prices = new Float64Array(1_000_000);
// Jusqu'à 4x moins de mémoire pour les nombres
// V8 peut appliquer des optimisations SIMD
```

---

## 5. Worker Threads — parallélisme CPU {#workers}

### Pool de workers avec Piscina

```typescript
// worker-pool.ts
import Piscina from 'piscina';
import { resolve } from 'path';

export const pool = new Piscina({
  filename: resolve(__dirname, 'worker.js'),
  maxThreads: Math.max(1, os.cpus().length - 1), // laisser 1 thread pour l'event loop
  idleTimeout: 30_000,
});

// worker.ts (le fichier exécuté dans le thread)
export function processData(data: ProcessInput): ProcessOutput {
  // Traitement CPU intensif ici
  return heavyComputation(data);
}

// Utilisation dans l'app principale
app.post('/compute', async (req, res) => {
  const result = await pool.run(req.body, { name: 'processData' });
  res.json(result);
});
```

### Communication efficace avec SharedArrayBuffer

```typescript
// Pour les données volumineuses : éviter la sérialisation via SharedArrayBuffer
const sharedBuffer = new SharedArrayBuffer(Float64Array.BYTES_PER_ELEMENT * dataSize);
const shared = new Float64Array(sharedBuffer);

// Transfert sans copie (zero-copy)
worker.postMessage({ buffer: sharedBuffer }, [sharedBuffer]);
```

---

## 6. Streaming pour les grandes données {#streaming}

### Streams Node.js avec TypeScript

```typescript
import { pipeline, Transform } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

// ✅ Traitement streaming d'un gros fichier CSV (mémoire O(1))
async function processLargeCSV(inputPath: string, outputPath: string) {
  await pipeline(
    createReadStream(inputPath),
    new CSVParser(),                    // Transform stream personnalisé
    new BusinessLogicTransform(),       // Traitement métier
    createGzip(),                       // Compression à la volée
    createWriteStream(outputPath),
  );
  // Mémoire utilisée : constante, indépendante de la taille du fichier
}
```

### AsyncGenerator pour les APIs paginées

```typescript
// ✅ Itérer sur de grandes collections sans tout charger en mémoire
async function* fetchAllOrders(customerId: string): AsyncGenerator<Order> {
  let cursor: string | null = null;
  do {
    const { orders, nextCursor } = await db.orders.findMany({
      where: { customerId },
      cursor: cursor ? { id: cursor } : undefined,
      take: 100,
    });
    yield* orders;
    cursor = nextCursor;
  } while (cursor);
}

// Utilisation
for await (const order of fetchAllOrders(customerId)) {
  await processOrder(order); // traite 1 commande à la fois
}
```

---

## 7. Profiling et outils de diagnostic {#profiling}

### Profiling CPU avec 0x (flame graphs)

```bash
# Générer un flame graph
npx 0x --output-dir flame dist/server.js

# Pendant le profiling, envoyer du trafic
npx autocannon -c 100 -d 30 http://localhost:3000/api/orders
```

### Heap snapshot pour les fuites mémoire

```bash
# Lancer avec l'inspecteur
node --inspect dist/server.js

# Dans Chrome : chrome://inspect → Profiler → Heap Snapshot
# Prendre 2 snapshots séparés par du trafic
# Comparer : les objets qui ont grossi sont les suspects
```

### clinic.js — diagnostic automatique

```bash
npx clinic doctor -- node dist/server.js
# Génère un rapport diagnostiquant automatiquement les problèmes
# (event loop blocking, mémoire, I/O)

npx clinic flame -- node dist/server.js
# Flame graph interactif

npx clinic bubbleprof -- node dist/server.js
# Profil async — visualise les attentes async
```

### Benchmark micro avec tinybench

```typescript
import { Bench } from 'tinybench';

const bench = new Bench({ time: 1000 });

bench
  .add('Array.find', () => {
    users.find(u => u.id === targetId);
  })
  .add('Map.get', () => {
    userMap.get(targetId);
  });

await bench.run();
console.table(bench.table());
// Affiche ops/sec, p75, p99 pour chaque variante
```
