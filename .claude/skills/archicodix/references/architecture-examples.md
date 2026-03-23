# Exemples de Code Architecture — Patterns TypeScript

## Branded Types pour l'intégrité du domaine

```typescript
// Empêche les confusions de primitives identiques sémantiquement différentes
type UserId = string & { readonly __brand: "UserId" };
type OrderId = string & { readonly __brand: "OrderId" };
type Email = string & { readonly __brand: "Email" };
type PositiveAmount = number & { readonly __brand: "PositiveAmount" };

// Constructeurs avec validation
const UserId = {
  create: (raw: string): UserId => {
    if (!raw.match(/^[0-9a-f-]{36}$/)) throw new Error(`Invalid UserId: ${raw}`);
    return raw as UserId;
  },
  unsafe: (raw: string) => raw as UserId, // Uniquement pour les données de confiance (DB)
};

// Utilisation : le compilateur refuse le mélange de types
function getOrder(orderId: OrderId): Promise<Order> { ... }
getOrder(UserId.create("..."));  // ❌ Erreur de compilation
```

## Result Type pour la gestion d'erreurs explicite

```typescript
// Pattern Result / Either — pas d'exceptions inattendues
type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

const Result = {
  ok: <T>(value: T): Result<T, never> => ({ ok: true, value }),
  err: <E>(error: E): Result<never, E> => ({ ok: false, error }),
  map: <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
    r.ok ? Result.ok(fn(r.value)) : r,
  flatMap: <T, U, E>(r: Result<T, E>, fn: (v: T) => Result<U, E>): Result<U, E> =>
    r.ok ? fn(r.value) : r,
};

// Usage
async function createUser(dto: CreateUserDto): Promise<Result<User, DomainError>> {
  const email = validateEmail(dto.email);
  if (!email.ok) return email;

  const existing = await userRepo.findByEmail(email.value);
  if (existing) return Result.err(new DomainError("EMAIL_ALREADY_EXISTS"));

  return Result.ok(User.create({ email: email.value, ...dto }));
}
```

## Validation avec Zod (schémas comme source de vérité)

```typescript
import { z } from "zod";

// Schéma = validation + inférence de type + documentation
const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive().max(1000),
    unitPrice: z.number().positive(),
  })).min(1).max(100),
  deliveryDate: z.coerce.date().min(new Date()),
  notes: z.string().max(500).optional(),
});

type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

// Parse = validation sécurisée
function parseCreateOrder(raw: unknown): Result<CreateOrderDto, ValidationError> {
  const result = CreateOrderSchema.safeParse(raw);
  return result.success
    ? Result.ok(result.data)
    : Result.err(new ValidationError(result.error.format()));
}
```

## Repository Pattern (découplage DB)

```typescript
// Port (interface en application/)
interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// Adapter (infrastructure/) — Prisma exemple
class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.db.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }
  // ...
}
```

## Use Case Pattern (logique applicative isolée)

```typescript
interface CreateUserUseCase {
  execute(dto: CreateUserDto): Promise<Result<UserCreatedEvent, DomainError>>;
}

class CreateUserUseCaseImpl implements CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly events: EventPublisher,
  ) {}

  async execute(dto: CreateUserDto): Promise<Result<UserCreatedEvent, DomainError>> {
    // 1. Validation
    const parsed = parseCreateUserDto(dto);
    if (!parsed.ok) return parsed;

    // 2. Règle métier
    const exists = await this.users.findByEmail(parsed.value.email);
    if (exists) return Result.err(new DomainError("EMAIL_TAKEN"));

    // 3. Construction domaine
    const user = User.create(parsed.value, await this.hasher.hash(parsed.value.password));

    // 4. Persistance + événement
    await this.users.save(user);
    const event = new UserCreatedEvent(user);
    await this.events.publish(event);

    return Result.ok(event);
  }
}
```

## Dependency Injection (avec tsyringe ou inversify)

```typescript
import { injectable, inject } from "tsyringe";

@injectable()
class OrderService {
  constructor(
    @inject("OrderRepository") private readonly orders: OrderRepository,
    @inject("PaymentGateway") private readonly payments: PaymentGateway,
  ) {}
}

// Registration (composition root)
container.registerSingleton<OrderRepository>("OrderRepository", PrismaOrderRepository);
container.register<PaymentGateway>("PaymentGateway", StripePaymentGateway);
```

## Structure de test par use case (Vitest)

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;
  let userRepo: MockUserRepository;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    useCase = new CreateUserUseCaseImpl(
      userRepo,
      new BcryptPasswordHasher(),
      new InMemoryEventPublisher(),
    );
  });

  it("crée un utilisateur avec des données valides", async () => {
    const result = await useCase.execute(validDto);
    expect(result.ok).toBe(true);
    expect(userRepo.saved).toHaveLength(1);
  });

  it("rejette si l'email existe déjà", async () => {
    await userRepo.seed(existingUser);
    const result = await useCase.execute({ ...validDto, email: existingUser.email });
    expect(result.ok).toBe(false);
    expect(result.error.code).toBe("EMAIL_TAKEN");
  });
});
```

## Validation des variables d'environnement au démarrage

```typescript
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
});

export const env = EnvSchema.parse(process.env); // Crash au démarrage si invalide
```
