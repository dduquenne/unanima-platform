# Architecture — Patterns pour applications métier TypeScript

## Table des matières
1. [Clean Architecture](#clean-architecture)
2. [Architecture Hexagonale](#hexagonale)
3. [Domain-Driven Design (DDD)](#ddd)
4. [CQRS](#cqrs)
5. [Event Sourcing](#event-sourcing)
6. [Modularité et Bounded Contexts](#modularity)

---

## 1. Clean Architecture {#clean-architecture}

### Principe des dépendances
Les dépendances pointent **vers l'intérieur** uniquement :
```
Présentation → Application → Domaine ← Infrastructure (inversé par IoC)
```

### Structure de projet recommandée

```
src/
├── domain/
│   ├── entities/           # Objets métier avec identité
│   ├── value-objects/      # Objets immuables sans identité
│   ├── aggregates/         # Racines d'agrégat + cohérence transactionnelle
│   ├── domain-events/      # Événements du domaine
│   ├── domain-services/    # Logique ne tenant pas dans une entité
│   ├── repositories/       # Interfaces (ports)
│   └── errors/             # DomainError hiérarchie
│
├── application/
│   ├── use-cases/          # Un fichier = un use case
│   ├── dtos/               # Data Transfer Objects d'entrée/sortie
│   ├── ports/              # Interfaces vers l'infrastructure
│   ├── mappers/            # Domain ↔ DTO
│   └── events/             # Handlers d'événements applicatifs
│
├── infrastructure/
│   ├── persistence/        # Implémentations repos (Drizzle, Prisma)
│   ├── http/               # Controllers, middlewares, routes
│   ├── messaging/          # BullMQ, Redis, RabbitMQ adapters
│   ├── email/              # Adapters email
│   ├── storage/            # S3, filesystem adapters
│   └── config/             # Composition root, DI, env
│
└── shared/
    ├── types/              # Types globaux, branded types
    ├── result/             # Result<T, E> monad
    ├── errors/             # AppError, HttpError
    └── utils/              # Fonctions pures utilitaires
```

---

## 2. Architecture Hexagonale (Ports & Adapters) {#hexagonale}

Le domaine est au centre, entouré de ports (interfaces) et d'adapters (implémentations).

### Ports entrants (driving)
```typescript
// application/ports/inbound/user-service.port.ts
interface UserServicePort {
  createUser(dto: CreateUserDto): Promise<Result<UserId, DomainError>>;
  updateProfile(id: UserId, dto: UpdateProfileDto): Promise<Result<void, DomainError>>;
  deleteUser(id: UserId): Promise<Result<void, DomainError>>;
}
```

### Ports sortants (driven)
```typescript
// application/ports/outbound/user-repository.port.ts
interface UserRepositoryPort {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

// application/ports/outbound/email-service.port.ts
interface EmailServicePort {
  sendWelcomeEmail(to: Email, name: string): Promise<void>;
  sendPasswordReset(to: Email, token: string): Promise<void>;
}
```

### Adapters
```typescript
// infrastructure/persistence/prisma-user.repository.ts
class PrismaUserRepository implements UserRepositoryPort {
  // Implémentation Prisma → traduction domain ↔ DB model
}

// infrastructure/http/user.controller.ts
class UserController {
  constructor(private readonly userService: UserServicePort) {}
  // HTTP → DTO → port entrant → réponse HTTP
}
```

---

## 3. Domain-Driven Design (DDD) {#ddd}

### Entités
```typescript
// domain/entities/user.entity.ts
class User {
  private constructor(
    readonly id: UserId,
    private _email: Email,
    private _profile: UserProfile,
    private _status: UserStatus,
    private readonly _createdAt: Date,
    private _domainEvents: DomainEvent[] = [],
  ) {}

  static create(props: CreateUserProps): User {
    const user = new User(
      UserId.create(crypto.randomUUID()),
      props.email,
      UserProfile.create(props.profile),
      UserStatus.PENDING_VERIFICATION,
      new Date(),
    );
    user._domainEvents.push(new UserCreatedEvent(user.id, user._email));
    return user;
  }

  activate(): Result<void, DomainError> {
    if (this._status !== UserStatus.PENDING_VERIFICATION) {
      return Result.err(new DomainError("INVALID_STATUS_TRANSITION"));
    }
    this._status = UserStatus.ACTIVE;
    this._domainEvents.push(new UserActivatedEvent(this.id));
    return Result.ok(undefined);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }
}
```

### Value Objects
```typescript
// domain/value-objects/money.vo.ts
class Money {
  private constructor(
    readonly amount: number,
    readonly currency: Currency,
  ) {
    if (amount < 0) throw new DomainError("NEGATIVE_AMOUNT");
    Object.freeze(this);
  }

  static of(amount: number, currency: Currency): Money {
    return new Money(Math.round(amount * 100) / 100, currency); // Précision 2 décimales
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new DomainError("CURRENCY_MISMATCH");
    return Money.of(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return Money.of(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
```

### Agrégats (cohérence transactionnelle)
```typescript
// domain/aggregates/order.aggregate.ts
// Un agrégat = une transaction = une unité de cohérence

class Order {
  private constructor(
    readonly id: OrderId,
    readonly customerId: CustomerId,
    private _items: OrderItem[],
    private _status: OrderStatus,
    private _events: DomainEvent[],
  ) {}

  addItem(product: Product, quantity: number): Result<void, DomainError> {
    if (this._status !== OrderStatus.DRAFT) {
      return Result.err(new DomainError("ORDER_NOT_EDITABLE"));
    }
    if (this._items.length >= 100) {
      return Result.err(new DomainError("MAX_ITEMS_REACHED"));
    }

    const existing = this._items.find(i => i.productId === product.id);
    if (existing) {
      existing.increaseQuantity(quantity);
    } else {
      this._items.push(OrderItem.create(product, quantity));
    }
    return Result.ok(undefined);
  }

  get total(): Money {
    return this._items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.of(0, Currency.EUR),
    );
  }
}
```

---

## 4. CQRS (Command Query Responsibility Segregation) {#cqrs}

Séparer les opérations d'écriture (Commands) des lectures (Queries).

### Commands
```typescript
// application/commands/create-order.command.ts
interface CreateOrderCommand {
  readonly type: "CREATE_ORDER";
  readonly customerId: string;
  readonly items: Array<{ productId: string; quantity: number }>;
}

// application/command-handlers/create-order.handler.ts
interface CommandHandler<TCommand, TResult> {
  handle(command: TCommand): Promise<Result<TResult, DomainError>>;
}

class CreateOrderCommandHandler implements CommandHandler<CreateOrderCommand, OrderId> {
  async handle(cmd: CreateOrderCommand): Promise<Result<OrderId, DomainError>> {
    // Validation, construction domaine, persistance, événements
  }
}
```

### Queries (lecture optimisée)
```typescript
// application/queries/get-order.query.ts
interface GetOrderQuery {
  readonly orderId: string;
}

// Read model dénormalisé, optimisé pour l'affichage
interface OrderReadModel {
  id: string;
  customerName: string;
  items: Array<{ productName: string; quantity: number; subtotal: number }>;
  total: number;
  status: string;
  createdAt: string;
}

// Peut requêter directement la DB sans passer par le domaine
class GetOrderQueryHandler {
  async handle(query: GetOrderQuery): Promise<OrderReadModel | null> {
    return this.db.query.orders.findFirst({ // Drizzle query builder
      where: eq(orders.id, query.orderId),
      with: { items: { with: { product: true } }, customer: true },
    });
  }
}
```

---

## 5. Event Sourcing {#event-sourcing}

L'état = la somme des événements passés. Adapté aux domaines avec audit fort.

```typescript
// domain/events/order-events.ts
type OrderEvent =
  | { type: "ORDER_CREATED"; orderId: string; customerId: string; createdAt: Date }
  | { type: "ITEM_ADDED"; orderId: string; productId: string; quantity: number }
  | { type: "ORDER_CONFIRMED"; orderId: string; confirmedAt: Date }
  | { type: "ORDER_CANCELLED"; orderId: string; reason: string };

// Reconstitution de l'état depuis les événements
function rehydrateOrder(events: OrderEvent[]): OrderState {
  return events.reduce(applyOrderEvent, initialOrderState);
}

function applyOrderEvent(state: OrderState, event: OrderEvent): OrderState {
  switch (event.type) {
    case "ORDER_CREATED":
      return { ...state, id: event.orderId, status: "DRAFT", items: [] };
    case "ITEM_ADDED":
      return { ...state, items: [...state.items, { productId: event.productId, quantity: event.quantity }] };
    case "ORDER_CONFIRMED":
      return { ...state, status: "CONFIRMED" };
    case "ORDER_CANCELLED":
      return { ...state, status: "CANCELLED" };
  }
}
```

---

## 6. Modularité et Bounded Contexts {#modularity}

Pour les grands projets, organiser par domaine métier :

```
src/
├── modules/
│   ├── users/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── index.ts          # API publique du module
│   ├── orders/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── index.ts
│   └── payments/
│       └── ...
├── shared/                   # Partagé entre modules (types, utils)
└── app.ts                    # Composition root
```

### Règle des modules
- Les modules ne s'importent qu'à travers leur `index.ts`
- Jamais d'import direct dans les sous-dossiers d'un autre module
- La communication inter-modules se fait par événements ou ports dédiés
