# Sécurité — Applications TypeScript métier

## Règles non négociables

### 1. Validation de toutes les entrées

```typescript
// TOUT ce qui vient de l'extérieur = hostile jusqu'à preuve du contraire
// HTTP body, query params, headers, DB, fichiers, variables d'env, WebSocket

// ✅ Correct — Zod parse au niveau controller
app.post("/orders", async (req, reply) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return reply.status(422).send({ errors: parsed.error.format() });
  }
  const result = await createOrderUseCase.execute(parsed.data);
  // ...
});

// ❌ Incorrect — confiance implicite
app.post("/orders", async (req, reply) => {
  const result = await createOrderUseCase.execute(req.body as CreateOrderDto);
});
```

### 2. Variables d'environnement sécurisées

```typescript
// config/env.ts — Validation au démarrage, crash immédiat si invalide
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 chars"),
  JWT_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(14).default(12),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  PORT: z.coerce.number().default(3000),
  // NE JAMAIS logger ces valeurs
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  SMTP_PASSWORD: z.string(),
});

export const env = EnvSchema.parse(process.env);
// Les secrets ne doivent jamais apparaître dans les logs
```

### 3. Authentification JWT robuste

```typescript
import { SignJWT, jwtVerify } from "jose"; // oslo/arctic recommandé

const secret = new TextEncoder().encode(env.JWT_SECRET);

// Création
async function createAccessToken(userId: UserId): Promise<string> {
  return new SignJWT({ sub: userId, type: "access" })
    .setProtectedHeader({ alg: "HS256" }) // Alg explicite — jamais "none"
    .setIssuedAt()
    .setIssuer("your-app")
    .setAudience("your-app-api")
    .setExpirationTime("15m")
    .sign(secret);
}

// Vérification stricte
async function verifyAccessToken(token: string): Promise<UserId> {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],      // Whitelist d'algorithmes
    issuer: "your-app",
    audience: "your-app-api",
  });

  if (payload.type !== "access") throw new Error("Invalid token type");
  if (!payload.sub) throw new Error("Missing subject");

  return UserId.unsafe(payload.sub);
}
```

### 4. Hachage de mots de passe

```typescript
import { hash, verify } from "@node-rs/argon2"; // Argon2id — meilleur choix actuel

const PASSWORD_HASH_OPTIONS = {
  memoryCost: 19456,  // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

async function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_OPTIONS);
}

async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password, PASSWORD_HASH_OPTIONS);
}
```

### 5. Protection contre les injections SQL

```typescript
// ✅ Drizzle ORM — requêtes paramétrées par défaut
const user = await db.select().from(users).where(eq(users.id, userId));

// ✅ Requête SQL brute paramétrée si nécessaire
const result = await db.execute(
  sql`SELECT * FROM users WHERE id = ${userId} AND active = true`
);

// ❌ JAMAIS de concaténation de chaînes SQL
const result = await db.execute(`SELECT * FROM users WHERE id = '${userId}'`);
```

### 6. Sanitisation XSS

```typescript
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

function sanitizeHtml(dirty: string): string {
  return purify.sanitize(dirty, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a"],
    ALLOWED_ATTR: ["href"],
  });
}
```

### 7. Rate Limiting

```typescript
// Fastify + @fastify/rate-limit
await app.register(rateLimit, {
  global: true,
  max: env.RATE_LIMIT_MAX,
  timeWindow: "1 minute",
  redis: redisClient, // Distribué — fonctionne avec plusieurs instances
  keyGenerator: (req) => req.ip,
  errorResponseBuilder: () => ({
    statusCode: 429,
    error: "Too Many Requests",
    message: "Rate limit exceeded",
  }),
});

// Limites spécifiques pour endpoints sensibles
app.post("/auth/login", {
  config: { rateLimit: { max: 5, timeWindow: "15 minutes" } },
}, loginHandler);
```

### 8. Headers de sécurité

```typescript
// @fastify/helmet — configuration stricte
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
```

### 9. Logging sécurisé (sans données sensibles)

```typescript
import pino from "pino";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: ["password", "*.password", "token", "*.token", "authorization",
            "*.secret", "creditCard", "*.ssn"],
    censor: "[REDACTED]",
  },
  serializers: {
    req: pino.stdSerializers.req,  // Ne logue pas le body par défaut
    res: pino.stdSerializers.res,
  },
});
```

### 10. Audit de dépendances

```bash
# À intégrer dans la CI
pnpm audit --audit-level=high
npx better-npm-audit audit

# Vérification des licences
npx license-checker --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"
```

---

## Checklist de sécurité avant déploiement

- [ ] Toutes les entrées validées avec Zod
- [ ] Variables d'environnement validées au démarrage
- [ ] Mots de passe hachés avec Argon2id (≥ rounds recommandés)
- [ ] JWT vérifié avec algorithme explicite + issuer + audience
- [ ] Pas de secrets dans les logs
- [ ] Rate limiting sur tous les endpoints publics
- [ ] Headers de sécurité (Helmet)
- [ ] CORS configuré précisément (pas de `*` en production)
- [ ] Requêtes SQL paramétrées
- [ ] Dépendances auditées (`pnpm audit`)
- [ ] Gestion des erreurs sans stack trace en production
