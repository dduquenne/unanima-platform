# Stack Technique — Choix raisonnés pour TypeScript métier (2025)

## Runtime

| Option | Quand utiliser |
|---|---|
| **Node.js 22 LTS** | Écosystème éprouvé, compatibilité maximale npm |
| **Bun** | Performances maximales, projets greenfield, CLI tools |
| **Deno** | Sécurité par défaut, serverless edge |

**Recommandation** : Node.js 22 LTS pour les projets métier critiques, Bun pour les services haute performance.

---

## Framework HTTP

### Fastify (recommandé applications API)
```typescript
import Fastify from "fastify";

const app = Fastify({
  logger: { level: "info" },
  ajv: { customOptions: { strict: false } },
});

// Schémas JSON Schema pour validation + OpenAPI automatique
app.post<{ Body: CreateUserDto }>("/users", {
  schema: {
    body: CreateUserJsonSchema,
    response: { 201: UserResponseSchema, 422: ErrorSchema },
  },
}, async (req, reply) => { ... });
```

### Hono (recommandé edge/serverless/léger)
```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();
app.post("/users", zValidator("json", CreateUserSchema), async (c) => {
  const dto = c.req.valid("json");
  // ...
});
```

---

## ORM / Accès base de données

### Drizzle ORM (recommandé nouveau projet)
```typescript
// Schema = TypeScript pur, migrations générées, performance maximale
import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  active: boolean("active").notNull().default(true),
});

// Requêtes typées
const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
```

### Prisma (recommandé pour équipes/prototypage rapide)
```typescript
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  orders    Order[]
}

// Usage typé automatiquement
const user = await prisma.user.findUnique({ where: { email }, include: { orders: true } });
```

**Drizzle vs Prisma** :
- Drizzle : Bundle plus léger, performances supérieures, contrôle SQL fin
- Prisma : DX supérieure, relations complexes plus simples, meilleure écosystème de migration

---

## Validation

| Lib | Perf | DX | Edge |
|---|---|---|---|
| **Zod** | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | ✅ |
| **Valibot** | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ (+ petit bundle) |
| Yup | ⚡⚡ | ⭐⭐⭐ | ⚠️ |
| Joi | ⚡ | ⭐⭐⭐ | ❌ |

**Recommandation** : Zod en général, Valibot si taille de bundle critique (edge/serverless).

---

## Tests

```
Vitest > Jest pour TypeScript en 2025 :
- Natif ESM sans configuration
- 2-3x plus rapide
- API compatible Jest (migration facile)
- HMR en mode watch
```

```bash
# Installation
pnpm add -D vitest @vitest/coverage-v8 @vitest/ui

# Test unitaires + intégration
vitest run

# Mode watch interactif
vitest --ui
```

---

## Injection de dépendances

### tsyringe (léger, décorators)
```typescript
import "reflect-metadata";
import { injectable, inject, container } from "tsyringe";

@injectable()
class UserService {
  constructor(@inject("UserRepo") private repo: UserRepository) {}
}

container.register("UserRepo", { useClass: PrismaUserRepository });
const service = container.resolve(UserService);
```

### InversifyJS (plus complet, adapté grande application)
```typescript
// Similaire mais avec bindings plus expressifs
container.bind<UserRepository>(TYPES.UserRepository).to(PrismaUserRepository).inSingletonScope();
```

---

## Authentification

```typescript
// oslo + arctic (recommandé 2025 — projet Lucia Auth)
import { Argon2id } from "oslo/password";
import { GitHub, Google } from "arctic";

// OAuth2
const github = new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET);
const [url, state] = await github.createAuthorizationURL(scopes);

// Mots de passe
const hasher = new Argon2id();
const hash = await hasher.hash(password);
const valid = await hasher.verify(hash, password);
```

---

## Queue / Jobs asynchrones

### BullMQ (Redis) — haute fréquence, distributed
```typescript
import { Queue, Worker } from "bullmq";

const emailQueue = new Queue("email", { connection: redisConnection });

// Producteur
await emailQueue.add("send-welcome", { userId, email }, {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
  removeOnComplete: 100,
  removeOnFail: 500,
});

// Consommateur
const worker = new Worker("email", async (job) => {
  await emailService.sendWelcome(job.data.email);
}, { connection: redisConnection, concurrency: 5 });
```

### pg-boss (PostgreSQL) — simplicité, pas de Redis
```typescript
import PgBoss from "pg-boss";

const boss = new PgBoss(env.DATABASE_URL);
await boss.start();
await boss.send("email:welcome", { userId, email });
await boss.work("email:welcome", async ({ data }) => { ... });
```

---

## Observabilité

```typescript
// OpenTelemetry — standard industrie
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";

const sdk = new NodeSDK({
  serviceName: "order-service",
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter: new OTLPTraceExporter({ url: env.OTLP_ENDPOINT }),
});
sdk.start();

// Pino pour les logs structurés
import pino from "pino";
const logger = pino({ level: "info" });
logger.info({ orderId, userId }, "Order created");
```

---

## Monorepo

### Turborepo + pnpm (recommandé)
```
apps/
├── api/           # Fastify API
├── web/           # Next.js
└── worker/        # BullMQ workers

packages/
├── domain/        # Logique métier partagée
├── ui/            # Composants React partagés
├── config/        # tsconfig, eslint communs
└── types/         # Types partagés
```

```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["build"] },
    "lint": {}
  }
}
```

---

## Linting & Formatting

```bash
# Biome (remplace ESLint + Prettier) — 100x plus rapide
pnpm add -D @biomejs/biome

# biome.json
{
  "linter": {
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "suspicious": { "noExplicitAny": "error" }
    }
  },
  "formatter": { "indentWidth": 2, "lineWidth": 100 }
}
```
