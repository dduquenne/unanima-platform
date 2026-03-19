# Stratégie de Tests — Applications TypeScript métier

## Table des matières
1. [Pyramide de tests](#pyramide)
2. [Tests unitaires (Use Cases)](#unit)
3. [Tests d'intégration](#integration)
4. [Tests E2E](#e2e)
5. [Test Doubles (Mocks, Stubs, Fakes)](#doubles)
6. [Contract Testing](#contracts)
7. [Mutation Testing](#mutation)
8. [Configuration Vitest](#config)

---

## 1. Pyramide de tests {#pyramide}

```
           ┌─────────────┐
           │    E2E      │  ~5%  — Scénarios utilisateur complets
           │  (Playwright│
           │  / Supertest)│
      ┌────┴─────────────┴────┐
      │     Intégration       │  ~25% — Ports + Adapters réels (DB, HTTP)
      │   (DB + API réelle)   │
 ┌────┴───────────────────────┴────┐
 │          Unitaires              │  ~70% — Use cases, domaine, utils
 │     (isolés, déterministes)     │
 └─────────────────────────────────┘
```

**Règle d'or** : Un test doit valider un **comportement observable**, pas une implémentation interne.

---

## 2. Tests unitaires (Use Cases) {#unit}

### Pattern AAA (Arrange / Act / Assert)

```typescript
// tests/unit/application/create-order.use-case.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { CreateOrderUseCaseImpl } from "@application/use-cases/create-order";
import { InMemoryOrderRepository } from "../helpers/in-memory-order.repository";
import { FakePaymentGateway } from "../helpers/fake-payment.gateway";
import { createValidOrderDto, createExistingProduct } from "../helpers/factories";

describe("CreateOrderUseCase", () => {
  let useCase: CreateOrderUseCaseImpl;
  let orderRepo: InMemoryOrderRepository;
  let paymentGateway: FakePaymentGateway;

  beforeEach(() => {
    orderRepo = new InMemoryOrderRepository();
    paymentGateway = new FakePaymentGateway();
    useCase = new CreateOrderUseCaseImpl(orderRepo, paymentGateway);
  });

  describe("succès", () => {
    it("crée une commande et retourne son ID", async () => {
      // Arrange
      const dto = createValidOrderDto();

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(orderRepo.orders).toHaveLength(1);
      expect(orderRepo.orders[0]?.customerId).toBe(dto.customerId);
    });

    it("émet un événement OrderCreated", async () => {
      const dto = createValidOrderDto();
      await useCase.execute(dto);
      expect(paymentGateway.reservations).toHaveLength(1);
    });
  });

  describe("échecs", () => {
    it("rejette si le client n'existe pas", async () => {
      const dto = createValidOrderDto({ customerId: "nonexistent" });
      const result = await useCase.execute(dto);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe("CUSTOMER_NOT_FOUND");
    });

    it("rejette si le stock est insuffisant", async () => {
      const product = createExistingProduct({ stock: 0 });
      const dto = createValidOrderDto({ items: [{ productId: product.id, quantity: 1 }] });
      const result = await useCase.execute(dto);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe("INSUFFICIENT_STOCK");
    });
  });
});
```

### Tests du domaine

```typescript
// tests/unit/domain/order.entity.test.ts
describe("Order Entity", () => {
  describe("addItem", () => {
    it("ajoute un article à une commande en brouillon", () => {
      const order = Order.create(validOrderProps);
      const result = order.addItem(validProduct, 2);
      expect(result.ok).toBe(true);
      expect(order.items).toHaveLength(1);
      expect(order.total.amount).toBe(validProduct.price.amount * 2);
    });

    it("refuse d'ajouter un article si la commande est confirmée", () => {
      const order = Order.createConfirmed(validOrderProps);
      const result = order.addItem(validProduct, 1);
      expect(result.ok).toBe(false);
      expect(result.error.code).toBe("ORDER_NOT_EDITABLE");
    });

    it("refuse plus de 100 articles", () => {
      const order = Order.createWithItems(Array.from({ length: 100 }, () => validItem));
      const result = order.addItem(anotherProduct, 1);
      expect(result.ok).toBe(false);
      expect(result.error.code).toBe("MAX_ITEMS_REACHED");
    });
  });
});
```

---

## 3. Tests d'intégration {#integration}

```typescript
// tests/integration/infrastructure/user-repository.test.ts
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

describe("PrismaUserRepository (intégration)", () => {
  let db: DrizzleDb;
  let repo: PrismaUserRepository;

  beforeAll(async () => {
    db = drizzle(process.env.TEST_DATABASE_URL!);
    await migrate(db, { migrationsFolder: "./drizzle" });
    repo = new DrizzleUserRepository(db);
  });

  beforeEach(async () => {
    await db.delete(users); // Clean state
  });

  afterAll(async () => {
    await db.$client.end();
  });

  it("persiste et retrouve un utilisateur par ID", async () => {
    const user = User.create(validUserProps);
    await repo.save(user);
    const found = await repo.findById(user.id);
    expect(found).not.toBeNull();
    expect(found?.email).toBe(user.email);
  });

  it("retourne null pour un ID inexistant", async () => {
    const found = await repo.findById(UserId.unsafe("non-existent-id"));
    expect(found).toBeNull();
  });
});
```

### Tests d'API HTTP

```typescript
// tests/integration/http/users.api.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "@infrastructure/http/app";
import type { FastifyInstance } from "fastify";

describe("POST /users (API intégration)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createApp({ env: "test" });
    await app.ready();
  });

  afterAll(() => app.close());

  it("crée un utilisateur et retourne 201", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: { email: "test@example.com", password: "Str0ng!Password" },
    });
    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body).toMatchObject({ email: "test@example.com" });
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("retourne 422 pour un email invalide", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/users",
      payload: { email: "not-an-email", password: "Str0ng!Password" },
    });
    expect(response.statusCode).toBe(422);
    const body = response.json();
    expect(body.errors).toContainEqual(
      expect.objectContaining({ field: "email" }),
    );
  });
});
```

---

## 4. Tests E2E {#e2e}

```typescript
// tests/e2e/order-flow.test.ts — Playwright ou Supertest full stack
import { test, expect } from "@playwright/test";

test("parcours de commande complet", async ({ page }) => {
  // Authentification
  await page.goto("/login");
  await page.fill('[name="email"]', "customer@test.com");
  await page.fill('[name="password"]', "TestPass123!");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");

  // Ajout au panier
  await page.goto("/products");
  await page.click('[data-testid="add-to-cart-product-1"]');

  // Passage de commande
  await page.goto("/checkout");
  await page.click('[data-testid="confirm-order"]');

  // Vérification
  await expect(page.locator('[data-testid="order-confirmation"]')).toBeVisible();
  await expect(page.locator('[data-testid="order-status"]')).toHaveText("Confirmée");
});
```

---

## 5. Test Doubles {#doubles}

### In-Memory Repository (Fake — préféré aux mocks)

```typescript
// tests/helpers/in-memory-user.repository.ts
class InMemoryUserRepository implements UserRepositoryPort {
  private store = new Map<string, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.store.get(id) ?? null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    for (const user of this.store.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.id, user);
  }

  async delete(id: UserId): Promise<void> {
    this.store.delete(id);
  }

  // Helpers de test
  get users(): User[] { return [...this.store.values()]; }
  seed(user: User): void { this.store.set(user.id, user); }
  clear(): void { this.store.clear(); }
}
```

### Mock (Vitest)

```typescript
// Pour des collaborateurs avec comportements complexes
const mockEmailService = {
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordReset: vi.fn().mockResolvedValue(undefined),
};

// Vérification
expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledOnce();
expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
  expect.stringContaining("@"),
  expect.any(String),
);
```

---

## 6. Contract Testing {#contracts}

```typescript
// Avec Pact.js — vérifie que consommateur et fournisseur s'accordent
import { Pact } from "@pact-foundation/pact";

const provider = new Pact({
  consumer: "OrderService",
  provider: "UserService",
  port: 9001,
});

describe("UserService contract", () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  it("obtient un utilisateur par ID", async () => {
    await provider.addInteraction({
      state: "user exists with id 123",
      uponReceiving: "a request for user 123",
      withRequest: { method: "GET", path: "/users/123" },
      willRespondWith: {
        status: 200,
        body: { id: "123", email: "user@example.com", name: "Test User" },
      },
    });

    const user = await userClient.getById("123");
    expect(user.email).toBe("user@example.com");
    await provider.verify();
  });
});
```

---

## 7. Mutation Testing {#mutation}

```bash
# Stryker — vérifie la qualité des assertions de tests
npx stryker run

# Objectif : mutation score > 80%
# Les mutants survivants = cas non testés
```

---

## 8. Configuration Vitest {#config}

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: [
        "src/infrastructure/db/migrations/**",
        "src/**/*.d.ts",
        "src/**/index.ts",
      ],
    },
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
    exclude: ["tests/e2e/**"],
    setupFiles: ["./tests/setup.ts"],
  },
});
```

### Factories de test

```typescript
// tests/helpers/factories.ts — Données de test cohérentes
import { faker } from "@faker-js/faker";

export const createValidUserDto = (overrides?: Partial<CreateUserDto>): CreateUserDto => ({
  email: faker.internet.email() as Email,
  password: "Str0ng!P@ssword",
  name: faker.person.fullName(),
  ...overrides,
});

export const createExistingUser = (overrides?: Partial<UserProps>): User =>
  User.create({
    email: faker.internet.email() as Email,
    name: faker.person.fullName(),
    ...overrides,
  });
```
